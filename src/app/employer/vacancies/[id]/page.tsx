"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase, MapPin, DollarSign, Building2, Clock,
    Edit, Trash2, ArrowLeft, Loader2, Sparkles,
    Share2, Mail, Phone, Globe, ExternalLink, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vacancyService, skillService, companyService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { CompanyDto } from "@/types";
import { toast } from "sonner";

interface Vacancy {
    id: number;
    title: string;
    description: string;
    salary?: number | null;
    location?: string;
    companyName: string;
    createdAt?: string;
    employerId: number;
    isPublished?: boolean;
}

interface Skill { id: number; name: string; }

function VacancySkeleton() {
    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card p-8 space-y-3">
                        <div className="skeleton h-7 w-2/3 rounded-xl" />
                        <div className="skeleton h-4 w-1/2 rounded-lg" />
                        <div className="skeleton h-4 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function VacancyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vacancyId = Number(params.id);
    const { userId } = useAuth();

    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => { loadVacancyData(); }, [vacancyId]);

    const loadVacancyData = async () => {
        try {
            setIsLoading(true);
            const vacancyData = await vacancyService.getById(vacancyId);
            setVacancy(vacancyData);
            const skillIds = await vacancyService.getSkillIds(vacancyId);
            const [skillNames, companyData] = await Promise.all([
                skillIds.length > 0 ? skillService.getNamesByIds(skillIds) : Promise.resolve([]),
                companyService.getByEmployerId(vacancyData.employerId).catch(() => null),
            ]);
            if (skillIds.length > 0) {
                setSkills(skillIds.map((id: number, i: number) => ({ id, name: skillNames[i] })));
            }
            setCompany(companyData);
        } catch {
            toast.error("Не удалось загрузить вакансию");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Вы уверены, что хотите удалить эту вакансию?")) return;
        try {
            setIsDeleting(true);
            await vacancyService.delete(vacancyId);
            router.push("/employer/vacancies");
        } catch {
            toast.error("Не удалось удалить вакансию");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePublishToggle = async () => {
        if (!vacancy) return;
        try {
            setIsPublishing(true);
            if (vacancy.isPublished) {
                await vacancyService.unpublish(vacancyId);
            } else {
                await vacancyService.publish(vacancyId);
            }
            setVacancy(prev => prev ? { ...prev, isPublished: !prev.isPublished } : prev);
        } catch {
            toast.error("Не удалось изменить статус публикации");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована!");
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

    if (isLoading) return <VacancySkeleton />;
    if (!vacancy) return null;

    const isOwner = userId === vacancy.employerId;
    const iconStyle = { color: "rgb(99,102,241)" };
    const t1 = { color: "rgb(var(--text-1))" } as const;
    const t2 = { color: "rgb(var(--text-2))" } as const;
    const t3 = { color: "rgb(var(--text-3))" } as const;

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Sticky header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="page-header-glass border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <motion.button whileHover={{ scale: 1.05, x: -3 }} whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="btn-ghost flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">Назад</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            {isOwner && (
                                <>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handlePublishToggle} disabled={isPublishing}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
                                            vacancy.isPublished
                                                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                        )}>
                                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : vacancy.isPublished ? <EyeOff className="w-4 h-4" />
                                            : <Eye className="w-4 h-4" />}
                                        <span className="hidden sm:inline">
                                            {vacancy.isPublished ? "Снять" : "Опубликовать"}
                                        </span>
                                    </motion.button>

                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/employer/vacancies/${vacancyId}/edit`)}
                                        className="btn-secondary flex items-center gap-2 px-3 py-2 text-sm">
                                        <Edit className="w-4 h-4" />
                                        <span className="hidden sm:inline">Изменить</span>
                                    </motion.button>

                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleDelete} disabled={isDeleting}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        <span className="hidden sm:inline">Удалить</span>
                                    </motion.button>
                                </>
                            )}

                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Поделиться</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                                    {vacancy.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-bold mb-2" style={t1}>{vacancy.title}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm" style={t2}>
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4" style={iconStyle} />
                                            <span>{vacancy.companyName}</span>
                                        </div>
                                        {vacancy.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" style={iconStyle} />
                                                <span>{vacancy.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="glass-card p-8">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={t1}>
                                <Briefcase className="w-4 h-4" style={iconStyle} />
                                Описание вакансии
                            </h2>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm" style={t2}>
                                {vacancy.description}
                            </p>
                        </motion.div>

                        {/* Skills */}
                        <AnimatePresence>
                            {skills.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8">
                                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={t1}>
                                        <Sparkles className="w-4 h-4" style={iconStyle} />
                                        Требуемые навыки
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, i) => (
                                            <motion.span key={skill.id}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.25 + i * 0.05 }}
                                                className="badge badge-indigo px-3 py-1 text-sm">
                                                {skill.name}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Company */}
                        <AnimatePresence>
                            {company && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }} transition={{ delay: 0.25 }} className="glass-card p-8">
                                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={t1}>
                                        <Building2 className="w-4 h-4" style={iconStyle} />
                                        О компании
                                    </h2>
                                    <p className="text-base font-semibold mb-2" style={t1}>{company.name}</p>
                                    {company.description && (
                                        <p className="whitespace-pre-wrap leading-relaxed mb-4 text-sm" style={t2}>
                                            {company.description}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {company.location && (
                                            <div className="flex items-center gap-2 text-sm" style={t2}>
                                                <MapPin className="w-4 h-4 shrink-0" style={iconStyle} />
                                                <span>{company.location}</span>
                                            </div>
                                        )}
                                        {company.email && (
                                            <div className="flex items-center gap-2 text-sm" style={t2}>
                                                <Mail className="w-4 h-4 shrink-0" style={iconStyle} />
                                                <span>{company.email}</span>
                                            </div>
                                        )}
                                        {company.phoneNumber && (
                                            <div className="flex items-center gap-2 text-sm" style={t2}>
                                                <Phone className="w-4 h-4 shrink-0" style={iconStyle} />
                                                <span>{company.phoneNumber}</span>
                                            </div>
                                        )}
                                        {company.website && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Globe className="w-4 h-4 shrink-0" style={iconStyle} />
                                                <a href={company.website} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:underline"
                                                    style={{ color: "rgb(99,102,241)" }}>
                                                    {company.website}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="glass-card p-6 space-y-4 sticky top-24">
                            <h3 className="font-semibold text-sm uppercase tracking-wider" style={t3}>
                                Детали вакансии
                            </h3>

                            {vacancy.salary && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center icon-box-emerald">
                                        <DollarSign className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                                    </div>
                                    <div>
                                        <p className="text-xs" style={t3}>Зарплата</p>
                                        <p className="font-semibold text-sm" style={t1}>
                                            {vacancy.salary.toLocaleString()} ₽
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center icon-box-amber">
                                    <Clock className="w-5 h-5" style={{ color: "rgb(245,158,11)" }} />
                                </div>
                                <div>
                                    <p className="text-xs" style={t3}>Опубликовано</p>
                                    <p className="font-semibold text-sm" style={t1}>
                                        {vacancy.createdAt ? formatDate(vacancy.createdAt) : "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: vacancy.isPublished ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.1)", border: vacancy.isPublished ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(148,163,184,0.15)" }}>
                                    {vacancy.isPublished
                                        ? <Eye className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                                        : <EyeOff className="w-5 h-5" style={{ color: "rgb(var(--text-3))" }} />}
                                </div>
                                <div>
                                    <p className="text-xs" style={t3}>Статус</p>
                                    <p className="font-semibold text-sm" style={t1}>
                                        {vacancy.isPublished ? "Опубликована" : "Черновик"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
