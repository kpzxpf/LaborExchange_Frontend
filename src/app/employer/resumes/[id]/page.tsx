"use client";

import { useEffect, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Mail, Phone, MapPin, Award,
    GraduationCap, Building2, Globe, Briefcase,
    Calendar, MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resumeService, educationService, skillService, workExperienceService, chatService } from "@/services/api";
import type { ResumeDto, EducationDto, SkillDto, WorkExperienceDto } from "@/types";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { toast } from "sonner";

const MONTHS_SHORT = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

function formatPeriod(startYear?: number, startMonth?: number, endYear?: number, endMonth?: number, isCurrent?: boolean) {
    const start = [startMonth ? MONTHS_SHORT[startMonth - 1] : null, startYear].filter(Boolean).join(" ");
    const end = isCurrent ? "по настоящее время" : [endMonth ? MONTHS_SHORT[endMonth - 1] : null, endYear].filter(Boolean).join(" ") || null;
    return end ? `${start} — ${end}` : start;
}

function calcDurationLabel(startYear?: number, startMonth?: number, endYear?: number, endMonth?: number, isCurrent?: boolean): string | null {
    if (!startYear) return null;
    const now = new Date();
    const endY = isCurrent ? now.getFullYear() : (endYear ?? startYear);
    const endM = isCurrent ? now.getMonth() + 1 : (endMonth ?? 1);
    const startM = startMonth ?? 1;
    const months = (endY - startYear) * 12 + (endM - startM);
    if (months <= 0) return null;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"}`);
    if (rem > 0) parts.push(`${rem} ${rem === 1 ? "месяц" : rem < 5 ? "месяца" : "месяцев"}`);
    return parts.join(" ") || null;
}

function SectionTitle({ icon: Icon, label }: { icon: ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.12)" }}>
                <Icon className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-2))" }}>
                {label}
            </h2>
        </div>
    );
}

function DescriptionBlock({ text }: { text: string }) {
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length <= 1) {
        return <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-2))" }}>{text}</p>;
    }
    return (
        <ul className="space-y-1">
            {lines.map((line, i) => {
                const clean = line.replace(/^[-•*]\s*/, "");
                return (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: "rgb(var(--text-2))" }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgb(99,102,241)" }} />
                        {clean}
                    </li>
                );
            })}
        </ul>
    );
}

function ResumeSkeleton() {
    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
                <div className="skeleton h-8 w-20 rounded-xl" />
                <div className="card p-0 overflow-hidden">
                    <div className="h-32 skeleton" />
                    <div className="p-8 space-y-3">
                        <div className="skeleton h-7 w-2/3 rounded-xl" />
                        <div className="skeleton h-4 w-1/3 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                    <div className="card p-6 space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded-lg" />)}
                    </div>
                    <div className="space-y-4">
                        <div className="card p-6 space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded-lg" />)}
                        </div>
                        <div className="card p-6 space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded-lg" />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EmployerResumeViewPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, userRole, loading } = useAuth();
    const [resume, setResume] = useState<ResumeDto | null>(null);
    const [education, setEducation] = useState<EducationDto[]>([]);
    const [skills, setSkills] = useState<SkillDto[]>([]);
    const [workExp, setWorkExp] = useState<WorkExperienceDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartingChat, setIsStartingChat] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "EMPLOYER") { router.push("/auth/login"); return; }
        if (params.id) fetchResumeData();
    }, [params.id, isAuthenticated, userRole, loading, router]);

    const fetchResumeData = async () => {
        setIsLoading(true);
        try {
            const id = Number(params.id);
            const [r, edu, sk, we] = await Promise.all([
                resumeService.getById(id),
                educationService.getByResume(id),
                skillService.getSkillsForResume(id),
                workExperienceService.getByResume(id),
            ]);
            setResume(r); setEducation(edu || []); setSkills(sk || []); setWorkExp(we || []);
        } catch {
            toast.error("Не удалось загрузить данные резюме");
            router.push("/employer/applications");
        } finally { setIsLoading(false); }
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

    if (loading || isLoading) return <ResumeSkeleton />;
    if (!resume) return null;

    const fullName = [resume.firstName, resume.lastName].filter(Boolean).join(" ");
    const expLabel = resume.experienceYears != null
        ? `${resume.experienceYears} ${resume.experienceYears === 1 ? "год" : resume.experienceYears < 5 ? "года" : "лет"} опыта`
        : null;

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
                    <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-sm">
                        <ArrowLeft className="h-4 w-4" /> Назад
                    </button>
                </motion.div>

                {/* ── HERO CARD ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
                    className="card overflow-hidden mb-4">
                    <div className="h-32 relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)" }}>
                        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 128" preserveAspectRatio="none">
                            <path d="M0,64 C80,20 160,100 240,60 C320,20 380,80 400,64 L400,128 L0,128 Z" fill="white" />
                            <path d="M0,90 C60,50 140,110 220,75 C300,40 360,90 400,80 L400,128 L0,128 Z" fill="white" opacity="0.5" />
                        </svg>
                    </div>

                    <div className="px-8 pb-7 pt-5">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                            {fullName && <h1 className="text-2xl font-bold">{fullName}</h1>}
                            <p className={`${fullName ? "text-base font-medium" : "text-2xl font-bold"}`}
                                style={{ color: fullName ? "rgb(99,102,241)" : "rgb(var(--text-1))" }}>
                                {resume.title}
                            </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleStartChat(resume.userId)}
                                    disabled={isStartingChat}
                                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-sm disabled:opacity-50"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Написать
                                </button>
                                <FavoriteButton itemId={resume.id} itemType="RESUME" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {resume.location && (
                                <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                                    style={{ background: "rgba(var(--text-3),0.08)", color: "rgb(var(--text-2))" }}>
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    {resume.location}
                                </span>
                            )}
                            {expLabel && (
                                <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                                    style={{ background: "rgba(99,102,241,0.1)", color: "rgb(99,102,241)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                    {expLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── TWO-COLUMN BODY ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-start">

                    {/* LEFT SIDEBAR */}
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                        className="space-y-4">

                        {(resume.contactEmail || resume.contactPhone) && (
                            <div className="card p-6">
                                <SectionTitle icon={Mail} label="Контакты" />
                                <div className="space-y-3">
                                    {resume.contactEmail && (
                                        <a href={`mailto:${resume.contactEmail}`}
                                            className="flex items-center gap-3 text-sm hover:underline"
                                            style={{ color: "rgb(var(--text-2))" }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(99,102,241,0.1)" }}>
                                                <Mail className="w-3.5 h-3.5" style={{ color: "rgb(99,102,241)" }} />
                                            </div>
                                            <span className="break-all">{resume.contactEmail}</span>
                                        </a>
                                    )}
                                    {resume.contactPhone && (
                                        <a href={`tel:${resume.contactPhone}`}
                                            className="flex items-center gap-3 text-sm hover:underline"
                                            style={{ color: "rgb(var(--text-2))" }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(99,102,241,0.1)" }}>
                                                <Phone className="w-3.5 h-3.5" style={{ color: "rgb(99,102,241)" }} />
                                            </div>
                                            {resume.contactPhone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {skills.length > 0 && (
                            <div className="card p-6">
                                <SectionTitle icon={Award} label="Навыки" />
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        <span key={skill.id}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                            style={{
                                                background: "rgba(99,102,241,0.1)",
                                                color: "rgb(99,102,241)",
                                                border: "1px solid rgba(99,102,241,0.15)"
                                            }}>
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* RIGHT MAIN */}
                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="space-y-4">

                        {resume.summary && (
                            <div className="card p-6">
                                <SectionTitle icon={Globe} label="О кандидате" />
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgb(var(--text-2))" }}>
                                    {resume.summary}
                                </p>
                            </div>
                        )}

                        {workExp.length > 0 && (
                            <div className="card p-6">
                                <SectionTitle icon={Building2} label="Опыт работы" />
                                <div className="space-y-0">
                                    {workExp.map((w, i) => (
                                        <div key={w.id ?? i}
                                            className={`relative pl-6 pb-7 ${i !== workExp.length - 1 ? "border-l" : ""}`}
                                            style={{ borderColor: "rgba(99,102,241,0.2)", marginLeft: "7px" }}>
                                            <div className={`absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full border-2 ${
                                                w.isCurrent
                                                    ? "border-emerald-400 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                                    : "border-indigo-400"
                                            }`}
                                                style={!w.isCurrent ? { background: "rgb(var(--bg))" } : {}} />

                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                <div>
                                                    <h3 className="font-semibold text-base">{w.position}</h3>
                                                    <p className="text-sm font-medium" style={{ color: "rgb(99,102,241)" }}>{w.companyName}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs" style={{ color: "rgb(var(--text-3))" }}>
                                                        {formatPeriod(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent)}
                                                    </p>
                                                    {calcDurationLabel(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent) && (
                                                        <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                                            {calcDurationLabel(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent)}
                                                        </p>
                                                    )}
                                                    {w.isCurrent && (
                                                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            Текущее место
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {w.description && (
                                                <div className="mt-2">
                                                    <DescriptionBlock text={w.description} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {education.length > 0 && (
                            <div className="card p-6">
                                <SectionTitle icon={GraduationCap} label="Образование" />
                                <div className="space-y-5">
                                    {education.map((edu, i) => (
                                        <div key={edu.id ?? i}
                                            className={i !== 0 ? "pt-5 border-t" : ""}
                                            style={{ borderColor: "var(--card-border)" }}>
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                    style={{ background: "rgba(99,102,241,0.1)" }}>
                                                    <GraduationCap className="w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                                        <div>
                                                            <h4 className="font-semibold text-sm">{edu.degree}</h4>
                                                            <p className="text-sm font-medium mt-0.5" style={{ color: "rgb(99,102,241)" }}>{edu.institution}</p>
                                                            {edu.fieldOfStudy && (
                                                                <p className="text-sm mt-0.5" style={{ color: "rgb(var(--text-2))" }}>{edu.fieldOfStudy}</p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs shrink-0 whitespace-nowrap" style={{ color: "rgb(var(--text-3))" }}>
                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                            {edu.startYear} — {edu.endYear ?? "наст. время"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
