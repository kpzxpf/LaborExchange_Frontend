"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    FileText,
    Send,
    CheckCircle,
    Plus,
    Search,
    Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { vacancyService, resumeService, applicationService } from "@/services/api";
import type { VacancyDto, ResumeDto, ApplicationResponseDto } from "@/types";
import toast from "react-hot-toast";

export default function JobSeekerDashboard() {
    const { userRole, userId, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "JOB_SEEKER")) {
            router.push("/auth/login");
            return;
        }

        const fetchData = async () => {
            if (!userId) return;

            try {
                const [vacanciesRes, resumesRes, applicationsRes] = await Promise.all([
                    vacancyService.getAll(0, 5),
                    resumeService.getByUser(userId),
                    applicationService.getByCandidate(userId),
                ]);

                setVacancies(vacanciesRes.content);
                setResumes(resumesRes);
                setApplications(applicationsRes);
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && userRole === "JOB_SEEKER" && userId) {
            fetchData();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    const stats = [
        {
            title: "Available Jobs",
            value: vacancies.length,
            icon: Briefcase,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "My Resumes",
            value: resumes.length,
            icon: FileText,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Applications Sent",
            value: applications.length,
            icon: Send,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Active Applications",
            value: applications.filter(app => app.statusName === "NEW").length,
            icon: CheckCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Job Seeker Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Find opportunities and manage your applications
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Get started with these common tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/jobseeker/vacancies">
                                    <Button className="w-full" size="lg">
                                        <Search className="h-5 w-5 mr-2" />
                                        Browse Jobs
                                    </Button>
                                </Link>
                                <Link href="/jobseeker/resumes/create">
                                    <Button variant="secondary" className="w-full" size="lg">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create Resume
                                    </Button>
                                </Link>
                                <Link href="/jobseeker/applications">
                                    <Button variant="outline" className="w-full" size="lg">
                                        <FileText className="h-5 w-5 mr-2" />
                                        My Applications
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Latest Vacancies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Latest Job Openings</CardTitle>
                                    <CardDescription>New opportunities for you</CardDescription>
                                </div>
                                <Link href="/jobseeker/vacancies">
                                    <Button variant="ghost" size="sm">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {vacancies.length > 0 ? (
                                <div className="space-y-4">
                                    {vacancies.map((vacancy) => (
                                        <div
                                            key={vacancy.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {vacancy.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {vacancy.companyName}
                                                </p>
                                                {vacancy.salary && (
                                                    <p className="text-sm text-green-600 font-medium mt-1">
                                                        ${vacancy.salary.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Link href={`/jobseeker/vacancies/${vacancy.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No jobs available
                                    </h3>
                                    <p className="text-gray-600">
                                        Check back later for new opportunities
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}