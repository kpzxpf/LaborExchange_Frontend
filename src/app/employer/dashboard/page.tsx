'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { applicationService, vacancyService, companyService } from '@/services/api';
import { ApplicationStatisticsDto, VacancyDto, CompanyDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
    const [displayed, setDisplayed] = useState(0);
    const startedRef = useRef(false);
    useEffect(() => {
        if (value === 0 || startedRef.current) return;
        startedRef.current = true;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [value, duration]);
    return <>{displayed}</>;
}

const STATUS_COLORS: Record<string, { bar: string; hex: string; badge: string }> = {
    PENDING:   { bar: 'bg-amber-500',    hex: '#f59e0b', badge: 'badge badge-amber' },
    ACCEPTED:  { bar: 'bg-emerald-500',  hex: '#10b981', badge: 'badge badge-emerald' },
    REJECTED:  { bar: 'bg-red-500',      hex: '#ef4444', badge: 'badge badge-red' },
    WITHDRAWN: { bar: 'bg-foreground/30', hex: '#64748b', badge: 'badge badge-slate' },
    NEW:       { bar: 'bg-indigo-500',   hex: '#6366f1', badge: 'badge badge-indigo' },
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'На рассмотрении', ACCEPTED: 'Принято',
    REJECTED: 'Отклонено', WITHDRAWN: 'Отозвано', NEW: 'Новые',
};

function DonutChart({ data, total }: { data: { status: string; count: number }[]; total: number }) {
    const SIZE = 160; const R = 58; const STROKE = 20;
    const cx = SIZE / 2; const cy = SIZE / 2;
    const circumference = 2 * Math.PI * R;
    const [hovered, setHovered] = useState<string | null>(null);

    const segments = useMemo(() => {
        let offset = 0;
        return data.map(d => {
            const pct = total > 0 ? d.count / total : 0;
            const dash = pct * circumference;
            const seg = { ...d, pct, dashArray: `${dash} ${circumference - dash}`, dashOffset: -offset };
            offset += dash;
            return seg;
        });
    }, [data, total, circumference]);

    return (
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
            {segments.map(seg => {
                const colors = STATUS_COLORS[seg.status] ?? STATUS_COLORS.WITHDRAWN;
                return (
                    <circle key={seg.status}
                        cx={cx} cy={cy} r={R} fill="none"
                        stroke={colors.hex}
                        strokeWidth={hovered === seg.status ? STROKE + 4 : STROKE}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        strokeLinecap="butt"
                        style={{ transition: "stroke-width 0.2s", cursor: "pointer" }}
                        onMouseEnter={() => setHovered(seg.status)}
                        onMouseLeave={() => setHovered(null)}
                    />
                );
            })}
            <g style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px` }}>
                <text x={cx} y={cy - 8} textAnchor="middle"
                    style={{ fontSize: 28, fontWeight: 700, fill: "rgb(var(--text-1))" }}>{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle"
                    style={{ fontSize: 11, fill: "rgb(var(--text-3))" }}>откликов</text>
            </g>
        </svg>
    );
}

export default function EmployerDashboard() {
    const { userId, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<ApplicationStatisticsDto | null>(null);
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const loadData = async () => {
            try {
                const [statsData, vacData, compData] = await Promise.allSettled([
                    applicationService.getStatistics(userId),
                    vacancyService.getByEmployer(userId),
                    companyService.getMyCompany(),
                ]);
                if (statsData.status === 'fulfilled') setStats(statsData.value);
                if (vacData.status === 'fulfilled') setVacancies(vacData.value.content ?? []);
                if (compData.status === 'fulfilled') setCompany(compData.value);
            } catch (error) {
                console.error("Dashboard load error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId]);

    const publishedCount = vacancies.filter(v => v.isPublished).length;

    if (loading || authLoading) {
        return (
            <div className="min-h-screen mesh-bg flex items-center justify-center">
                <div className="space-y-4 w-full max-w-6xl px-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const statItems = [
        { label: 'Всего откликов',    value: stats?.totalApplications ?? 0, icon: '📥', iconClass: 'icon-box' },
        { label: 'Активных вакансий', value: publishedCount,                icon: '📡', iconClass: 'icon-box-violet' },
        { label: 'Всего вакансий',    value: vacancies.length,              icon: '📋', iconClass: 'icon-box-emerald' },
    ];

    const hasStatusData = stats?.applicationsByStatus && Object.keys(stats.applicationsByStatus).length > 0;

    return (
        <div className="min-h-screen mesh-bg">
            {/* Hero header */}
            <div className="relative overflow-hidden border-b border-foreground/[0.06]" style={{ background: "rgb(var(--surface))" }}>
                <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
                <div className="absolute -top-16 right-0 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgb(139,92,246), transparent)" }} />

                <div className="relative max-w-6xl mx-auto px-6 py-8">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-widest uppercase text-foreground/35 mb-2"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <h1 className="text-3xl font-bold mb-1">
                                {company ? company.name : 'Панель работодателя'}
                            </h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                {company?.location && (
                                    <span className="text-sm text-foreground/40 flex items-center gap-1">
                                        <span>📍</span>{company.location}
                                    </span>
                                )}
                                {company && (
                                    <Link href="/employer/company"
                                        className="text-xs text-foreground/35 hover:text-violet-400 border border-foreground/10 hover:border-violet-400/40 px-2.5 py-1 rounded-lg transition-colors">
                                        Редактировать профиль
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Link href="/employer/vacancies/create" className="btn-secondary">+ Вакансия</Link>
                            <Link href="/employer/resumes" className="btn-primary">Поиск кандидатов</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {statItems.map((item, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${item.iconClass} w-10 h-10 rounded-xl text-lg flex items-center justify-center`}>
                                    {item.icon}
                                </div>
                                <span className="text-xs text-foreground/20 font-mono">
                                    #{String(item.value).padStart(4, '0')}
                                </span>
                            </div>
                            <p className="text-3xl font-bold gradient-text leading-none">
                                <AnimatedCounter value={item.value} />
                            </p>
                            <p className="text-xs text-foreground/40 mt-2">{item.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Two-column: vacancies + chart */}
                <div className="grid grid-cols-5 gap-6">
                    {/* Vacancies list */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground/60 text-xs tracking-widest uppercase">Мои вакансии</h2>
                            <Link href="/employer/vacancies"
                                className="text-xs text-foreground/35 hover:text-foreground/60 transition-colors flex items-center gap-1">
                                Все вакансии <span>→</span>
                            </Link>
                        </div>

                        {vacancies.length === 0 ? (
                            <div className="card p-14 text-center">
                                <div className="icon-box-violet w-16 h-16 rounded-2xl mx-auto mb-4 text-3xl flex items-center justify-center">📭</div>
                                <p className="font-semibold text-foreground/60 mb-1">Вакансий ещё нет</p>
                                <p className="text-sm text-foreground/35 mb-6">Создайте первую вакансию чтобы начать находить кандидатов</p>
                                <Link href="/employer/vacancies/create" className="btn-primary">Создать вакансию</Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {vacancies.slice(0, 6).map((v, i) => (
                                    <motion.div key={v.id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: 0.35 + i * 0.04 }}
                                        className="card p-4 flex items-center justify-between group hover:border-violet-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                                                v.isPublished
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : 'bg-foreground/5 border-foreground/10 text-foreground/30'
                                            }`}>
                                                {v.isPublished ? '●' : '○'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-foreground group-hover:text-violet-400 transition-colors">
                                                    {v.title}
                                                </p>
                                                {v.salary && (
                                                    <p className="text-xs text-foreground/40">{v.salary.toLocaleString()} ₽</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {v.isPublished
                                                ? <span className="badge badge-emerald">Активна</span>
                                                : <span className="badge badge-slate">Черновик</span>
                                            }
                                            <Link href={`/employer/vacancies/${v.id}`}
                                                className="w-7 h-7 rounded-lg border border-foreground/10 hover:border-foreground/20 text-foreground/30 hover:text-foreground/60 flex items-center justify-center text-xs transition-colors">
                                                →
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Stats chart */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="col-span-2">
                        {hasStatusData ? (
                            <div className="card p-5 h-full flex flex-col">
                                <h2 className="font-semibold text-foreground/60 text-xs tracking-widest uppercase mb-5">
                                    Статусы откликов
                                </h2>
                                <div className="flex justify-center mb-5">
                                    <DonutChart
                                        data={Object.entries(stats!.applicationsByStatus).map(([status, count]) => ({ status, count }))}
                                        total={stats!.totalApplications}
                                    />
                                </div>
                                <div className="space-y-3 flex-1">
                                    {Object.entries(stats!.applicationsByStatus).map(([status, count]) => {
                                        const pct = stats!.totalApplications > 0 ? (count / stats!.totalApplications) * 100 : 0;
                                        const colors = STATUS_COLORS[status] ?? STATUS_COLORS.WITHDRAWN;
                                        return (
                                            <div key={status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors.hex }} />
                                                        <span className="text-xs text-foreground/55">{STATUS_LABELS[status] ?? status}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-foreground/40">
                                                        {count} <span className="text-foreground/20">({pct.toFixed(0)}%)</span>
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                                                        className={`h-full rounded-full ${colors.bar}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stats!.withdrawalRate !== undefined && (
                                        <p className="text-xs text-foreground/25 pt-1 font-mono">
                                            Отзывы: {(stats!.withdrawalRate * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card p-5 h-full flex flex-col items-center justify-center text-center">
                                <div className="icon-box w-16 h-16 rounded-2xl mx-auto mb-4 text-3xl flex items-center justify-center">📊</div>
                                <p className="font-semibold text-foreground/40 mb-1">Нет данных</p>
                                <p className="text-xs text-foreground/25">Статистика появится после получения первых откликов</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
