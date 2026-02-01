"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, DollarSign, Send, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { vacancyService, resumeService, applicationService } from "@/services/api";
import type { VacancyDto, ResumeDto, ApplicationRequestDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function VacancyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const [vacancy, setVacancy] = useState<VacancyDto | null>(null);
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        if (params.id) {
            fetchData();
        }
    }, [params.id, isAuthenticated, userId, loading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const vacancyId = Number(params.id);
            const vacancyData = await vacancyService.getById(vacancyId);
            setVacancy(vacancyData);

            // Загружаем резюме только для соискателей
            if (userRole === "JOB_SEEKER" && userId) {
                const resumesData = await resumeService.getByUser(userId);
                setResumes(resumesData);
                if (resumesData.length > 0) {
                    setSelectedResumeId(resumesData[0].id);
                }
            }
        } catch (error) {
            toast.error("Failed to load vacancy");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!vacancy || !userId || !selectedResumeId) {
            toast.error("Please select a resume");
            return;
        }

        setIsApplying(true);
        try {
            const applicationData: ApplicationRequestDto = {
                vacancyId: vacancy.id,
                employerId: vacancy.employerId,
                candidateId: userId,
                resumeId: selectedResumeId,
            };

            await applicationService.create(applicationData);
            toast.success("Application submitted successfully!");
            setShowApplyModal(false);
            router.push("/jobseeker/applications");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsApplying(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!vacancy) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href={userRole === "JOB_SEEKER" ? "/jobseeker/vacancies" : "/employer/vacancies"}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Vacancies
                        </Button>
                    </Link>
                </motion.div>

                {/* Vacancy Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6">
                        <CardContent className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {vacancy.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center text-gray-700">
                                    <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                                    <span className="font-medium">{vacancy.companyName}</span>
                                </div>

                                {vacancy.salary && vacancy.salary > 0 && (
                                    <div className="flex items-center text-green-600 font-semibold">
                                        <DollarSign className="h-5 w-5 mr-1" />
                                        <span>${vacancy.salary.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Job Description
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {vacancy.description}
                                </p>
                            </div>

                            {userRole === "JOB_SEEKER" && (
                                <div className="pt-6 border-t mt-6">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={resumes.length === 0}
                                    >
                                        <Send className="h-5 w-5 mr-2" />
                                        Apply for this Position
                                    </Button>
                                    {resumes.length === 0 && (
                                        <p className="text-center text-sm text-gray-600 mt-3">
                                            You need to{" "}
                                            <Link
                                                href="/jobseeker/resumes/create"
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                create a resume
                                            </Link>{" "}
                                            before applying
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Apply Modal */}
                {showApplyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowApplyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl max-w-md w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Apply to {vacancy.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Resume
                                            </label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                value={selectedResumeId || ""}
                                                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                            >
                                                {resumes.map((resume) => (
                                                    <option key={resume.id} value={resume.id}>
                                                        {resume.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                className="flex-1"
                                                onClick={handleApply}
                                                isLoading={isApplying}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Submit Application
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowApplyModal(false)}
                                                disabled={isApplying}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}