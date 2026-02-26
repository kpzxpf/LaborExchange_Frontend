'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { applicationService, vacancyService, companyService } from '@/services/api';
import { ApplicationStatisticsDto, VacancyDto, CompanyDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
    PENDING:   { bg: 'bg-amber-500/15',    text: 'text-amber-400',     bar: 'bg-amber-500' },
    ACCEPTED:  { bg: 'bg-emerald-500/15',  text: 'text-emerald-400',   bar: 'bg-emerald-500' },
    REJECTED:  { bg: 'bg-red-500/15',      text: 'text-red-400',       bar: 'bg-red-500' },
    WITHDRAWN: { bg: 'bg-foreground/10',   text: 'text-foreground/50', bar: 'bg-foreground/30' },
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'На рассмотрении',
    ACCEPTED: 'Принято',
    REJECTED: 'Отклонено',
    WITHDRAWN: 'Отозвано',
};

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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="space-y-4 w-full max-w-4xl px-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-foreground/[0.03] rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 flex items-start justify-between">
                    <div>
                        <p className="text-foreground/35 text-sm mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <h1 className="text-3xl font-semibold">
                            {company ? company.name : 'Панель работодателя'}
                        </h1>
                        {company?.location && <p className="text-foreground/40 text-sm mt-1">📍 {company.location}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/employer/vacancies/create"
                              className="px-5 py-2.5 bg-foreground/[0.08] hover:bg-foreground/[0.12] border border-foreground/10 rounded-xl text-sm transition-colors">
                            + Вакансия
                        </Link>
                        <Link href="/employer/resumes"
                              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium text-white transition-colors">
                            Поиск кандидатов
                        </Link>
                    </div>
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Всего откликов', value: stats?.totalApplications ?? 0, color: 'text-foreground', icon: '📥' },
                        { label: 'Активных вакансий', value: publishedCount, color: 'text-violet-400', icon: '📡' },
                        { label: 'Всего вакансий', value: vacancies.length, color: 'text-foreground/60', icon: '📋' },
                    ].map((item, i) => (
                        <motion.div key={i}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-xs text-foreground/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                    #{String(item.value).padStart(4, '0')}
                                </span>
                            </div>
                            <p className={`text-3xl font-semibold ${item.color}`}>{item.value}</p>
                            <p className="text-xs text-foreground/40 mt-1">{item.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Application status breakdown */}
                {stats && stats.applicationsByStatus && Object.keys(stats.applicationsByStatus).length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="p-6 bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl mb-8">
                        <h2 className="font-medium text-foreground/70 mb-5 text-sm tracking-wider uppercase">
                            Статусы откликов
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(stats.applicationsByStatus).map(([status, count]) => {
                                const pct = stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0;
                                const colors = STATUS_COLORS[status] ?? STATUS_COLORS.WITHDRAWN;
                                return (
                                    <div key={status}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className={`text-sm font-medium ${colors.text}`}>
                                                {STATUS_LABELS[status] ?? status}
                                            </span>
                                            <span className="text-sm text-foreground/40" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                {count} <span className="text-foreground/20">({pct.toFixed(0)}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
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
                        </div>
                        {stats.withdrawalRate !== undefined && (
                            <p className="text-xs text-foreground/25 mt-4">
                                Коэффициент отзывов: {(stats.withdrawalRate * 100).toFixed(1)}%
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Recent vacancies */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-medium text-foreground/70 text-sm tracking-wider uppercase">Мои вакансии</h2>
                        <Link href="/employer/vacancies" className="text-xs text-foreground/35 hover:text-foreground/60 transition-colors">
                            Все →
                        </Link>
                    </div>

                    {vacancies.length === 0 ? (
                        <div className="py-12 text-center text-foreground/25 border border-dashed border-foreground/10 rounded-2xl">
                            <p className="text-3xl mb-3">📭</p>
                            <p>Вакансии ещё не созданы</p>
                            <Link href="/employer/vacancies/create"
                                  className="mt-4 inline-block px-5 py-2.5 bg-violet-600/30 border border-violet-500/30 rounded-xl text-violet-400 text-sm hover:bg-violet-600/50 transition-colors">
                                Создать первую вакансию
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {vacancies.slice(0, 6).map((v, i) => (
                                <motion.div key={v.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-foreground/[0.03] border border-foreground/[0.08] hover:border-foreground/[0.15] rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${v.isPublished ? 'bg-emerald-400' : 'bg-foreground/20'}`} />
                                        <div>
                                            <p className="font-medium text-sm text-foreground group-hover:text-violet-400 dark:group-hover:text-violet-300 transition-colors">
                                                {v.title}
                                            </p>
                                            {v.salary && (
                                                <p className="text-xs text-foreground/40">{v.salary.toLocaleString()} ₽</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${v.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-foreground/5 text-foreground/30'}`}>
                                            {v.isPublished ? 'Активна' : 'Черновик'}
                                        </span>
                                        <Link href={`/employer/vacancies/${v.id}`}
                                              className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors px-2">→</Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
