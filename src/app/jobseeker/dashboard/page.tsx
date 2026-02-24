'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { resumeService, applicationService } from '@/services/api';
import { ResumeDto, ApplicationResponseDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING:   { label: 'На рассмотрении', color: 'text-amber-400' },
    ACCEPTED:  { label: 'Принято ✓',        color: 'text-emerald-400' },
    REJECTED:  { label: 'Отклонено',        color: 'text-red-400' },
    WITHDRAWN: { label: 'Отозвано',         color: 'text-white/35' },
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
                if (res.status === 'fulfilled') setResumes(res.value);
                if (apps.status === 'fulfilled') setApplications(apps.value);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    const handleTogglePublish = async (r: ResumeDto) => {
        try {
            if (r.isPublished) {
                await resumeService.unpublish(r.id);
            } else {
                await resumeService.publish(r.id);
            }
            setResumes(resumes.map(x => x.id === r.id ? { ...x, isPublished: !x.isPublished } : x));
        } catch { }
    };

    const handleWithdraw = async (appId: number) => {
        try {
            await applicationService.withdraw(appId);
            setApplications(applications.map(a => a.id === appId ? { ...a, statusName: 'WITHDRAWN' } : a));
        } catch {  }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
                <div className="space-y-3 w-full max-w-3xl px-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/3 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090f] text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&family=Nunito+Sans:wght@400;600&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/5 blur-3xl rounded-full" />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold">Добро пожаловать 👋</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {applications.length} откликов · {resumes.filter(r => r.isPublished).length} активных резюме
                    </p>
                </motion.div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <Link href="/search/vacancies"
                          className="p-4 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl hover:bg-indigo-600/25 transition-colors group">
                        <span className="text-2xl block mb-2">⚡</span>
                        <p className="font-semibold text-indigo-300 group-hover:text-indigo-200">Поиск вакансий</p>
                        <p className="text-xs text-indigo-400/60 mt-0.5">Elasticsearch поиск</p>
                    </Link>
                    <Link href="/jobseeker/resumes/create"
                          className="p-4 bg-white/3 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors group">
                        <span className="text-2xl block mb-2">📝</span>
                        <p className="font-semibold text-white/70 group-hover:text-white">Создать резюме</p>
                        <p className="text-xs text-white/30 mt-0.5">Новое резюме</p>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
                    {(['resumes', 'applications'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
                            {tab === 'resumes' ? `Резюме (${resumes.length})` : `Отклики (${applications.length})`}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'resumes' && (
                        <motion.div key="resumes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-3">
                            {resumes.length === 0 ? (
                                <div className="text-center py-16 text-white/25">
                                    <p className="text-4xl mb-3">📄</p>
                                    <p>Резюме ещё нет</p>
                                    <Link href="/jobseeker/resumes/create"
                                          className="mt-4 inline-block px-5 py-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-400 text-sm hover:bg-indigo-600/50 transition-colors">
                                        Создать резюме
                                    </Link>
                                </div>
                            ) : (
                                resumes.map((r, i) => (
                                    <motion.div key={r.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between p-4 bg-white/3 border border-white/8 hover:border-white/15 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${r.isPublished ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-white/20'}`} />
                                            <div>
                                                <Link href={`/jobseeker/resumes/${r.id}`}
                                                      className="font-medium text-sm text-white hover:text-indigo-300 transition-colors">
                                                    {r.title}
                                                </Link>
                                                {r.experienceYears !== undefined && (
                                                    <p className="text-xs text-white/35">{r.experienceYears} лет опыта</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleTogglePublish(r)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${r.isPublished
                                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400'
                                                        : 'bg-white/5 text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400'}`}>
                                                {r.isPublished ? 'Снять' : 'Опубликовать'}
                                            </button>
                                            <Link href={`/jobseeker/resumes/${r.id}/edit`}
                                                  className="text-xs px-3 py-1.5 bg-white/5 text-white/40 hover:text-white/70 rounded-lg transition-colors">
                                                Изменить
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'applications' && (
                        <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-3">
                            {applications.length === 0 ? (
                                <div className="text-center py-16 text-white/25">
                                    <p className="text-4xl mb-3">📭</p>
                                    <p>Откликов ещё нет</p>
                                    <Link href="/search/vacancies"
                                          className="mt-4 inline-block px-5 py-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-400 text-sm hover:bg-indigo-600/50 transition-colors">
                                        Найти вакансии
                                    </Link>
                                </div>
                            ) : (
                                applications.map((app, i) => {
                                    const status = STATUS_MAP[app.statusName ?? ''] ?? { label: app.statusName ?? '', color: 'text-white/50' };
                                    return (
                                        <motion.div key={app.id}
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="p-4 bg-white/3 border border-white/8 rounded-xl">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-sm text-white">{app.vacancyTitle ?? `Вакансия #${app.vacancyId}`}</p>
                                                    {app.companyName && <p className="text-xs text-white/40">{app.companyName}</p>}
                                                    <p className="text-xs text-white/25 mt-1">
                                                        {new Date(app.createdAt).toLocaleDateString('ru')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                                                    {app.statusName === 'PENDING' && (
                                                        <button onClick={() => handleWithdraw(app.id)}
                                                                className="text-xs px-2.5 py-1 bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                            Отозвать
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}