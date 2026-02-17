"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, User, Calendar, Clock, XCircle, Filter, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { applicationService } from "@/services/api";
import type { ApplicationResponseDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerApplicationsPage() {
    const { isAuthenticated, userRole, userId, loading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [filtered, setFiltered] = useState<ApplicationResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ВСЕ");

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "EMPLOYER") {
            router.push("/auth/login");
            return;
        }
        if (userId) fetchApplications();
    }, [isAuthenticated, userRole, userId, loading, router]);

    useEffect(() => {
        if (statusFilter === "ВСЕ") {
            setFiltered(applications);
        } else {
            setFiltered(applications.filter(a => (a.statusName || "").trim() === statusFilter));
        }
    }, [statusFilter, applications]);

    const fetchApplications = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await applicationService.getByEmployer(userId);
            setApplications(data || []);
            setFiltered(data || []);
        } catch (err) {
            console.error("Ошибка загрузки откликов:", err);
            toast.error("Не удалось загрузить отклики");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (app: ApplicationResponseDto) => {
        if (!confirm(`Отклонить отклик от ${app.candidateName || "кандидата"}?`)) return;
        try {
            await applicationService.reject({
                id: app.id,
                vacancyId: app.vacancyId,
                candidateId: app.candidateId,
                resumeId: app.resumeId,
                employerId: userId!,
            });
            toast.success("Отклик отклонён");
            fetchApplications();
        } catch (err) {
            toast.error("Не удалось отклонить отклик");
            console.error(err);
        }
    };

    const getStatusInfo = (status: string = "") => {
        const s = (status || "").trim();
        switch (s) {
            case "Новый":
                return { label: "Новый", color: "bg-blue-100 text-blue-800", icon: Clock };
            case "Отказ":
                return { label: "Отказ", color: "bg-red-100 text-red-800", icon: XCircle };
            case "Отозван":
                return { label: "Отозван", color: "bg-gray-200 text-gray-700", icon: XCircle };
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

    const stats = {
        total: applications.length,
        new: applications.filter(a => a.statusName === "Новый").length,
        rejected: applications.filter(a => a.statusName === "Отказ").length,
        withdrawn: applications.filter(a => a.statusName === "Отозван").length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление откликами</h1>
                    <p className="text-gray-600">Просматривайте и управляйте откликами кандидатов</p>
                </motion.div>

                {/* Карточки статистики */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Всего", val: stats.total, color: "text-gray-900" },
                        { label: "Новые", val: stats.new, color: "text-blue-600" },
                        { label: "Отказы", val: stats.rejected, color: "text-red-600" },
                        { label: "Отозвано", val: stats.withdrawn, color: "text-gray-600" }
                    ].map((s, i) => (
                        <Card key={i} className="bg-white shadow-sm border-none">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                                <p className={`text-4xl font-bold ${s.color}`}>{s.val}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Панель фильтров */}
                <div className="mb-8 flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mr-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-700">Статус:</span>
                    </div>
                    {["ВСЕ", "Новый", "Отказ", "Отозван"].map(status => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "primary" : "outline"}
                            size="sm"
                            className="rounded-full px-6"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "ВСЕ" ? "Все" : status}
                        </Button>
                    ))}
                </div>

                {/* Список откликов */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">Список пуст</h3>
                        <p className="text-gray-500 mt-2">Нет откликов для отображения</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((app, idx) => {
                            const st = getStatusInfo(app.statusName);
                            const Icon = st.icon;
                            const isNew = (app.statusName || "").trim() === "Новый";

                            return (
                                <motion.div
                                    key={app.id || `${app.vacancyId}-${app.candidateId}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {app.vacancyTitle || `Вакансия #${app.vacancyId}`}
                                                        </h3>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${st.color}`}>
                                                            <Icon className="h-3 w-3" />
                                                            {st.label}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-blue-500" />
                                                            <span className="font-medium text-gray-900">Кандидат:</span>
                                                            {app.candidateName || `ID ${app.candidateId}`}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-purple-500" />
                                                            <span className="font-medium text-gray-900">Дата:</span>
                                                            {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-48">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 justify-center"
                                                        onClick={() => router.push(`/employer/resumes/${app.resumeId}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Резюме
                                                    </Button>

                                                    {isNew && (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-1 justify-center"
                                                            onClick={() => handleReject(app)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Отклонить
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