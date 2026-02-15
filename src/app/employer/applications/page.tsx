"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { applicationService } from "@/services/api";
import type { ApplicationResponseDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerApplicationsPage() {
    const { isAuthenticated, userRole, userId, loading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<ApplicationResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        if (isAuthenticated && userRole === "EMPLOYER" && userId) {
            fetchApplications();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    useEffect(() => {
        // ✅ Фильтруем отклики по statusName
        if (statusFilter === "ALL") {
            setFilteredApplications(applications);
        } else {
            setFilteredApplications(
                applications.filter((app) => app.statusName === statusFilter)
            );
        }
    }, [statusFilter, applications]);

    const fetchApplications = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            // ✅ Получаем только отклики для вакансий этого работодателя
            const response = await applicationService.getByEmployer(userId);
            setApplications(response);
            setFilteredApplications(response);
        } catch (error) {
            toast.error("Не удалось загрузить отклики");
            console.error("Fetch applications error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (applicationId: number) => {
        if (!confirm("Вы уверены, что хотите отклонить этот отклик?")) return;

        try {
            await applicationService.reject(applicationId);
            toast.success("Отклик отклонен");
            fetchApplications();
        } catch (error) {
            toast.error("Не удалось отклонить отклик");
        }
    };

    // ✅ ИСПРАВЛЕНО: Используем statusName вместо status
    const getStatusBadge = (statusName: string) => {
        const statusConfig: Record<string, {
            color: string;
            icon: React.ElementType;
            label: string;
        }> = {
            PENDING: {
                color: "bg-yellow-100 text-yellow-800",
                icon: Clock,
                label: "Ожидает",
            },
            ACCEPTED: {
                color: "bg-green-100 text-green-800",
                icon: CheckCircle,
                label: "Принято",
            },
            REJECTED: {
                color: "bg-red-100 text-red-800",
                icon: XCircle,
                label: "Отклонено",
            },
            WITHDRAWN: {
                color: "bg-gray-100 text-gray-800",
                icon: XCircle,
                label: "Отозвано",
            },
        };

        const config = statusConfig[statusName] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="h-4 w-4 mr-1" />
                {config.label}
            </span>
        );
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // ✅ ИСПРАВЛЕНО: Используем statusName для подсчета статистики
    const stats = {
        total: applications.length,
        pending: applications.filter((a) => a.statusName === "PENDING").length,
        accepted: applications.filter((a) => a.statusName === "ACCEPTED").length,
        rejected: applications.filter((a) => a.statusName === "REJECTED").length,
    };

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
                        Управление откликами
                    </h1>
                    <p className="text-gray-600">
                        Просматривайте и управляйте откликами кандидатов на ваши вакансии
                    </p>
                </motion.div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card hover className="bg-white shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            Всего откликов
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card hover className="bg-white shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            Ожидают
                                        </p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {stats.pending}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card hover className="bg-white shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            Принято
                                        </p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats.accepted}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card hover className="bg-white shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            Отклонено
                                        </p>
                                        <p className="text-3xl font-bold text-red-600">
                                            {stats.rejected}
                                        </p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                >
                    <Card className="bg-white shadow-md">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center">
                                    <Filter className="h-5 w-5 text-gray-600 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Фильтр по статусу:
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {["ALL", "PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"].map(
                                        (status) => (
                                            <Button
                                                key={status}
                                                variant={statusFilter === status ? "primary" : "outline"}
                                                size="sm"
                                                onClick={() => setStatusFilter(status)}
                                            >
                                                {status === "ALL"
                                                    ? "Все"
                                                    : status === "PENDING"
                                                        ? "Ожидают"
                                                        : status === "ACCEPTED"
                                                            ? "Принято"
                                                            : status === "REJECTED"
                                                                ? "Отклонено"
                                                                : "Отозвано"}
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Applications List */}
                {filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredApplications.map((application, index) => (
                            <motion.div
                                key={application.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card hover className="bg-white shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                            {/* Left Section - Application Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            Отклик #{application.id}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <User className="h-4 w-4 mr-1" />
                                                                Кандидат ID: {application.candidateId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(application.statusName)}
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                                        <Briefcase className="h-4 w-4 mr-2" />
                                                        <span className="font-medium">Вакансия ID:</span>
                                                        <span className="ml-2">{application.vacancyId}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        <span className="font-medium">Резюме ID:</span>
                                                        <span className="ml-2">{application.resumeId}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        <span className="font-medium">Дата отклика:</span>
                                                        <span className="ml-2">
                                                            {new Date(application.createdAt).toLocaleDateString("ru-RU")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section - Actions */}
                                            <div className="flex lg:flex-col gap-2">
                                                <Link
                                                    href={`/employer/resumes/${application.resumeId}`}
                                                    className="flex-1 lg:flex-none"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Резюме
                                                    </Button>
                                                </Link>

                                                {application.statusName === "PENDING" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50"
                                                        onClick={() => handleReject(application.id)}
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
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-white shadow-md">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {statusFilter === "ALL"
                                        ? "Откликов пока нет"
                                        : "Нет откликов с таким статусом"}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {statusFilter === "ALL"
                                        ? "Когда кандидаты откликнутся на ваши вакансии, они появятся здесь"
                                        : "Попробуйте выбрать другой фильтр"}
                                </p>
                                {statusFilter !== "ALL" && (
                                    <Button onClick={() => setStatusFilter("ALL")}>
                                        Показать все отклики
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}