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
    Clock,
    Eye,
    Trash2,
    DollarSign,
    ChevronDown,
    MessageSquare,
} from "lucide-react";
import { applicationService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
    APPLICATION_STATUS,
    getStatusBadgeClasses,
    getStatusIcon,
} from "@/constants/status";
import { toast } from "sonner";

interface Application {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    companyName: string;
    location?: string;
    salary?: number | null;
    statusName: string;
    coverLetter?: string;
    createdAt: string;
}

function ApplicationsSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-5 w-1/2 rounded-lg" />
                            <div className="skeleton h-4 w-1/3 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="skeleton h-4 w-24 rounded-lg" />
                        <div className="skeleton h-4 w-20 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function JobSeekerApplicationsPage() {
    const router = useRouter();
    const { userId } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        if (userId) loadApplications();
    }, [userId]);

    useEffect(() => {
        filterApplications();
    }, [applications, searchQuery, selectedStatus]);

    const loadApplications = async () => {
        try {
            setIsLoading(true);
            const data = await applicationService.getMy();
            setApplications(Array.isArray(data) ? (data as unknown as Application[]) : []);
        } catch {
            toast.error("Не удалось загрузить заявки");
        } finally {
            setIsLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = applications;
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
        if (!confirm("Вы уверены, что хотите отозвать заявку?")) return;
        // Optimistic: update status immediately
        const prevStatus = applications.find(a => a.id === applicationId)?.statusName ?? APPLICATION_STATUS.NEW;
        setApplications(prev =>
            prev.map(a => a.id === applicationId ? { ...a, statusName: APPLICATION_STATUS.WITHDRAWN } : a)
        );
        try {
            await applicationService.withdraw(applicationId);
            toast.success("Заявка отозвана");
        } catch {
            // Rollback
            setApplications(prev =>
                prev.map(a => a.id === applicationId ? { ...a, statusName: prevStatus } : a)
            );
            toast.error("Не удалось отозвать заявку");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const statusCounts = {
        all: applications.length,
        [APPLICATION_STATUS.NEW]: applications.filter((a) => a.statusName === APPLICATION_STATUS.NEW).length,
        [APPLICATION_STATUS.REJECTED]: applications.filter((a) => a.statusName === APPLICATION_STATUS.REJECTED).length,
        [APPLICATION_STATUS.WITHDRAWN]: applications.filter((a) => a.statusName === APPLICATION_STATUS.WITHDRAWN).length,
    };

    const statusFilters = [
        { value: "all", label: "Все", icon: "📋" },
        { value: APPLICATION_STATUS.NEW, label: "Активные", icon: getStatusIcon(APPLICATION_STATUS.NEW) },
        { value: APPLICATION_STATUS.REJECTED, label: "Отклонённые", icon: getStatusIcon(APPLICATION_STATUS.REJECTED) },
        { value: APPLICATION_STATUS.WITHDRAWN, label: "Отозванные", icon: getStatusIcon(APPLICATION_STATUS.WITHDRAWN) },
    ];

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b" style={{ background: "rgb(var(--bg))", borderColor: "var(--card-border)" }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <FileText className="w-5 h-5" style={{ color: "rgb(99,102,241)" }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>Мои заявки</h1>
                                <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>{applications.length} заявок всего</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(var(--text-3))" }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по вакансии или компании..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: "rgb(var(--card-bg))",
                                    border: "1px solid var(--card-border)",
                                    color: "rgb(var(--text-1))",
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Status filters */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {statusFilters.map((status) => {
                            const count = statusCounts[status.value as keyof typeof statusCounts];
                            const isActive = selectedStatus === status.value;
                            return (
                                <button
                                    key={status.value}
                                    onClick={() => setSelectedStatus(status.value)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                                    style={isActive ? {
                                        background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
                                        color: "#fff",
                                        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                                    } : {
                                        background: "rgb(var(--card-bg))",
                                        border: "1px solid var(--card-border)",
                                        color: "rgb(var(--text-2))",
                                    }}
                                >
                                    <span>{status.icon}</span>
                                    <span>{status.label}</span>
                                    <span className="px-1.5 py-0.5 rounded-full text-xs"
                                        style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.1)", color: isActive ? "#fff" : "rgb(99,102,241)" }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <ApplicationsSkeleton />
                ) : filteredApplications.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-box">
                            <Briefcase className="h-8 w-8" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-1))" }}>
                            {searchQuery ? "Заявок не найдено" : "Заявок пока нет"}
                        </h3>
                        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                            {searchQuery
                                ? "Попробуйте изменить поисковый запрос"
                                : "Откликайтесь на вакансии, чтобы найти работу!"}
                        </p>
                        {!searchQuery && (
                            <button onClick={() => router.push("/jobseeker/vacancies")} className="btn-primary mx-auto">
                                Искать вакансии
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredApplications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -60 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -2 }}
                                    className="card p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Avatar */}
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base"
                                                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                                                    {app.vacancyTitle.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base truncate" style={{ color: "rgb(var(--text-1))" }}>
                                                        {app.vacancyTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        <span className="truncate">{app.companyName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                                {app.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span>{app.location}</span>
                                                    </div>
                                                )}
                                                {app.salary && (
                                                    <span className="badge badge-emerald">
                                                        {app.salary.toLocaleString()} ₽
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{formatDate(app.createdAt)}</span>
                                                </div>
                                                <span className={getStatusBadgeClasses(app.statusName)}>
                                                    {getStatusIcon(app.statusName)} {app.statusName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {app.coverLetter && (
                                                <button
                                                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                                                    className="p-2 rounded-xl transition-all"
                                                    style={{ color: "rgb(var(--text-3))" }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)";
                                                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))";
                                                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                                    }}
                                                    title="Сопроводительное письмо"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/jobseeker/vacancies/${app.vacancyId}`)}
                                                className="p-2 rounded-xl transition-all"
                                                style={{ color: "rgb(var(--text-3))" }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)";
                                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))";
                                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                                }}
                                                title="Просмотреть вакансию"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {app.statusName === APPLICATION_STATUS.NEW && (
                                                <button
                                                    onClick={() => handleWithdraw(app.id)}
                                                    className="p-2 rounded-xl text-[rgb(var(--text-3))] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                    title="Отозвать заявку"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === app.id && app.coverLetter && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                        <span className="text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                                            Сопроводительное письмо
                                                        </span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "rgb(var(--text-2))" }}>
                                                        {app.coverLetter}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
