"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Area, AreaChart, Cell,
} from "recharts";
import {
    BarChart3, Eye, Users, TrendingUp, Briefcase,
    ArrowLeft, ChevronRight, Zap, CheckCircle2, XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { statsService } from "@/services/api";
import { EmployerDashboardDto, VacancyStatsDto } from "@/types";
import { toast } from "sonner";

/* ── helpers ── */
function pct(n: number) { return `${n.toFixed(1)}%`; }
function fmtDate(d: string) {
    const [, m, day] = d.split("-");
    return `${day}.${m}`;
}

/* ── shared components ── */
function KpiCard({ icon: Icon, label, value, sub, accent = false }: {
    icon: React.ElementType; label: string; value: string | number;
    sub?: string; accent?: boolean;
}) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: accent ? "rgba(99,102,241,0.12)" : "rgba(var(--text-3),0.08)" }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: accent ? "rgb(99,102,241)" : "rgb(var(--text-2))" }} />
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{label}</p>
            {sub && <p className="text-xs mt-1 font-medium" style={{ color: "rgb(99,102,241)" }}>{sub}</p>}
        </div>
    );
}

const CHART_COLORS = {
    indigo: "rgb(99,102,241)",
    indigoLight: "rgba(99,102,241,0.15)",
    grid: "rgba(var(--text-3),0.08)",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2 text-xs shadow-lg">
            <p className="font-medium mb-1" style={{ color: "rgb(var(--text-2))" }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
            ))}
        </div>
    );
};

/* ── main page ── */
export default function EmployerStatsPage() {
    const router = useRouter();
    const { isAuthenticated, userRole, loading: authLoading } = useAuth();

    const [dashboard, setDashboard] = useState<EmployerDashboardDto | null>(null);
    const [selectedVacancy, setSelectedVacancy] = useState<VacancyStatsDto | null>(null);
    const [loadingDash, setLoadingDash] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push("/auth/login");
        if (!authLoading && userRole && userRole !== "EMPLOYER") router.push("/jobseeker/dashboard");
    }, [authLoading, isAuthenticated, userRole, router]);

    useEffect(() => {
        if (isAuthenticated && userRole === "EMPLOYER") {
            statsService.getEmployerDashboard()
                .then(setDashboard)
                .catch(() => toast.error("Не удалось загрузить статистику"))
                .finally(() => setLoadingDash(false));
        }
    }, [isAuthenticated, userRole]);

    const handleSelectVacancy = async (vacancyId: number) => {
        if (selectedVacancy?.vacancyId === vacancyId) { setSelectedVacancy(null); return; }
        setLoadingDetail(true);
        try {
            setSelectedVacancy(await statsService.getVacancyStats(vacancyId));
        } catch {
            toast.error("Не удалось загрузить детали");
        } finally {
            setLoadingDetail(false);
        }
    };

    if (authLoading || loadingDash) {
        return (
            <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))" }}>
                <div className="max-w-5xl mx-auto px-4 space-y-4">
                    <div className="skeleton h-8 w-48 rounded-xl" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                    </div>
                    <div className="skeleton h-64 rounded-xl" />
                    <div className="skeleton h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!dashboard) return null;

    const statusColors: Record<string, string> = {
        NEW: "rgb(99,102,241)", ACCEPTED: "rgb(16,185,129)",
        REJECTED: "rgb(239,68,68)", WITHDRAWN: "rgb(245,158,11)",
    };

    const STATUS_LABELS_RU: Record<string, string> = {
        NEW: "Новые", ACCEPTED: "Принятые", REJECTED: "Отклонённые", WITHDRAWN: "Отозванные",
    };
    const appStatusData = Object.entries(dashboard.applicationsByStatus ?? {}).map(([status, count]) => ({
        name: STATUS_LABELS_RU[status] ?? status, value: count, fill: statusColors[status] ?? "rgb(var(--text-3))",
    }));

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/employer/dashboard">
                        <button className="btn-ghost flex items-center gap-2 text-sm mb-4">
                            <ArrowLeft className="h-4 w-4" /> Назад
                        </button>
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                            <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        Аналитика
                    </h1>
                </motion.div>

                {/* KPI row */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <KpiCard icon={Eye} label="Просмотров всего" value={dashboard.totalViewsAllTime}
                        sub={`+${dashboard.totalViewsLast7Days} за 7 дней`} accent />
                    <KpiCard icon={Briefcase} label="Откликов" value={dashboard.totalApplications} />
                    <KpiCard icon={CheckCircle2} label="Активных" value={dashboard.activeApplications} />
                    <KpiCard icon={TrendingUp} label="Конверсия" value={pct(dashboard.overallConversionRate)}
                        sub="просм. → отклик" />
                </motion.div>

                {/* Daily views chart */}
                {dashboard.dailyViews.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="card p-5">
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                            Просмотры за 30 дней
                        </h2>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={dashboard.dailyViews} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(99,102,241)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="rgb(99,102,241)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }}
                                    interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="views" name="Просмотры"
                                    stroke={CHART_COLORS.indigo} strokeWidth={2}
                                    fill="url(#viewsGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Applications by status */}
                {appStatusData.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="card p-5">
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                            Отклики по статусу
                        </h2>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={appStatusData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} />
                                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Откликов" radius={[4, 4, 0, 0]}>
                                    {appStatusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Vacancy breakdown */}
                {dashboard.topVacancies.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="card overflow-hidden">
                        <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--card-border)" }}>
                            <Zap className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                            <h2 className="font-semibold text-sm">По вакансиям</h2>
                        </div>

                        <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                            {dashboard.topVacancies.map((v, i) => (
                                <div key={v.vacancyId}>
                                    <button
                                        onClick={() => handleSelectVacancy(v.vacancyId)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-indigo-500/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-xs font-bold w-5 shrink-0 text-center"
                                                style={{ color: i < 3 ? "rgb(99,102,241)" : "rgb(var(--text-3))" }}>
                                                {i + 1}
                                            </span>
                                            <p className="font-medium text-sm truncate">{v.vacancyTitle}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                            <span className="flex items-center gap-1 text-xs"
                                                style={{ color: "rgb(var(--text-3))" }}>
                                                <Eye className="w-3 h-3" /> {v.views}
                                            </span>
                                            <ChevronRight className="w-4 h-4 transition-transform duration-200"
                                                style={{
                                                    color: "rgb(var(--text-3))",
                                                    transform: selectedVacancy?.vacancyId === v.vacancyId ? "rotate(90deg)" : undefined,
                                                }} />
                                        </div>
                                    </button>

                                    {/* Detail panel */}
                                    {selectedVacancy?.vacancyId === v.vacancyId && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                            className="px-5 pb-5 pt-3"
                                            style={{ background: "rgba(99,102,241,0.03)", borderTop: "1px solid var(--card-border)" }}>
                                            {loadingDetail ? (
                                                <div className="space-y-2 py-2">
                                                    <div className="skeleton h-20 rounded-xl" />
                                                    <div className="skeleton h-32 rounded-xl" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Stats grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {[
                                                            { label: "Просмотров", value: selectedVacancy.totalViews, Icon: Eye },
                                                            { label: "Уникальных", value: selectedVacancy.uniqueViewers, Icon: Users },
                                                            { label: "За 7 дней", value: selectedVacancy.viewsLast7Days, Icon: TrendingUp },
                                                            { label: "Уник. за 7 дн.", value: selectedVacancy.uniqueViewersLast7Days, Icon: Users },
                                                        ].map(({ label, value, Icon }) => (
                                                            <div key={label} className="card p-3 text-center">
                                                                <p className="text-xl font-bold">{value}</p>
                                                                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{label}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Chart */}
                                                    {selectedVacancy.dailyViews?.length > 0 && (
                                                        <div className="card p-4">
                                                            <p className="text-xs font-semibold mb-3 uppercase tracking-wide"
                                                                style={{ color: "rgb(var(--text-3))" }}>
                                                                Просмотры за 30 дней
                                                            </p>
                                                            <ResponsiveContainer width="100%" height={120}>
                                                                <BarChart data={selectedVacancy.dailyViews}
                                                                    margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                                                                    <XAxis dataKey="date" tickFormatter={fmtDate}
                                                                        tick={{ fontSize: 9, fill: "rgb(var(--text-3))" }} interval={6} />
                                                                    <YAxis tick={{ fontSize: 9, fill: "rgb(var(--text-3))" }} allowDecimals={false} />
                                                                    <Tooltip content={<CustomTooltip />} />
                                                                    <Bar dataKey="views" name="Просмотры"
                                                                        fill={CHART_COLORS.indigo} radius={[2, 2, 0, 0]} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    )}

                                                    <Link href={`/employer/vacancies/${v.vacancyId}`}>
                                                        <button className="btn-secondary text-sm flex items-center gap-2">
                                                            Открыть вакансию <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {dashboard.topVacancies.length === 0 && !loadingDash && (
                    <div className="card p-10 text-center">
                        <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="font-medium">Данных пока нет</p>
                        <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                            Статистика появится после первых просмотров ваших вакансий
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
