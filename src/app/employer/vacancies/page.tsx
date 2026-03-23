"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Trash2, Briefcase, Globe, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { vacancyService } from "@/services/api";
import type { VacancyDto } from "@/types";
import { toast } from "sonner";

function VacanciesSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-6 w-1/2 rounded-lg" />
                            <div className="skeleton h-4 w-1/3 rounded-lg" />
                            <div className="skeleton h-4 w-full rounded-lg" />
                        </div>
                        <div className="flex gap-2">
                            <div className="skeleton h-9 w-24 rounded-xl" />
                            <div className="skeleton h-9 w-20 rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function EmployerVacanciesPage() {
    const { isAuthenticated, userRole, userId, loading } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }
        if (isAuthenticated && userRole === "EMPLOYER" && userId) fetchVacancies();
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchVacancies = async () => {
        setIsLoading(true);
        try {
            const response = await vacancyService.getByEmployer(userId!, 0, 100);
            setVacancies(Array.isArray(response.content) ? response.content : []);
        } catch {
            toast.error("Не удалось загрузить вакансии");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить вакансию?")) return;
        try {
            await vacancyService.delete(id);
            toast.success("Вакансия удалена");
            fetchVacancies();
        } catch {
            toast.error("Не удалось удалить вакансию");
        }
    };

    const handleTogglePublish = async (vacancy: VacancyDto) => {
        try {
            if (vacancy.isPublished) {
                await vacancyService.unpublish(vacancy.id);
                toast.success("Вакансия снята с публикации");
            } else {
                await vacancyService.publish(vacancy.id);
                toast.success("Вакансия опубликована");
            }
            fetchVacancies();
        } catch {
            toast.error("Не удалось изменить статус");
        }
    };

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: "rgb(var(--text-1))" }}>Мои вакансии</h1>
                        <p className="mt-1 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Управление объявлениями
                        </p>
                    </div>
                    <Link href="/employer/vacancies/create">
                        <button className="btn-primary flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Новая вакансия
                        </button>
                    </Link>
                </motion.div>

                {/* List */}
                {loading || isLoading ? (
                    <VacanciesSkeleton />
                ) : vacancies.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 icon-box">
                            <Briefcase className="h-8 w-8" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-1))" }}>Вакансий пока нет</h3>
                        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                            Создайте первое объявление о вакансии, чтобы начать набор персонала
                        </p>
                        <Link href="/employer/vacancies/create">
                            <button className="btn-primary flex items-center gap-2 mx-auto">
                                <Plus className="h-4 w-4" />
                                Разместить вакансию
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {vacancies.map((vacancy, index) => (
                            <motion.div
                                key={vacancy.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -2 }}
                                className="card p-6"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                                                {vacancy.title}
                                            </h3>
                                            <span className={`badge ${vacancy.isPublished ? "badge-emerald" : "badge-slate"}`}>
                                                {vacancy.isPublished ? "Опубликована" : "Черновик"}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm mb-3"
                                            style={{ color: "rgb(var(--text-3))" }}>
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {vacancy.companyName}
                                            </div>
                                            {vacancy.salary && vacancy.salary > 0 && (
                                                <span className="badge badge-emerald">
                                                    {vacancy.salary.toLocaleString()} ₽
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm line-clamp-2" style={{ color: "rgb(var(--text-3))" }}>
                                            {vacancy.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleTogglePublish(vacancy)}
                                            className={`text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                                                vacancy.isPublished
                                                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                            }`}
                                        >
                                            {vacancy.isPublished
                                                ? <><EyeOff className="h-3.5 w-3.5" /> Скрыть</>
                                                : <><Globe className="h-3.5 w-3.5" /> Опубликовать</>}
                                        </button>
                                        <Link href={`/employer/vacancies/${vacancy.id}`}>
                                            <button className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
                                                <Eye className="h-3.5 w-3.5" /> Просмотр
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(vacancy.id)}
                                            className="p-2 rounded-xl text-[rgb(var(--text-3))] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
