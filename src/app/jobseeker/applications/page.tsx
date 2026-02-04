"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, XCircle, FileText, Building2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { applicationService, vacancyService } from "@/services/api";
import type { ApplicationResponseDto, VacancyDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { format } from "date-fns";

type ApplicationWithVacancy = ApplicationResponseDto & {
    vacancy?: VacancyDto;
};

export default function JobSeekerApplicationsPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationWithVacancy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated || userRole !== "JOB_SEEKER") {
            router.push("/auth/login");
            return;
        }

        if (userId) {
            fetchApplications();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchApplications = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const applicationsData = await applicationService.getByCandidate(userId);

            // Загружаем информацию о вакансиях
            const applicationsWithVacancies = await Promise.all(
                (applicationsData || []).map(async (app) => {
                    try {
                        const vacancy = await vacancyService.getById(app.vacancyId);
                        return { ...app, vacancy };
                    } catch {
                        return app;
                    }
                })
            );

            setApplications(applicationsWithVacancies);
        } catch (error) {
            console.error("Applications error:", error);
            toast.error("Не удалось загрузить отклики");
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (application: ApplicationResponseDto) => {
        if (!confirm("Вы уверены, что хотите отозвать этот отклик?")) return;

        try {
            await applicationService.withdraw({
                vacancyId: application.vacancyId,
                candidateId: application.candidateId,
                resumeId: application.resumeId,
                employerId: userId!,
            });

            toast.success("Отклик успешно отозван");
            fetchApplications();
        } catch (error) {
            toast.error(handleApiError(error));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "NEW":
                return "bg-blue-100 text-blue-700";
            case "REJECTED":
                return "bg-red-100 text-red-700";
            case "WITHDRAWN":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== "JOB_SEEKER") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Мои отклики
                    </h1>
                    <p className="text-gray-600">
                        Отслеживайте статус ваших откликов
                    </p>
                </motion.div>

                {/* Applications List */}
                {applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((application, index) => (
                            <motion.div
                                key={application.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card hover className="shadow-md hover:shadow-xl transition-all bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {application.vacancy?.title || `Вакансия #${application.vacancyId}`}
                                                        </h3>
                                                        {application.vacancy && (
                                                            <div className="flex items-center text-gray-600 mb-2">
                                                                <Building2 className="h-4 w-4 mr-2" />
                                                                <span>{application.vacancy.companyName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                            application.statusName
                                                        )}`}
                                                    >
                                                        {application.statusName}
                                                    </span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Дата отклика: {format(new Date(application.createdAt), "dd.MM.yyyy")}
                                                </div>

                                                {application.vacancy?.description && (
                                                    <p className="text-gray-700 mt-3 line-clamp-2">
                                                        {application.vacancy.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 md:min-w-[200px]">
                                                <Link href={`/jobseeker/vacancies/${application.vacancyId}`}>
                                                    <Button variant="outline" size="sm" className="w-full hover:bg-blue-50">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Посмотреть вакансию
                                                    </Button>
                                                </Link>

                                                <Link href={`/jobseeker/resumes/${application.resumeId}`}>
                                                    <Button variant="outline" size="sm" className="w-full hover:bg-green-50">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Посмотреть резюме
                                                    </Button>
                                                </Link>

                                                {application.statusName === "NEW" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleWithdraw(application)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Отозвать
                                                    </Button>
                                                )}
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
                        <Card className="shadow-xl bg-white">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Пока нет откликов
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Начните откликаться на вакансии, чтобы увидеть их здесь
                                </p>
                                <Link href="/jobseeker/vacancies">
                                    <Button className="shadow-md hover:shadow-lg transition-shadow">
                                        Просмотреть вакансии
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Statistics */}
                {applications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <Card className="shadow-md bg-white">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Всего откликов</p>
                                    <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-white">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Активные</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {applications.filter((app) => app.statusName === "NEW").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-white">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Отозванные</p>
                                    <p className="text-3xl font-bold text-gray-600">
                                        {applications.filter((app) => app.statusName === "WITHDRAWN").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}