"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Trash2, Loader2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { vacancyService } from "@/services/api";
import type { VacancyDto, PageResponse } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

export default function AdminVacanciesPage() {
    const [data, setData] = useState<PageResponse<VacancyDto> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const load = (p: number) => {
        setLoading(true);
        vacancyService.getAll(p, 20)
            .then(setData)
            .catch(() => toast.error("Не удалось загрузить вакансии"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(page); }, [page]);

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Удалить вакансию "${title}"?`)) return;
        setActionLoading(id);
        try {
            await vacancyService.delete(id);
            toast.success("Вакансия удалена");
            load(page);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/dashboard">
                        <button className="btn-ghost flex items-center gap-2 text-sm">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </button>
                    </Link>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgb(34,197,94), rgb(16,185,129))" }}
                    >
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            Модерация вакансий
                        </h1>
                        {data && (
                            <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                Всего: {data.totalElements}
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                        {["ID", "Название", "Компания", "Локация", "Статус", "Действия"].map(h => (
                                            <th key={h} className="text-left px-4 py-3 font-medium"
                                                style={{ color: "rgb(var(--text-3))" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.content.map((v, i) => (
                                        <motion.tr
                                            key={v.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                        >
                                            <td className="px-4 py-3" style={{ color: "rgb(var(--text-3))" }}>{v.id}</td>
                                            <td className="px-4 py-3 font-medium max-w-xs truncate"
                                                style={{ color: "rgb(var(--text-1))" }}>
                                                {v.title}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: "rgb(var(--text-2))" }}>
                                                {v.companyName ?? "—"}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: "rgb(var(--text-3))" }}>
                                                {v.location ?? "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{
                                                        color: v.published ? "rgb(34,197,94)" : "rgb(var(--text-3))",
                                                        background: v.published ? "rgba(34,197,94,0.12)" : "rgba(var(--text-3),0.08)",
                                                    }}>
                                                    {v.published ? "Опубликована" : "Черновик"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/jobseeker/vacancies/${v.id}`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                                                            title="Просмотр" style={{ color: "rgb(99,102,241)" }}>
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                    {actionLoading === v.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDelete(v.id, v.title)}
                                                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                            title="Удалить" style={{ color: "rgb(239,68,68)" }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 py-4"
                                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <button onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40">
                                    Назад
                                </button>
                                <span className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    {page + 1} / {data.totalPages}
                                </span>
                                <button onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                    disabled={page >= data.totalPages - 1}
                                    className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40">
                                    Вперёд
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
