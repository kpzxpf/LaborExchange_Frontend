"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle, XCircle, FileText, User, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { applicationService, vacancyService, resumeService } from "@/services/api";
import type { ApplicationResponseDto, VacancyDto, ResumeDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type ApplicationWithDetails = ApplicationResponseDto & {
    vacancy?: VacancyDto;
    resume?: ResumeDto;
};

const STATUS_LABELS: Record<string, string> = {
    ALL: "Все",
    NEW: "Новые",
    REJECTED: "Отклоненные",
    WITHDRAWN: "Отозванные"
};

export default function EmployerApplicationsPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "NEW" | "REJECTED" | "WITHDRAWN">("ALL");

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        if (isAuthenticated && userRole === "EMPLOYER" && userId) {
            fetchApplications();
        }
    }, [isAuthenticated, userRole, userId, loading, router, filter]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            let applicationsData: ApplicationResponseDto[];

            if (filter === "ALL") {
                await applicationService.getStatistics();
                applicationsData = await applicationService.getByStatus("NEW");
            } else {
                applicationsData = await applicationService.getByStatus(filter);
            }

            const applicationsWithDetails = await Promise.all(
                applicationsData.map(async (app) => {
                    try {
                        const [vacancy, resume] = await Promise.all([
                            vacancyService.getById(app.vacancyId),
                            resumeService.getById(app.resumeId),
                        ]);
                        return { ...app, vacancy, resume };
                    } catch {
                        return app;
                    }
                })
            );

            setApplications(applicationsWithDetails);
        } catch (error) {
            toast.error("Не удалось загрузить отклики");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (application: ApplicationResponseDto) => {
        if (!confirm("Вы уверены, что хотите отклонить этот отклик?")) return;

        try {
            await applicationService.reject({
                vacancyId: application.vacancyId,
                candidateId: application.candidateId,
                resumeId: application.resumeId,
                employerId: userId!,
            });

            toast.success("Отклик отклонен");
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

    const filteredApplications = applications.filter((app) => {
        if (filter === "ALL") return true;
        return app.statusName === filter;
    });

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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Отклики на вакансии
                    </h1>
                    <p className="text-gray-600">
                        Просматривайте и управляйте откликами на ваши вакансии
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {["ALL", "NEW", "REJECTED", "WITHDRAWN"].map((status) => (
                                    <Button
                                        key={status}
                                        variant={filter === status ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => setFilter(status as typeof filter)}
                                    >
                                        {STATUS_LABELS[status]}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredApplications.map((application, index) => (
                            <motion.div
                                key={application.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card hover>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {application.vacancy?.title || `Вакансия #${application.vacancyId}`}
                                                        </h3>
                                                        {application.resume && (
                                                            <p className="text-gray-600 mb-2">
                                                                <User className="inline h-4 w-4 mr-1" />
                                                                Отклик с резюме: {application.resume.title}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                            application.statusName
                                                        )}`}
                                                    >
                                                        {STATUS_LABELS[application.statusName] || application.statusName}
                                                    </span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Дата отклика: {format(new Date(application.createdAt), "dd MMM yyyy", { locale: ru })}
                                                </div>

                                                {application.resume?.summary && (
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-900 mb-2">
                                                            О кандидате:
                                                        </p>
                                                        <p className="text-gray-700 line-clamp-3">
                                                            {application.resume.summary}
                                                        </p>
                                                    </div>
                                                )}

                                                {application.resume?.experienceYears !== undefined && (
                                                    <p className="text-sm text-gray-600 mt-3">
                                                        <span className="font-medium">Опыт работы:</span>{" "}
                                                        {application.resume.experienceYears} лет
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 lg:min-w-[220px]">
                                                <Link href={`/employer/vacancies/${application.vacancyId}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Посмотреть вакансию
                                                    </Button>
                                                </Link>

                                                <Link href={`/jobseeker/resumes/${application.resumeId}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Посмотреть резюме
                                                    </Button>
                                                </Link>

                                                {application.statusName === "NEW" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(application)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Отклонить
                                                        </Button>
                                                    </>
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
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Отклики не найдены
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {filter === "ALL"
                                        ? "Вы еще не получили ни одного отклика"
                                        : `Нет откликов со статусом "${STATUS_LABELS[filter].toLowerCase()}"`}
                                </p>
                                <Link href="/employer/vacancies">
                                    <Button>Мои вакансии</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {applications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Всего</p>
                                    <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Новые</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {applications.filter((app) => app.statusName === "NEW").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Отклоненные</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {applications.filter((app) => app.statusName === "REJECTED").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
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