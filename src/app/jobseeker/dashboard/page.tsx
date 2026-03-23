'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { resumeService, applicationService } from '@/services/api';
import { ResumeDto, ApplicationResponseDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

function AnimatedCounter({ value }: { value: number }) {
    const [displayed, setDisplayed] = useState(0);
    const startedRef = useRef(false);
    useEffect(() => {
        if (value === 0 || startedRef.current) return;
        startedRef.current = true;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / 900, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [value]);
    return <>{displayed}</>;
}

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
    NEW:       { label: 'На рассмотрении', badge: 'badge badge-amber' },
    PENDING:   { label: 'На рассмотрении', badge: 'badge badge-amber' },
    ACCEPTED:  { label: 'Принято',         badge: 'badge badge-emerald' },
    REJECTED:  { label: 'Отклонено',       badge: 'badge badge-red' },
    WITHDRAWN: { label: 'Отозвано',        badge: 'badge badge-slate' },
};

export default function JobseekerDashboard() {
    const { userId, loading: authLoading } = useAuth();
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'resumes' | 'applications'>('resumes');

    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            try {
                const [res, apps] = await Promise.allSettled([
                    resumeService.getMy(),
                    applicationService.getMy(),
                ]);
                if (res.status === 'fulfilled' && Array.isArray(res.value)) setResumes(res.value);
                if (apps.status === 'fulfilled' && Array.isArray(apps.value)) setApplications(apps.value);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    const handleTogglePublish = async (r: ResumeDto) => {
        try {
            if (r.isPublished) await resumeService.unpublish(r.id);
            else await resumeService.publish(r.id);
            setResumes(resumes.map(x => x.id === r.id ? { ...x, isPublished: !x.isPublished } : x));
        } catch {}
    };

    const handleWithdraw = async (appId: number) => {
        try {
            await applicationService.withdraw(appId);
            setApplications(applications.map(a => a.id === appId ? { ...a, statusName: 'WITHDRAWN' } : a));
        } catch {}
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen mesh-bg flex items-center justify-center">
                <div className="space-y-3 w-full max-w-5xl px-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-20 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const publishedCount = resumes.filter(r => r.isPublished).length;

    return (
        <div className="min-h-screen mesh-bg">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-foreground/[0.06]" style={{ background: "rgb(var(--surface))" }}>
                <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
                <div className="absolute -top-16 right-0 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgb(99,102,241), transparent)" }} />

                <div className="relative max-w-5xl mx-auto px-6 py-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-xs font-medium tracking-widest uppercase text-foreground/35 mb-2"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <h1 className="text-3xl font-bold mb-7">
                            Добро пожаловать <span className="gradient-text">👋</span>
                        </h1>

                        {/* Stats */}
                        <div className="flex items-center gap-2">
                            {[
                                { value: applications.length, label: 'откликов', icon: '📤', iconClass: 'icon-box' },
                                { value: publishedCount,      label: 'активных резюме', icon: '✅', iconClass: 'icon-box-emerald' },
                                { value: resumes.length,      label: 'всего резюме', icon: '📄', iconClass: 'icon-box-violet' },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3">
                                    {i > 0 && <div className="w-px h-8 bg-foreground/[0.08] mx-2" />}
                                    <div className={`${stat.iconClass} w-10 h-10 rounded-xl text-lg flex items-center justify-center shrink-0`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold gradient-text leading-none">
                                            <AnimatedCounter value={stat.value} />
                                        </p>
                                        <p className="text-xs text-foreground/40 mt-0.5">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Quick actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-4 mb-8">
                    <Link href="/jobseeker/vacancies"
                        className="group glass-card p-5 flex flex-col hover:border-indigo-500/30">
                        <div className="flex items-start justify-between mb-4">
                            <div className="icon-box w-11 h-11 rounded-xl text-xl flex items-center justify-center">⚡</div>
                            <span className="text-foreground/20 group-hover:text-indigo-400/60 transition-colors text-xl leading-none">→</span>
                        </div>
                        <p className="font-semibold text-foreground group-hover:text-indigo-400 transition-colors">Поиск вакансий</p>
                        <p className="text-xs text-foreground/40 mt-1">Умный полнотекстовый поиск</p>
                    </Link>
                    <Link href="/jobseeker/resumes/create"
                        className="group glass-card p-5 flex flex-col hover:border-violet-500/30">
                        <div className="flex items-start justify-between mb-4">
                            <div className="icon-box-violet w-11 h-11 rounded-xl text-xl flex items-center justify-center">📝</div>
                            <span className="text-foreground/20 group-hover:text-violet-400/60 transition-colors text-xl leading-none">→</span>
                        </div>
                        <p className="font-semibold text-foreground group-hover:text-violet-400 transition-colors">Создать резюме</p>
                        <p className="text-xs text-foreground/40 mt-1">Новое резюме</p>
                    </Link>
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "rgb(var(--surface-2))" }}>
                        {(['resumes', 'applications'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/60'}`}>
                                {activeTab === tab && (
                                    <motion.div layoutId="jobseeker-tab-bg"
                                        className="absolute inset-0 rounded-lg"
                                        style={{ background: "rgb(var(--surface))", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'resumes' ? 'Резюме' : 'Отклики'}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        activeTab === tab
                                            ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400'
                                            : 'bg-foreground/5 text-foreground/30'
                                    }`}>
                                        {tab === 'resumes' ? resumes.length : applications.length}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'resumes' && (
                            <motion.div key="resumes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                className="space-y-2">
                                {resumes.length === 0 ? (
                                    <div className="card p-14 text-center">
                                        <div className="icon-box-violet w-16 h-16 rounded-2xl mx-auto mb-4 text-3xl flex items-center justify-center">📄</div>
                                        <p className="font-semibold text-foreground/60 mb-1">Резюме ещё нет</p>
                                        <p className="text-sm text-foreground/35 mb-6">Создайте первое резюме чтобы откликаться на вакансии</p>
                                        <Link href="/jobseeker/resumes/create" className="btn-primary">Создать резюме</Link>
                                    </div>
                                ) : resumes.map((r, i) => (
                                    <motion.div key={r.id}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="card p-4 flex items-center justify-between group hover:border-indigo-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                                                r.isPublished
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : 'bg-foreground/5 border-foreground/10 text-foreground/30'
                                            }`}>
                                                {r.isPublished ? '✓' : '○'}
                                            </div>
                                            <div>
                                                <Link href={`/jobseeker/resumes/${r.id}`}
                                                    className="font-medium text-sm text-foreground hover:text-indigo-500 transition-colors">
                                                    {r.title}
                                                </Link>
                                                {r.experienceYears !== undefined && (
                                                    <p className="text-xs text-foreground/35">{r.experienceYears} лет опыта</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {r.isPublished
                                                ? <span className="badge badge-emerald">Опубликовано</span>
                                                : <span className="badge badge-slate">Черновик</span>
                                            }
                                            <button onClick={() => handleTogglePublish(r)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                                    r.isPublished
                                                        ? 'border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                                        : 'border-emerald-500/20 text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                                                }`}>
                                                {r.isPublished ? 'Снять' : 'Опубликовать'}
                                            </button>
                                            <Link href={`/jobseeker/resumes/${r.id}/edit`}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground/40 hover:text-foreground/70 hover:border-foreground/20 transition-colors">
                                                Изменить
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'applications' && (
                            <motion.div key="applications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                className="space-y-2">
                                {applications.length === 0 ? (
                                    <div className="card p-14 text-center">
                                        <div className="icon-box w-16 h-16 rounded-2xl mx-auto mb-4 text-3xl flex items-center justify-center">📭</div>
                                        <p className="font-semibold text-foreground/60 mb-1">Откликов ещё нет</p>
                                        <p className="text-sm text-foreground/35 mb-6">Найдите подходящие вакансии и отправьте отклик</p>
                                        <Link href="/jobseeker/vacancies" className="btn-primary">Найти вакансии</Link>
                                    </div>
                                ) : applications.map((app, i) => {
                                    const status = STATUS_MAP[app.statusName ?? ''] ?? { label: app.statusName ?? '', badge: 'badge badge-slate' };
                                    return (
                                        <motion.div key={app.id}
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="card p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-mono text-indigo-400">
                                                    {String(i + 1).padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">
                                                        {app.vacancyTitle ?? `Вакансия #${app.vacancyId}`}
                                                    </p>
                                                    {app.companyName && <p className="text-xs text-foreground/40">{app.companyName}</p>}
                                                    <p className="text-xs text-foreground/25 mt-0.5">
                                                        {new Date(app.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={status.badge}>{status.label}</span>
                                                {(app.statusName === 'NEW' || app.statusName === 'PENDING') && (
                                                    <button onClick={() => handleWithdraw(app.id)}
                                                        className="text-xs px-2.5 py-1 rounded-lg border border-foreground/10 text-foreground/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors">
                                                        Отозвать
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
