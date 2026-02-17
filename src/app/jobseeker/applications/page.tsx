"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, XCircle, FileText, Building2, Calendar, Briefcase, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { applicationService } from "@/services/api";
import type {ApplicationRequestDto, ApplicationResponseDto} from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function JobSeekerApplicationsPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "JOB_SEEKER") {
            router.push("/auth/login");
            return;
        }
        if (userId) fetchApplications();
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchApplications = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await applicationService.getByCandidate(userId);
            setApplications(data || []);
        } catch (error) {
            console.error("Ошибка загрузки откликов:", error);
            toast.error("Не удалось загрузить отклики");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (app: ApplicationResponseDto) => {
        if (!confirm("Вы уверены, что хотите отозвать отклик?")) return;

        try {
            await applicationService.withdraw({
                id: app.id,
                vacancyId: app.vacancyId,
                candidateId: app.candidateId,
                resumeId: app.resumeId,
                employerId: app.employerId,
            });
            toast.success("Отклик успешно отозван");
            fetchApplications();
        } catch (err) {
            console.error("Ошибка при отзыве:", err);
            toast.error(handleApiError(err));
        }
    };

    // Исправлено: маппинг на русские названия из твоей БД
    const getStatusInfo = (status: string = "") => {
        const s = (status || "").trim();
        switch (s) {
            case "Новый":
                return { label: "Новый", color: "bg-blue-100 text-blue-800 border border-blue-200", icon: Clock };
            case "Отказ":
                return { label: "Отказ", color: "bg-red-100 text-red-800 border border-red-200", icon: XCircle };
            case "Отозван":
                return { label: "Отозван", color: "bg-gray-200 text-gray-700 border border-gray-300", icon: XCircle };
            default:
                return { label: s || "—", color: "bg-gray-100 text-gray-600", icon: Clock };
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои отклики</h1>
                    <p className="text-gray-600">Отслеживайте статус ваших ваших обращений</p>
                </motion.div>

                {applications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold mb-4">У вас пока нет откликов</h3>
                        <p className="text-gray-600 mb-8">Начните откликаться на вакансии прямо сейчас</p>
                        <Link href="/jobseeker/vacancies">
                            <Button size="lg" className="shadow-md">Просмотреть вакансии</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((app, idx) => {
                            const status = getStatusInfo(app.statusName);
                            // Исправлено: проверка на русское значение
                            const isNew = (app.statusName || "").trim() === "Новый";

                            return (
                                <motion.div
                                    key={app.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="bg-white shadow-md hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900">
                                                                {app.vacancyTitle || `Вакансия #${app.vacancyId}`}
                                                            </h3>
                                                            {app.companyName && (
                                                                <div className="flex items-center text-gray-700 mt-1">
                                                                    <Building2 className="h-4 w-4 mr-1.5" />
                                                                    {app.companyName}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="h-4 w-4 text-gray-500" />
                                                            Резюме: {app.resumeTitle || `ID ${app.resumeId}`}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            {new Date(app.createdAt).toLocaleString("ru-RU")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 min-w-[180px]">
                                                    <Link href={`/jobseeker/vacancies/${app.vacancyId}`}>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Вакансия
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/jobseeker/resumes/${app.resumeId}`}>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Моё резюме
                                                        </Button>
                                                    </Link>

                                                    {isNew && (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => handleWithdraw(app)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Отозвать отклик
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}