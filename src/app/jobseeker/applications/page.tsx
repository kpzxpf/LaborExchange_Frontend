"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Briefcase,
    Building2,
    MapPin,
    Search,
    Loader2,
    Clock,
    Eye,
    Trash2,
    DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
    APPLICATION_STATUS,
    getStatusColor,
    getStatusBadgeClasses,
    getStatusIcon,
} from "@/constants/status";

interface Application {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    companyName: string;
    location?: string;
    salary?: number | null;
    statusName: string;
    createdAt: string;
}

export default function JobSeekerApplicationsPage() {
    const router = useRouter();
    const { userId } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    useEffect(() => {
        if (userId) {
            loadApplications();
        }
    }, [userId]);

    useEffect(() => {
        filterApplications();
    }, [applications, searchQuery, selectedStatus]);

    const loadApplications = async () => {
        try {
            setIsLoading(true);
            const data = await applicationService.getMy();
            setApplications(Array.isArray(data) ? (data as unknown as Application[]) : []);
        } catch (error) {
            console.error("Failed to load applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = applications;

        // FIXED: Use Russian status names from DATABASE
        if (selectedStatus !== "all") {
            filtered = filtered.filter((app) => app.statusName === selectedStatus);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.vacancyTitle.toLowerCase().includes(query) ||
                    app.companyName.toLowerCase().includes(query)
            );
        }

        setFilteredApplications(filtered);
    };

    const handleWithdraw = async (applicationId: number) => {
        if (!confirm("Вы уверены, что хотите отозвать заявку?")) {
            return;
        }

        try {
            await applicationService.withdraw(applicationId);
            await loadApplications();
        } catch (error) {
            console.error("Failed to withdraw application:", error);
            alert("Не удалось отозвать заявку");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // FIXED: Use correct Russian status names
    const statusCounts = {
        all: applications.length,
        [APPLICATION_STATUS.NEW]: applications.filter(
            (a) => a.statusName === APPLICATION_STATUS.NEW
        ).length,
        [APPLICATION_STATUS.REJECTED]: applications.filter(
            (a) => a.statusName === APPLICATION_STATUS.REJECTED
        ).length,
        [APPLICATION_STATUS.WITHDRAWN]: applications.filter(
            (a) => a.statusName === APPLICATION_STATUS.WITHDRAWN
        ).length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-4"
                    >
                        <Loader2 className="w-12 h-12 text-purple-600" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">Загрузка заявок...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
            >
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Мои заявки
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {applications.length} заявок всего
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по вакансии или компании..."
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                    "bg-white dark:bg-gray-700",
                                    "border-gray-200 dark:border-gray-600",
                                    "text-gray-900 dark:text-gray-100",
                                    "placeholder:text-gray-400"
                                )}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-2 mt-4 overflow-x-auto pb-2"
                    >
                        {[
                            { value: "all", label: "Все", icon: "📋" },
                            { value: APPLICATION_STATUS.NEW, label: "Активные", icon: getStatusIcon(APPLICATION_STATUS.NEW) },
                            { value: APPLICATION_STATUS.REJECTED, label: "Отклонённые", icon: getStatusIcon(APPLICATION_STATUS.REJECTED) },
                            { value: APPLICATION_STATUS.WITHDRAWN, label: "Отозванные", icon: getStatusIcon(APPLICATION_STATUS.WITHDRAWN) },
                        ].map((status) => {
                            const count = statusCounts[status.value as keyof typeof statusCounts];
                            const isActive = selectedStatus === status.value;

                            return (
                                <motion.button
                                    key={status.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedStatus(status.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <span>{status.icon}</span>
                                    <span>{status.label}</span>
                                    <span
                                        className={cn(
                                            "px-2 py-0.5 rounded-full text-xs",
                                            isActive
                                                ? "bg-white/20"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        )}
                                    >
                    {count}
                  </span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            </motion.div>

            {/* Applications List */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredApplications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Заявок не найдено
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery
                                ? "Попробуйте изменить поисковый запрос"
                                : "Откликайтесь на вакансии, чтобы найти работу!"}
                        </p>
                        {!searchQuery && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push("/jobseeker/vacancies")}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Искать вакансии
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredApplications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                                    {app.vacancyTitle.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                                        {app.vacancyTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="truncate">{app.companyName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                {app.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{app.location}</span>
                                                    </div>
                                                )}
                                                {app.salary && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>{app.salary.toLocaleString()} ₽</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDate(app.createdAt)}</span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-sm font-medium",
                                                        getStatusBadgeClasses(app.statusName)
                                                    )}
                                                >
                          {getStatusIcon(app.statusName)} {app.statusName}
                        </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => router.push(`/jobseeker/vacancies/${app.vacancyId}`)}
                                                className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                title="Просмотреть вакансию"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </motion.button>

                                            {app.statusName === APPLICATION_STATUS.NEW && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleWithdraw(app.id)}
                                                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                    title="Отозвать заявку"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}