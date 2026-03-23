"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Phone, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import type { UserDto } from "@/types";
import { toast } from "sonner";

const inputCls =
    "w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 focus:bg-foreground/[0.07] transition-all";


function Field({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="p-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl">
            <p className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                {icon}{label}
            </p>
            <p className="font-medium" style={{ color: "rgb(var(--text-1))" }}>{value}</p>
        </div>
    );
}

export default function JobSeekerProfilePage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", phoneNumber: "" });

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "JOB_SEEKER") { router.push("/auth/login"); return; }
        if (userId) fetchProfile();
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<UserDto>(`/api/users/${userId}/profile`);
            setProfile(res.data);
            setForm({
                username: res.data.username || "",
                email: res.data.email || "",
                firstName: res.data.firstName || "",
                lastName: res.data.lastName || "",
                phoneNumber: res.data.phoneNumber || "",
            });
        } catch { toast.error("Не удалось загрузить профиль"); }
        finally { setIsLoading(false); }
    };

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            await apiClient.put(`/api/users/${userId}`, form);
            toast.success("Профиль обновлён");
            setIsEditing(false);
            fetchProfile();
        } catch { toast.error("Не удалось сохранить"); }
        finally { setIsSaving(false); }
    };

    const cancelEdit = () => {
        if (!profile) return;
        setForm({ username: profile.username || "", email: profile.email || "", firstName: profile.firstName || "", lastName: profile.lastName || "", phoneNumber: profile.phoneNumber || "" });
        setIsEditing(false);
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{ background: "radial-gradient(circle, rgb(99,102,241), transparent)" }} />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 py-12 space-y-6">

                {/* Hero card */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-foreground/[0.08] p-8"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at top left, rgba(99,102,241,0.12), transparent 60%)" }} />

                    <div className="relative flex items-center gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="text-2xl font-bold truncate" style={{ color: "rgb(var(--text-1))" }}>
                                    {displayName}
                                </h1>
                                <span className="badge badge-indigo text-xs">Соискатель</span>
                            </div>
                            <p className="text-sm mb-0.5" style={{ color: "rgb(var(--text-3))" }}>@{profile.username}</p>
                            <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>{profile.email}</p>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-foreground/10 text-sm transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                                style={{ color: "rgb(var(--text-2))" }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Изменить
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Info / Edit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="rounded-3xl border border-foreground/[0.08] p-6 space-y-5"
                                style={{ background: "rgba(255,255,255,0.02)" }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-semibold" style={{ color: "rgb(var(--text-1))" }}>Редактирование</h2>
                                    <button onClick={cancelEdit} className="text-foreground/40 hover:text-foreground/70 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: "Имя пользователя", key: "username", type: "text" },
                                        { label: "Email", key: "email", type: "email" },
                                        { label: "Имя", key: "firstName", type: "text" },
                                        { label: "Фамилия", key: "lastName", type: "text" },
                                        { label: "Телефон", key: "phoneNumber", type: "tel" },
                                    ].map(({ label, key, type }) => (
                                        <div key={key}>
                                            <label className="text-xs mb-1.5 block" style={{ color: "rgb(var(--text-3))" }}>{label}</label>
                                            <input
                                                type={type}
                                                value={form[key as keyof typeof form]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                                        style={{ background: "rgb(99,102,241)" }}
                                    >
                                        <Check className="w-4 h-4" />
                                        {isSaving ? "Сохранение..." : "Сохранить"}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 rounded-xl text-sm border border-foreground/10 transition-colors hover:bg-foreground/5 disabled:opacity-60"
                                        style={{ color: "rgb(var(--text-2))" }}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="rounded-3xl border border-foreground/[0.08] p-6"
                                style={{ background: "rgba(255,255,255,0.02)" }}
                            >
                                <h2 className="font-semibold mb-5" style={{ color: "rgb(var(--text-1))" }}>Личные данные</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Field label="Имя пользователя" value={profile.username} />
                                    <Field label="Email" value={profile.email}
                                        icon={<Mail className="w-3 h-3" />} />
                                    {profile.firstName && <Field label="Имя" value={profile.firstName} />}
                                    {profile.lastName && <Field label="Фамилия" value={profile.lastName} />}
                                    {profile.phoneNumber && (
                                        <Field label="Телефон" value={profile.phoneNumber}
                                            icon={<Phone className="w-3 h-3" />} />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
