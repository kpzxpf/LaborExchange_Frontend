"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Clock, Eye, XCircle, CheckCircle, LayoutList, Columns, MessageSquare,
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
    statusName: string;
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

// ─── Kanban column ───────────────────────────────────────────────
const KANBAN_COLS = [
    { status: APPLICATION_STATUS.NEW, label: "Новые", color: "rgb(99,102,241)", bg: "rgba(99,102,241,0.08)" },
    { status: APPLICATION_STATUS.ACCEPTED, label: "Принятые", color: "rgb(16,185,129)", bg: "rgba(16,185,129,0.08)" },
    { status: APPLICATION_STATUS.REJECTED, label: "Отклонённые", color: "rgb(239,68,68)", bg: "rgba(239,68,68,0.08)" },
    { status: APPLICATION_STATUS.WITHDRAWN, label: "Отозванные", color: "rgb(100,116,139)", bg: "rgba(100,116,139,0.08)" },
];

interface KanbanColumnProps {
    col: typeof KANBAN_COLS[0];
    apps: Application[];
    onDrop: (appId: number, newStatus: string) => void;
    onViewResume: (resumeId: number) => void;
    draggingId: number | null;
    setDraggingId: (id: number | null) => void;
}

function KanbanColumn({ col, apps, onDrop, onViewResume, draggingId, setDraggingId }: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            className="flex-1 min-w-[220px] flex flex-col rounded-2xl"
            style={{ border: `1px solid ${isDragOver ? col.color : "var(--card-border)"}`, background: isDragOver ? col.bg : "rgba(255,255,255,0.02)", transition: "border-color 0.2s, background 0.2s" }}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => {
                e.preventDefault();
                setIsDragOver(false);
                const id = Number(e.dataTransfer.getData("appId"));
                if (id) onDrop(id, col.status);
            }}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold" style={{ color: "rgb(var(--text-1))" }}>{col.label}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: col.bg, color: col.color }}>
                    {apps.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2 min-h-[120px]">
                {apps.map(app => (
                    <div
                        key={app.id}
                        draggable={app.statusName === APPLICATION_STATUS.NEW}
                        onDragStart={e => {
                            e.dataTransfer.setData("appId", String(app.id));
                            setDraggingId(app.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className="rounded-xl p-3 space-y-2 transition-all"
                        style={{
                            background: "rgb(var(--card-bg))",
                            border: "1px solid var(--card-border)",
                            opacity: draggingId === app.id ? 0.5 : 1,
                            cursor: app.statusName === APPLICATION_STATUS.NEW ? "grab" : "default",
                            boxShadow: "var(--card-shadow)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                                style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                                {app.candidateName.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={() => onViewResume(app.resumeId)}
                                className="p-1 rounded-lg transition-colors shrink-0"
                                style={{ color: "rgb(var(--text-3))" }}
                                title="Резюме"
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div>
                            <p className="text-xs font-semibold truncate" style={{ color: "rgb(var(--text-1))" }}>
                                {app.candidateName}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                {app.vacancyTitle}
                            </p>
                        </div>
                        <p className="text-xs" style={{ color: "rgb(var(--text-3))" }}>
                            {new Date(app.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                        </p>
                        {app.statusName === APPLICATION_STATUS.NEW && (
                            <p className="text-xs" style={{ color: col.color, opacity: 0.7 }}>
                                Перетащите для изменения →
                            </p>
                        )}
                    </div>
                ))}
                {apps.length === 0 && (
                    <div className="flex items-center justify-center h-16 rounded-xl border border-dashed"
                        style={{ borderColor: "var(--card-border)", color: "rgb(var(--text-3))" }}>
                        <span className="text-xs">Пусто</span>
                    </div>
                )}
            </div>
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
    const [view, setView] = useState<"list" | "kanban">("list");
    const [draggingId, setDraggingId] = useState<number | null>(null);
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
            filtered = filtered.filter(app => app.statusName === selectedStatus);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                app => app.vacancyTitle?.toLowerCase().includes(q) || app.candidateName?.toLowerCase().includes(q)
            );
        }
        setFilteredApplications(filtered);
    };

    // Optimistic status update
    const updateStatusOptimistic = (appId: number, newStatus: string) => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, statusName: newStatus } : a));
    };

    const rollbackStatus = (appId: number, oldStatus: string) => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, statusName: oldStatus } : a));
    };

    const handleReject = async (appId: number) => {
        const old = applications.find(a => a.id === appId)?.statusName ?? APPLICATION_STATUS.NEW;
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
        const old = applications.find(a => a.id === appId)?.statusName ?? APPLICATION_STATUS.NEW;
        updateStatusOptimistic(appId, APPLICATION_STATUS.ACCEPTED);
        try {
            await applicationService.accept(appId);
            toast.success("Заявка принята");
        } catch {
            rollbackStatus(appId, old);
            toast.error("Не удалось принять заявку");
        }
    };

    // Kanban drag drop
    const handleKanbanDrop = async (appId: number, newStatus: string) => {
        const app = applications.find(a => a.id === appId);
        if (!app || app.statusName === newStatus) return;
        if (app.statusName !== APPLICATION_STATUS.NEW) {
            toast.error("Можно перемещать только новые заявки");
            return;
        }
        if (newStatus === APPLICATION_STATUS.ACCEPTED) await handleAccept(appId);
        else if (newStatus === APPLICATION_STATUS.REJECTED) await handleReject(appId);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

    const statusCounts = {
        all: applications.length,
        [APPLICATION_STATUS.NEW]: applications.filter(a => a.statusName === APPLICATION_STATUS.NEW).length,
        [APPLICATION_STATUS.ACCEPTED]: applications.filter(a => a.statusName === APPLICATION_STATUS.ACCEPTED).length,
        [APPLICATION_STATUS.REJECTED]: applications.filter(a => a.statusName === APPLICATION_STATUS.REJECTED).length,
        [APPLICATION_STATUS.WITHDRAWN]: applications.filter(a => a.statusName === APPLICATION_STATUS.WITHDRAWN).length,
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

                        <div className="flex items-center gap-3">
                            {/* View toggle */}
                            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>
                                {(["list", "kanban"] as const).map(v => (
                                    <button key={v} onClick={() => setView(v)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
                                        style={view === v ? {
                                            background: "rgba(99,102,241,0.15)",
                                            color: "rgb(99,102,241)",
                                        } : {
                                            color: "rgb(var(--text-3))",
                                        }}>
                                        {v === "list" ? <LayoutList className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
                                        {v === "list" ? "Список" : "Канбан"}
                                    </button>
                                ))}
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
                    </div>

                    {/* Status filters (list view only) */}
                    {view === "list" && (
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
                    )}
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <AppSkeleton />
                ) : view === "kanban" ? (
                    // ─── Kanban view ───────────────────────────────────────────
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-[800px]">
                            {KANBAN_COLS.map(col => (
                                <KanbanColumn
                                    key={col.status}
                                    col={col}
                                    apps={applications.filter(a => a.statusName === col.status)}
                                    onDrop={handleKanbanDrop}
                                    onViewResume={id => router.push(`/employer/resumes/${id}`)}
                                    draggingId={draggingId}
                                    setDraggingId={setDraggingId}
                                />
                            ))}
                        </div>
                        <p className="text-xs mt-4 text-center" style={{ color: "rgb(var(--text-3))" }}>
                            Перетащите карточки из колонки «Новые» для изменения статуса
                        </p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    // ─── Empty state ───────────────────────────────────────────
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
                    // ─── List view ─────────────────────────────────────────────
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredApplications.map((app, index) => (
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
                                                <span className={cn(getStatusBadgeClasses(app.statusName))}>
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

                                            {app.statusName === APPLICATION_STATUS.NEW && (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(app.id)}
                                                        className="p-2 rounded-xl transition-all"
                                                        style={{ color: "rgb(16,185,129)", background: "rgba(16,185,129,0.1)" }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.2)"; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)"; }}
                                                        title="Принять"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(app.id)}
                                                        className="p-2 rounded-xl transition-all"
                                                        style={{ color: "rgb(239,68,68)", background: "rgba(239,68,68,0.1)" }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)"; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
                                                        title="Отклонить"
                                                    >
                                                        <XCircle className="w-4 h-4" />
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
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
