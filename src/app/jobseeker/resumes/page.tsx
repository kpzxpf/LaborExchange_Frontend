"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus, Eye, Edit, Trash2, FileText, MapPin,
    Briefcase, Mail, Globe, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resumeService } from "@/services/api";
import type { ResumeDto } from "@/types";
import { toast } from "sonner";

const GRADIENTS = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
];

function getInitials(r: ResumeDto) {
    if (r.firstName || r.lastName) {
        return `${(r.firstName ?? "")[0] ?? ""}${(r.lastName ?? "")[0] ?? ""}`.toUpperCase();
    }
    return r.title.slice(0, 2).toUpperCase();
}

function getFullName(r: ResumeDto) {
    if (r.firstName || r.lastName) return [r.firstName, r.lastName].filter(Boolean).join(" ");
    return null;
}

function SkeletonCard() {
    return (
        <div className="card overflow-hidden">
            <div className="h-24 skeleton" />
            <div className="p-5 space-y-3">
                <div className="skeleton h-5 w-2/3 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded-lg" />
                <div className="skeleton h-4 w-full rounded-lg" />
                <div className="flex gap-2 pt-2">
                    <div className="skeleton h-8 flex-1 rounded-xl" />
                    <div className="skeleton h-8 flex-1 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function ResumesListPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "JOB_SEEKER") { router.push("/auth/login"); return; }
        if (userId) fetchResumes();
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchResumes = async () => {
        setIsLoading(true);
        try { setResumes((await resumeService.getMy()) || []); }
        catch { toast.error("Не удалось загрузить резюме"); setResumes([]); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить резюме?")) return;
        try { await resumeService.delete(id); toast.success("Резюме удалено"); fetchResumes(); }
        catch { toast.error("Не удалось удалить резюме"); }
    };

    const handleTogglePublish = async (resume: ResumeDto) => {
        try {
            resume.isPublished ? await resumeService.unpublish(resume.id) : await resumeService.publish(resume.id);
            toast.success(resume.isPublished ? "Снято с публикации" : "Опубликовано");
            fetchResumes();
        } catch { toast.error("Не удалось изменить статус"); }
    };

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Мои резюме</h1>
                        <p className="mt-1 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            {resumes.length > 0 ? `${resumes.length} ${resumes.length === 1 ? "резюме" : resumes.length < 5 ? "резюме" : "резюме"}` : "Управляйте резюме и откликайтесь на вакансии"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/jobseeker/resumes/create">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))", border: "1px solid rgba(99,102,241,0.35)", color: "rgb(99,102,241)" }}>
                                <Sparkles className="w-4 h-4" /> Создать с ИИ
                            </motion.button>
                        </Link>
                        <Link href="/jobseeker/resumes/create">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="btn-primary flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Новое резюме
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Content */}
                {loading || isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : resumes.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-box">
                            <FileText className="h-8 w-8" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Пока нет резюме</h3>
                        <p className="mb-6 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Создайте своё первое резюме, чтобы начать откликаться на вакансии
                        </p>
                        <Link href="/jobseeker/resumes/create">
                            <button className="btn-primary flex items-center gap-2 mx-auto">
                                <Plus className="h-4 w-4" /> Создать первое резюме
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {resumes.map((resume, index) => {
                                const gradient = GRADIENTS[index % GRADIENTS.length];
                                const fullName = getFullName(resume);

                                return (
                                    <motion.div key={resume.id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.06 }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="card overflow-hidden flex flex-col">

                                        {/* Gradient header */}
                                        <div className={`relative bg-gradient-to-br ${gradient} p-5`}>
                                            <div className="flex items-start justify-between">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    resume.isPublished
                                                        ? "bg-white/20 text-white border border-white/30"
                                                        : "bg-black/20 text-white/80 border border-white/10"
                                                }`}>
                                                    {resume.isPublished ? "Опубликовано" : "Черновик"}
                                                </span>
                                            </div>
                                            {fullName && (
                                                <p className="text-white/90 font-semibold mt-3 text-sm">{fullName}</p>
                                            )}
                                            <h3 className="text-white font-bold mt-1 text-base leading-tight line-clamp-2">
                                                {resume.title}
                                            </h3>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 flex flex-col flex-1">
                                            {/* Meta chips */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {resume.location && (
                                                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                                        style={{ background: "rgba(99,102,241,0.08)", color: "rgb(var(--text-2))", border: "1px solid var(--card-border)" }}>
                                                        <MapPin className="w-3 h-3" /> {resume.location}
                                                    </span>
                                                )}
                                                {resume.experienceYears != null && (
                                                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                                        style={{ background: "rgba(99,102,241,0.08)", color: "rgb(var(--text-2))", border: "1px solid var(--card-border)" }}>
                                                        <Briefcase className="w-3 h-3" /> {resume.experienceYears} {resume.experienceYears === 1 ? "год" : resume.experienceYears < 5 ? "года" : "лет"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Summary preview */}
                                            {resume.summary && (
                                                <p className="text-sm line-clamp-2 mb-3 flex-1 leading-relaxed"
                                                    style={{ color: "rgb(var(--text-3))" }}>
                                                    {resume.summary}
                                                </p>
                                            )}

                                            {/* Contact */}
                                            {resume.contactEmail && (
                                                <div className="flex items-center gap-1.5 mb-4">
                                                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-3))" }} />
                                                    <span className="text-xs truncate" style={{ color: "rgb(var(--text-3))" }}>
                                                        {resume.contactEmail}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 pt-4 border-t mt-auto" style={{ borderColor: "var(--card-border)" }}>
                                                <div className="flex gap-2">
                                                    <Link href={`/jobseeker/resumes/${resume.id}`} className="flex-1">
                                                        <button className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5">
                                                            <Eye className="h-3.5 w-3.5" /> Просмотр
                                                        </button>
                                                    </Link>
                                                    <Link href={`/jobseeker/resumes/${resume.id}/edit`} className="flex-1">
                                                        <button className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5">
                                                            <Edit className="h-3.5 w-3.5" /> Изменить
                                                        </button>
                                                    </Link>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleTogglePublish(resume)}
                                                        className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-all ${
                                                            resume.isPublished
                                                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                        }`}>
                                                        <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                                                        {resume.isPublished ? "Снять" : "Опубликовать"}
                                                    </button>
                                                    <button onClick={() => handleDelete(resume.id)}
                                                        className="p-2 rounded-xl transition-all hover:text-red-400 hover:bg-red-500/10"
                                                        style={{ color: "rgb(var(--text-3))" }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
