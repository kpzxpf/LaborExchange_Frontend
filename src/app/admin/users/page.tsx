"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, Trash2, Loader2, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminService, AdminUserDto } from "@/services/api";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";
import type { PageResponse } from "@/types";

export default function AdminUsersPage() {
    const [data, setData] = useState<PageResponse<AdminUserDto> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const load = (p: number) => {
        setLoading(true);
        adminService.getUsers(p, 20)
            .then(setData)
            .catch(() => toast.error("Не удалось загрузить пользователей"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(page); }, [page]);

    const handleDeactivate = async (userId: number) => {
        setActionLoading(userId);
        try {
            await adminService.deactivateUser(userId);
            toast.success("Пользователь деактивирован");
            load(page);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (userId: number) => {
        setActionLoading(userId);
        try {
            await adminService.activateUser(userId);
            toast.success("Пользователь активирован");
            load(page);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: number, username: string) => {
        if (!confirm(`Удалить пользователя "${username}"? Это действие необратимо.`)) return;
        setActionLoading(userId);
        try {
            await adminService.deleteUser(userId);
            toast.success("Пользователь удалён");
            load(page);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setActionLoading(null);
        }
    };

    const roleColor: Record<string, string> = {
        ADMIN: "rgb(239,68,68)",
        EMPLOYER: "rgb(99,102,241)",
        JOB_SEEKER: "rgb(34,197,94)",
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
                        style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                    >
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            Управление пользователями
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
                                        {["ID", "Пользователь", "Email", "Роль", "Статус", "Верификация", "Действия"].map(h => (
                                            <th key={h} className="text-left px-4 py-3 font-medium"
                                                style={{ color: "rgb(var(--text-3))" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.content.map((u, i) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                        >
                                            <td className="px-4 py-3" style={{ color: "rgb(var(--text-3))" }}>
                                                {u.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium" style={{ color: "rgb(var(--text-1))" }}>
                                                {u.username}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: "rgb(var(--text-2))" }}>
                                                {u.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{
                                                        color: roleColor[u.roleName] ?? "rgb(var(--text-3))",
                                                        background: `${roleColor[u.roleName] ?? "rgb(var(--text-3))"}18`,
                                                    }}>
                                                    {u.roleName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{
                                                        color: u.active ? "rgb(34,197,94)" : "rgb(239,68,68)",
                                                        background: u.active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                                    }}>
                                                    {u.active ? "Активен" : "Заблокирован"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.emailVerified
                                                    ? <CheckCircle className="h-4 w-4" style={{ color: "rgb(34,197,94)" }} />
                                                    : <XCircle className="h-4 w-4" style={{ color: "rgb(var(--text-3))" }} />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {actionLoading === u.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                                                    ) : (
                                                        <>
                                                            {u.active ? (
                                                                <button
                                                                    onClick={() => handleDeactivate(u.id)}
                                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                                    title="Заблокировать"
                                                                    style={{ color: "rgb(239,68,68)" }}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivate(u.id)}
                                                                    className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors"
                                                                    title="Разблокировать"
                                                                    style={{ color: "rgb(34,197,94)" }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {u.roleName !== "ADMIN" && (
                                                                <button
                                                                    onClick={() => handleDelete(u.id, u.username)}
                                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                                    title="Удалить"
                                                                    style={{ color: "rgb(239,68,68)" }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </>
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
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
                                >
                                    Назад
                                </button>
                                <span className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    {page + 1} / {data.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                    disabled={page >= data.totalPages - 1}
                                    className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
                                >
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
