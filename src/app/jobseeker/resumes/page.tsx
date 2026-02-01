"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { resumeService } from "@/services/api";
import type { ResumeDto } from "@/types";
import toast from "react-hot-toast";

export default function ResumesListPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "JOB_SEEKER")) {
            router.push("/auth/login");
            return;
        }

        if (isAuthenticated && userRole === "JOB_SEEKER" && userId) {
            fetchResumes();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchResumes = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const data = await resumeService.getByUser(userId);
            setResumes(data);
        } catch (error) {
            toast.error("Failed to load resumes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this resume?")) return;

        try {
            await resumeService.delete(id);
            toast.success("Resume deleted successfully");
            fetchResumes();
        } catch (error) {
            toast.error("Failed to delete resume");
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Resumes
                        </h1>
                        <p className="text-gray-600">
                            Manage your resumes and apply to jobs
                        </p>
                    </div>
                    <Link href="/jobseeker/resumes/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Resume
                        </Button>
                    </Link>
                </motion.div>

                {/* Resumes Grid */}
                {resumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume, index) => (
                            <motion.div
                                key={resume.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{resume.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {resume.experienceYears !== undefined && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Experience:</span> {resume.experienceYears} years
                                                </p>
                                            )}

                                            {resume.contactEmail && (
                                                <p className="text-sm text-gray-600 truncate">
                                                    <span className="font-medium">Email:</span> {resume.contactEmail}
                                                </p>
                                            )}

                                            {resume.summary && (
                                                <p className="text-sm text-gray-700 line-clamp-3">
                                                    {resume.summary}
                                                </p>
                                            )}

                                            <div className="flex gap-2 pt-4 border-t">
                                                <Link href={`/jobseeker/resumes/${resume.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={`/jobseeker/resumes/${resume.id}/edit`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(resume.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No resumes yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first resume to start applying for jobs
                                </p>
                                <Link href="/jobseeker/resumes/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Resume
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}