"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, Briefcase, MapPin, DollarSign, Trash2, Loader2, Bookmark } from "lucide-react";
import { favoriteService } from "@/services/api";
import { vacancyService } from "@/services/api";
import type { VacancyDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

interface FavoriteVacancy {
    favoriteId: number;
    vacancy: VacancyDto;
}

export default function JobseekerFavoritesPage() {
    const [items, setItems] = useState<FavoriteVacancy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        favoriteService.getByType("VACANCY")
            .then(async (favs) => {
                const results = await Promise.allSettled(
                    favs.map(async (f) => ({
                        favoriteId: f.id,
                        vacancy: await vacancyService.getById(f.itemId),
                    }))
                );
                setItems(
                    results
                        .filter((r): r is PromiseFulfilledResult<FavoriteVacancy> => r.status === "fulfilled")
                        .map(r => r.value)
                );
            })
            .catch(() => toast.error("Не удалось загрузить избранное"))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = async (favoriteId: number, vacancyId: number) => {
        try {
            await favoriteService.remove(vacancyId, "VACANCY");
            setItems(prev => prev.filter(i => i.favoriteId !== favoriteId));
            toast.success("Удалено из избранного");
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                    >
                        <Bookmark className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            Избранные вакансии
                        </h1>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            {items.length} сохранённых вакансий
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                    </div>
                ) : items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <Heart className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="text-lg font-medium mb-2" style={{ color: "rgb(var(--text-1))" }}>
                            Нет сохранённых вакансий
                        </p>
                        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                            Нажмите на сердечко на карточке вакансии, чтобы добавить в избранное
                        </p>
                        <Link href="/jobseeker/vacancies">
                            <button className="btn-primary py-2.5 px-6 text-sm">Найти вакансии</button>
                        </Link>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-4">
                            {items.map(({ favoriteId, vacancy }) => (
                                <motion.div
                                    key={favoriteId}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card p-5 flex items-start justify-between gap-4"
                                >
                                    <Link href={`/jobseeker/vacancies/${vacancy.id}`} className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Briefcase className="h-4 w-4 flex-shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <h3 className="font-semibold truncate" style={{ color: "rgb(var(--text-1))" }}>
                                                {vacancy.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-2 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                            {vacancy.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {vacancy.location}
                                                </span>
                                            )}
                                            {vacancy.salary && vacancy.salary > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    {vacancy.salary.toLocaleString()} ₽
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(favoriteId, vacancy.id)}
                                        className="flex-shrink-0 p-2 rounded-lg transition-colors"
                                        style={{ color: "rgb(239,68,68)" }}
                                        title="Удалить из избранного"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
