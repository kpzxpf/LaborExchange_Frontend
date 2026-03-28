"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Building2, Send,
    Globe, Mail, Phone, MapPin, Calendar, Sparkles, ExternalLink, X, ChevronDown, MessageCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { vacancyService, resumeService, applicationService, companyService, skillService, chatService } from "@/services/api";
import type { VacancyDto, ResumeDto, ApplicationRequestDto, CompanyDto, SkillDto } from "@/types";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`skeleton ${className ?? ""}`} />;
}

function VacancyDetailSkeleton() {
    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <SkeletonBlock className="h-8 w-32 mb-6 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-8 space-y-4">
                            <SkeletonBlock className="h-9 w-3/4 rounded-xl" />
                            <SkeletonBlock className="h-5 w-1/2 rounded-lg" />
                        </div>
                        <div className="card p-6 space-y-3">
                            <SkeletonBlock className="h-5 w-40 rounded-lg" />
                            <SkeletonBlock className="h-4 w-full rounded-lg" />
                            <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
                            <SkeletonBlock className="h-4 w-4/6 rounded-lg" />
                        </div>
                    </div>
                    <div className="card p-6 space-y-4 h-fit">
                        <SkeletonBlock className="h-10 w-full rounded-xl" />
                        <SkeletonBlock className="h-4 w-3/4 mx-auto rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VacancyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const [vacancy, setVacancy] = useState<VacancyDto | null>(null);
    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [skills, setSkills] = useState<SkillDto[]>([]);
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        if (params.id) fetchData();
    }, [params.id, isAuthenticated, userId, loading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const vacancyId = Number(params.id);
            const vacancyData = await vacancyService.getById(vacancyId);
            setVacancy(vacancyData);

            const [skillIds] = await Promise.all([vacancyService.getSkillIds(vacancyId)]);
            const [skillsData, companyData] = await Promise.all([
                skillService.getByIds(skillIds),
                companyService.getByEmployerId(vacancyData.employerId).catch(() => null),
            ]);

            setSkills(skillsData);
            setCompany(companyData);

            if (userRole === "JOB_SEEKER" && userId) {
                const resumesData = await resumeService.getMy();
                const safeResumes = Array.isArray(resumesData) ? resumesData : [];
                setResumes(safeResumes);
                if (safeResumes.length > 0) setSelectedResumeId(safeResumes[0].id);
            }
        } catch {
            setError("Не удалось загрузить вакансию. Возможно, она была удалена или недоступна.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!vacancy || !userId || !selectedResumeId) {
            toast.error("Пожалуйста, выберите резюме");
            return;
        }
        setIsApplying(true);
        try {
            const applicationData: ApplicationRequestDto = {
                vacancyId: vacancy.id,
                employerId: vacancy.employerId,
                candidateId: userId,
                resumeId: selectedResumeId,
                coverLetter: coverLetter.trim() || undefined,
            };
            await toast.promise(applicationService.create(applicationData), {
                loading: "Отправляем отклик...",
                success: "Отклик успешно отправлен!",
                error: (e) => handleApiError(e),
            });
            setShowApplyModal(false);
            router.push("/jobseeker/applications");
        } catch {
            // toast.promise уже показал ошибку
        } finally {
            setIsApplying(false);
        }
    };

    const handleStartChat = async (recipientId: number) => {
        setIsStartingChat(true);
        try {
            const conv = await chatService.getOrCreate(recipientId);
            router.push(`/messages/${conv.id}`);
        } catch {
            toast.error("Не удалось открыть чат");
        } finally {
            setIsStartingChat(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("ru-RU", {
                day: "numeric", month: "long", year: "numeric",
            });
        } catch { return "—"; }
    };

    if (loading || isLoading) return <VacancyDetailSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "rgb(var(--bg))" }}>
                <div className="text-5xl mb-2">😕</div>
                <p className="text-center max-w-md" style={{ color: "rgb(var(--text-2))" }}>{error}</p>
                <Link href="/jobseeker/vacancies">
                    <button className="btn-secondary flex items-center gap-2 px-5 py-2.5">
                        <ArrowLeft className="h-4 w-4" />
                        К списку вакансий
                    </button>
                </Link>
            </div>
        );
    }

    if (!vacancy) return null;

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <Link href="/jobseeker/vacancies">
                        <button className="btn-ghost flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад к вакансиям
                        </button>
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Основной контент */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Заголовок */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            className="card p-8">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h1 className="text-3xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                                    {vacancy.title}
                                </h1>
                                <FavoriteButton itemId={vacancy.id} itemType="VACANCY" />
                            </div>
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2" style={{ color: "rgb(var(--text-2))" }}>
                                    <Building2 className="h-4 w-4" style={{ color: "rgb(99,102,241)" }} />
                                    <span className="font-medium">{vacancy.companyName}</span>
                                </div>
                                {vacancy.salary && vacancy.salary > 0 && (
                                    <span className="badge badge-emerald px-3 py-1 text-sm">
                                        {vacancy.salary.toLocaleString()} ₽
                                    </span>
                                )}
                                {vacancy.createdAt && (
                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(vacancy.createdAt)}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Описание */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="card p-8">
                            <h2 className="text-base font-semibold mb-4" style={{ color: "rgb(var(--text-1))" }}>
                                Описание вакансии
                            </h2>
                            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "rgb(var(--text-2))" }}>
                                {vacancy.description}
                            </p>
                        </motion.div>

                        {/* Навыки */}
                        {skills.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                className="card p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-4 w-4" style={{ color: "rgb(99,102,241)" }} />
                                    <h2 className="text-base font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                                        Требуемые навыки
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, i) => (
                                        <motion.span
                                            key={skill.id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.18 + i * 0.04 }}
                                            className="badge badge-indigo px-3 py-1 text-sm"
                                        >
                                            {skill.name}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Компания */}
                        {company && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="card p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="h-4 w-4" style={{ color: "rgb(99,102,241)" }} />
                                    <h2 className="text-base font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                                        О компании
                                    </h2>
                                </div>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: "rgb(var(--text-1))" }}>
                                    {company.name}
                                </h3>
                                {company.description && (
                                    <p className="whitespace-pre-wrap leading-relaxed mb-4" style={{ color: "rgb(var(--text-2))" }}>
                                        {company.description}
                                    </p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {company.location && (
                                        <div className="flex items-center gap-2" style={{ color: "rgb(var(--text-2))" }}>
                                            <MapPin className="h-4 w-4 shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <span className="text-sm">{company.location}</span>
                                        </div>
                                    )}
                                    {company.email && (
                                        <div className="flex items-center gap-2" style={{ color: "rgb(var(--text-2))" }}>
                                            <Mail className="h-4 w-4 shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <span className="text-sm">{company.email}</span>
                                        </div>
                                    )}
                                    {company.phoneNumber && (
                                        <div className="flex items-center gap-2" style={{ color: "rgb(var(--text-2))" }}>
                                            <Phone className="h-4 w-4 shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <span className="text-sm">{company.phoneNumber}</span>
                                        </div>
                                    )}
                                    {company.website && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <a href={company.website} target="_blank" rel="noopener noreferrer"
                                                className="text-sm flex items-center gap-1 hover:underline"
                                                style={{ color: "rgb(99,102,241)" }}>
                                                {company.website}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Сайдбар */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card p-6 space-y-4 sticky top-24"
                        >
                            {vacancy.salary && vacancy.salary > 0 && (
                                <div className="pb-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                                        style={{ color: "rgb(var(--text-3))" }}>
                                        Зарплата
                                    </p>
                                    <p className="text-2xl font-bold" style={{ color: "rgb(16,185,129)" }}>
                                        {vacancy.salary.toLocaleString()} ₽
                                    </p>
                                </div>
                            )}

                            {userRole === "JOB_SEEKER" && (
                                <>
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={resumes.length === 0}
                                        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                        Откликнуться
                                    </button>
                                    {resumes.length === 0 && (
                                        <p className="text-center text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                            Сначала{" "}
                                            <Link href="/jobseeker/resumes/create"
                                                className="font-medium underline" style={{ color: "rgb(99,102,241)" }}>
                                                создайте резюме
                                            </Link>
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleStartChat(vacancy.employerId)}
                                        disabled={isStartingChat}
                                        className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Написать работодателю
                                    </button>
                                </>
                            )}

                            {company && (
                                <div className="pt-2 space-y-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 pt-2"
                                        style={{ color: "rgb(var(--text-3))" }}>
                                        Компания
                                    </p>
                                    <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-1))" }}>{company.name}</p>
                                    {company.location && (
                                        <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                            <MapPin className="h-3.5 w-3.5" />
                                            {company.location}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Модалка */}
            <AnimatePresence>
                {showApplyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                        onClick={() => setShowApplyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.93, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.93, opacity: 0, y: 16 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card w-full max-w-md p-6"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                                        Отклик на вакансию
                                    </h3>
                                    <p className="text-sm mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                        {vacancy.title}
                                    </p>
                                </div>
                                <button onClick={() => setShowApplyModal(false)} className="btn-ghost p-1.5 -mt-1 -mr-1">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-2))" }}>
                                    Выберите резюме
                                </label>
                                <div className="relative">
                                    <select
                                        className="input-field appearance-none pr-10"
                                        value={selectedResumeId || ""}
                                        onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                    >
                                        {resumes.map((resume) => (
                                            <option key={resume.id} value={resume.id}>{resume.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                        style={{ color: "rgb(var(--text-3))" }} />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-2))" }}>
                                    Сопроводительное письмо <span style={{ color: "rgb(var(--text-3))" }}>(необязательно)</span>
                                </label>
                                <textarea
                                    className="input-field resize-none"
                                    rows={4}
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Расскажите работодателю, почему вы подходите для этой позиции..."
                                    maxLength={2000}
                                />
                                <p className="text-xs mt-1 text-right" style={{ color: "rgb(var(--text-3))" }}>
                                    {coverLetter.length}/2000
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isApplying ? (
                                        <span className="flex gap-1">
                                            <span className="loading-dot" />
                                            <span className="loading-dot" />
                                            <span className="loading-dot" />
                                        </span>
                                    ) : (
                                        <><Send className="h-4 w-4" /> Отправить</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    disabled={isApplying}
                                    className="btn-secondary flex-1 py-2.5"
                                >
                                    Отмена
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
