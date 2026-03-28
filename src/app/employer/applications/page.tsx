"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Clock, Eye, XCircle, CheckCircle, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { APPLICATION_STATUS, getStatusBadgeClasses, getStatusIcon } from "@/constants/status";
import { toast } from "sonner";

interface Application {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    candidateId: number;
    candidateName: string;
    resumeId: number;
    statusName: string;   // human-readable: "Новый", "Принят", etc.
    statusCode: string;   // machine code: "NEW", "ACCEPTED", etc.
    coverLetter?: string;
    createdAt: string;
}

// ─── Skeleton ────────────────────────────────────────────────────
function AppSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-5 w-1/2 rounded-lg" />
                            <div className="skeleton h-4 w-1/3 rounded-lg" />
                        </div>
                        <div className="skeleton h-8 w-24 rounded-xl" />
                    </div>
                    <div className="flex gap-3">
                        <div className="skeleton h-4 w-28 rounded-lg" />
                        <div className="skeleton h-5 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main page ───────────────────────────────────────────────────
export default function EmployerApplicationsPage() {
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
            const data = await applicationService.getByEmployer(userId!);
            const sorted = (Array.isArray(data) ? (data as unknown as Application[]) : [])
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setApplications(sorted);
        } catch {
            toast.error("Не удалось загрузить заявки");
        } finally {
            setIsLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = applications;
        if (selectedStatus !== "all") {
            filtered = filtered.filter(app => (app.statusCode ?? app.statusName) === selectedStatus);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                app => app.vacancyTitle?.toLowerCase().includes(q) || app.candidateName?.toLowerCase().includes(q)
            );
        }
        setFilteredApplications(filtered);
    };

    const updateStatusOptimistic = (appId: number, newCode: string) => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, statusCode: newCode } : a));
    };

    const rollbackStatus = (appId: number, oldCode: string) => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, statusCode: oldCode } : a));
    };

    const handleReject = async (appId: number) => {
        const old = applications.find(a => a.id === appId)?.statusCode ?? APPLICATION_STATUS.NEW;
        updateStatusOptimistic(appId, APPLICATION_STATUS.REJECTED);
        try {
            await applicationService.reject(appId);
            toast.success("Заявка отклонена");
        } catch {
            rollbackStatus(appId, old);
            toast.error("Не удалось отклонить заявку");
        }
    };

    const handleAccept = async (appId: number) => {
        const old = applications.find(a => a.id === appId)?.statusCode ?? APPLICATION_STATUS.NEW;
        updateStatusOptimistic(appId, APPLICATION_STATUS.ACCEPTED);
        try {
            await applicationService.accept(appId);
            toast.success("Заявка принята");
        } catch {
            rollbackStatus(appId, old);
            toast.error("Не удалось принять заявку");
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

    const getCode = (app: Application) => app.statusCode ?? app.statusName;

    const statusCounts = {
        all: applications.length,
        [APPLICATION_STATUS.NEW]: applications.filter(a => getCode(a) === APPLICATION_STATUS.NEW).length,
        [APPLICATION_STATUS.ACCEPTED]: applications.filter(a => getCode(a) === APPLICATION_STATUS.ACCEPTED).length,
        [APPLICATION_STATUS.REJECTED]: applications.filter(a => getCode(a) === APPLICATION_STATUS.REJECTED).length,
        [APPLICATION_STATUS.WITHDRAWN]: applications.filter(a => getCode(a) === APPLICATION_STATUS.WITHDRAWN).length,
    };

    const statusFilters = [
        { value: "all", label: "Все", icon: "📋" },
        { value: APPLICATION_STATUS.NEW, label: "Новые", icon: getStatusIcon(APPLICATION_STATUS.NEW) },
        { value: APPLICATION_STATUS.ACCEPTED, label: "Принятые", icon: getStatusIcon(APPLICATION_STATUS.ACCEPTED) },
        { value: APPLICATION_STATUS.REJECTED, label: "Отклонённые", icon: getStatusIcon(APPLICATION_STATUS.REJECTED) },
        { value: APPLICATION_STATUS.WITHDRAWN, label: "Отозванные", icon: getStatusIcon(APPLICATION_STATUS.WITHDRAWN) },
    ];

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Sticky header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-10 border-b"
                style={{ background: "var(--header-bg)", borderColor: "var(--header-border)", backdropFilter: "blur(16px)" }}>
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <FileText className="w-5 h-5" style={{ color: "rgb(99,102,241)" }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                                    Заявки на вакансии
                                </h1>
                                <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    {applications.length} заявок всего
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(var(--text-3))" }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Поиск..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: "rgb(var(--card-bg))",
                                    border: "1px solid var(--card-border)",
                                    color: "rgb(var(--text-1))",
                                }}
                            />
                        </div>
                    </div>

                    {/* Status filters */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {statusFilters.map(s => {
                            const count = statusCounts[s.value as keyof typeof statusCounts];
                            const isActive = selectedStatus === s.value;
                            return (
                                <button key={s.value} onClick={() => setSelectedStatus(s.value)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                                    style={isActive ? {
                                        background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
                                        color: "#fff",
                                        boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                                    } : {
                                        background: "rgb(var(--card-bg))",
                                        border: "1px solid var(--card-border)",
                                        color: "rgb(var(--text-2))",
                                    }}>
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                    <span className="px-1.5 py-0.5 rounded-full text-xs"
                                        style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.1)", color: isActive ? "#fff" : "rgb(99,102,241)" }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <AppSkeleton />
                ) : filteredApplications.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="card p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: "rgba(99,102,241,0.1)" }}>
                            <FileText className="w-8 h-8" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-1))" }}>
                            Заявок не найдено
                        </h3>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            {searchQuery ? "Попробуйте изменить поисковый запрос" : "Новые заявки появятся здесь"}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredApplications.map((app, index) => {
                                const code = getCode(app);
                                return (
                                    <motion.div
                                        key={app.id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -60, height: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        className="card p-6"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold"
                                                        style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                                                        {app.candidateName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-base truncate" style={{ color: "rgb(var(--text-1))" }}>
                                                            {app.candidateName}
                                                        </h3>
                                                        <p className="text-sm truncate" style={{ color: "rgb(var(--text-3))" }}>
                                                            {app.vacancyTitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{formatDate(app.createdAt)}</span>
                                                    </div>
                                                    <span className={cn(getStatusBadgeClasses(code))}>
                                                        {getStatusIcon(code)} {app.statusName}
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
                                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)"; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                                        title="Сопроводительное письмо"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/employer/resumes/${app.resumeId}`)}
                                                    className="p-2 rounded-xl transition-all"
                                                    style={{ color: "rgb(var(--text-3))" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                                    title="Просмотреть резюме"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {code === APPLICATION_STATUS.NEW && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAccept(app.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                                                            style={{ color: "rgb(16,185,129)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.2)"; }}
                                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)"; }}
                                                            title="Принять"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Принять
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(app.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                                                            style={{ color: "rgb(239,68,68)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)"; }}
                                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
                                                            title="Отклонить"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Отклонить
                                                        </button>
                                                    </>
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
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
