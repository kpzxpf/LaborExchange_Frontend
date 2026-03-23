"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, User, MapPin, Trash2, Loader2, Bookmark, Briefcase } from "lucide-react";
import { favoriteService, resumeService } from "@/services/api";
import type { ResumeDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

interface FavoriteResume {
    favoriteId: number;
    resume: ResumeDto;
}

export default function EmployerFavoritesPage() {
    const [items, setItems] = useState<FavoriteResume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        favoriteService.getByType("RESUME")
            .then(async (favs) => {
                const results = await Promise.allSettled(
                    favs.map(async (f) => ({
                        favoriteId: f.id,
                        resume: await resumeService.getById(f.itemId),
                    }))
                );
                setItems(
                    results
                        .filter((r): r is PromiseFulfilledResult<FavoriteResume> => r.status === "fulfilled")
                        .map(r => r.value)
                );
            })
            .catch(() => toast.error("Не удалось загрузить избранное"))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = async (favoriteId: number, resumeId: number) => {
        try {
            await favoriteService.remove(resumeId, "RESUME");
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
                            Избранные резюме
                        </h1>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            {items.length} сохранённых резюме
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
                            Нет сохранённых резюме
                        </p>
                        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                            Нажмите на сердечко на карточке резюме, чтобы добавить в избранное
                        </p>
                        <Link href="/employer/resumes">
                            <button className="btn-primary py-2.5 px-6 text-sm">Найти кандидатов</button>
                        </Link>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-4">
                            {items.map(({ favoriteId, resume }) => (
                                <motion.div
                                    key={favoriteId}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card p-5 flex items-start justify-between gap-4"
                                >
                                    <Link href={`/employer/resumes/${resume.id}`} className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 flex-shrink-0" style={{ color: "rgb(99,102,241)" }} />
                                            <h3 className="font-semibold truncate" style={{ color: "rgb(var(--text-1))" }}>
                                                {resume.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-2 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                            {resume.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {resume.location}
                                                </span>
                                            )}
                                            {resume.desiredPosition && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3.5 w-3.5" />
                                                    {resume.desiredPosition}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(favoriteId, resume.id)}
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
