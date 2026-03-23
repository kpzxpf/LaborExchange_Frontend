"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
    BarChart3, Eye, Users, TrendingUp, ArrowLeft,
    FileText, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resumeService, statsService } from "@/services/api";
import { ResumeDto, ResumeStatsDto } from "@/types";
import { toast } from "sonner";

function fmtDate(d: string) {
    const [, m, day] = d.split("-");
    return `${day}.${m}`;
}

function KpiCard({ icon: Icon, label, value, sub }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
    return (
        <div className="card p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(99,102,241,0.1)" }}>
                <Icon className="w-4.5 h-4.5" style={{ color: "rgb(99,102,241)" }} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{label}</p>
            {sub && <p className="text-xs mt-1 font-medium" style={{ color: "rgb(99,102,241)" }}>{sub}</p>}
        </div>
    );
}

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

export default function JobseekerStatsPage() {
    const router = useRouter();
    const { isAuthenticated, userRole, loading: authLoading } = useAuth();

    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [selectedStats, setSelectedStats] = useState<ResumeStatsDto | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [loadingResumes, setLoadingResumes] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push("/auth/login");
        if (!authLoading && userRole && userRole !== "JOB_SEEKER") router.push("/employer/stats");
    }, [authLoading, isAuthenticated, userRole, router]);

    useEffect(() => {
        if (isAuthenticated && userRole === "JOB_SEEKER") {
            resumeService.getMy()
                .then(data => {
                    setResumes(data);
                    if (data.length > 0) loadStats(data[0].id);
                })
                .catch(() => toast.error("Не удалось загрузить резюме"))
                .finally(() => setLoadingResumes(false));
        }
    }, [isAuthenticated, userRole]);

    const loadStats = async (resumeId: number) => {
        setSelectedResumeId(resumeId);
        setLoadingStats(true);
        try {
            setSelectedStats(await statsService.getResumeStats(resumeId));
        } catch {
            toast.error("Не удалось загрузить статистику");
            setSelectedStats(null);
        } finally {
            setLoadingStats(false);
        }
    };

    if (authLoading || loadingResumes) {
        return (
            <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))" }}>
                <div className="max-w-4xl mx-auto px-4 space-y-4">
                    <div className="skeleton h-8 w-48 rounded-xl" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                    </div>
                    <div className="skeleton h-56 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/jobseeker/dashboard">
                        <button className="btn-ghost flex items-center gap-2 text-sm mb-4">
                            <ArrowLeft className="h-4 w-4" /> Назад
                        </button>
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                            <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        Статистика резюме
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                        Сколько работодателей просмотрели ваши резюме
                    </p>
                </motion.div>

                {/* Resume selector */}
                {resumes.length > 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="card overflow-hidden">
                        <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--card-border)" }}>
                            <FileText className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                            <span className="text-sm font-semibold">Ваши резюме</span>
                        </div>
                        <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                            {resumes.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => loadStats(r.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-indigo-500/5"
                                    style={selectedResumeId === r.id
                                        ? { background: "rgba(99,102,241,0.07)", color: "rgb(99,102,241)" }
                                        : { color: "rgb(var(--text-2))" }}
                                >
                                    <span className="text-sm font-medium truncate">{r.title}</span>
                                    <ChevronRight className="w-4 h-4 shrink-0 ml-2" style={{ color: "rgb(var(--text-3))" }} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* No resumes */}
                {resumes.length === 0 && (
                    <div className="card p-10 text-center">
                        <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="font-medium">Резюме не найдено</p>
                        <p className="text-sm mt-1 mb-4" style={{ color: "rgb(var(--text-3))" }}>
                            Создайте резюме, чтобы видеть статистику просмотров
                        </p>
                        <Link href="/jobseeker/resumes/create">
                            <button className="btn-primary text-sm">Создать резюме</button>
                        </Link>
                    </div>
                )}

                {/* Stats */}
                {loadingStats && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                        </div>
                        <div className="skeleton h-56 rounded-xl" />
                    </div>
                )}

                {!loadingStats && selectedStats && (
                    <>
                        {/* KPI row */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <KpiCard icon={Eye} label="Просмотров всего" value={selectedStats.totalViews} />
                            <KpiCard icon={Users} label="Уникальных" value={selectedStats.uniqueViewers} />
                            <KpiCard icon={TrendingUp} label="За 7 дней"
                                value={selectedStats.viewsLast7Days}
                                sub={selectedStats.viewsLast7Days > 0 ? "активно просматривают" : undefined} />
                            <KpiCard icon={Users} label="Уник. за 7 дн." value={selectedStats.uniqueViewersLast7Days} />
                        </motion.div>

                        {/* Chart */}
                        {selectedStats.dailyViews.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                className="card p-5">
                                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Eye className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                    Просмотры за 30 дней
                                    {resumes.length > 0 && selectedResumeId && (
                                        <span className="text-xs font-normal ml-1" style={{ color: "rgb(var(--text-3))" }}>
                                            — {resumes.find(r => r.id === selectedResumeId)?.title}
                                        </span>
                                    )}
                                </h2>
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={selectedStats.dailyViews} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="resumeViewsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="rgb(99,102,241)" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="rgb(99,102,241)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--text-3),0.08)" />
                                        <XAxis dataKey="date" tickFormatter={fmtDate}
                                            tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} interval={4} />
                                        <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="views" name="Просмотры"
                                            stroke="rgb(99,102,241)" strokeWidth={2}
                                            fill="url(#resumeViewsGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}

                        {selectedStats.totalViews === 0 && (
                            <div className="card p-8 text-center">
                                <Eye className="w-9 h-9 mx-auto mb-3" style={{ color: "rgb(var(--text-3))" }} />
                                <p className="font-medium">Просмотров пока нет</p>
                                <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                                    Опубликуйте резюме, чтобы работодатели могли его найти
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
