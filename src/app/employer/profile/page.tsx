"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Globe, Pencil, Check, X, Building2, Plus, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { companyService } from "@/services/api";
import type { UserDto, CompanyDto } from "@/types";
import { toast } from "sonner";

const inputCls =
    "w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 focus:bg-foreground/[0.07] transition-all";

const emptyCompanyForm = { name: "", description: "", location: "", email: "", phoneNumber: "", website: "" };


function Field({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="p-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl">
            <p className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                {icon}{label}
            </p>
            <p className="font-medium break-all" style={{ color: "rgb(var(--text-1))" }}>{value}</p>
        </div>
    );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-3xl border border-foreground/[0.08] p-6 ${className}`}
            style={{ background: "rgba(255,255,255,0.02)" }}>
            {children}
        </div>
    );
}

export default function EmployerProfilePage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", phoneNumber: "" });

    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);
    const [companyForm, setCompanyForm] = useState(emptyCompanyForm);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || userRole !== "EMPLOYER") { router.push("/auth/login"); return; }
        if (userId) { fetchProfile(); fetchCompany(); }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<UserDto>(`/api/users/${userId}/profile`);
            setProfile(res.data);
            setForm({ username: res.data.username || "", email: res.data.email || "", firstName: res.data.firstName || "", lastName: res.data.lastName || "", phoneNumber: res.data.phoneNumber || "" });
        } catch { toast.error("Не удалось загрузить профиль"); }
        finally { setIsLoading(false); }
    };

    const fetchCompany = async () => {
        setCompanyLoading(true);
        try { setCompany(await companyService.getMyCompany()); }
        catch { setCompany(null); }
        finally { setCompanyLoading(false); }
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

    const handleSaveCompany = async () => {
        setIsSavingCompany(true);
        try {
            if (company) {
                setCompany(await companyService.update(company.id, companyForm));
                setIsEditingCompany(false);
                toast.success("Компания обновлена");
            } else {
                setCompany(await companyService.create(companyForm));
                setIsCreatingCompany(false);
                toast.success("Компания создана");
            }
        } catch { toast.error("Не удалось сохранить компанию"); }
        finally { setIsSavingCompany(false); }
    };

    const handleDeleteCompany = async () => {
        if (!company || !confirm("Удалить компанию?")) return;
        try {
            await companyService.delete(company.id);
            setCompany(null);
            toast.success("Компания удалена");
        } catch { toast.error("Не удалось удалить компанию"); }
    };

    const cancelCompanyEdit = () => {
        setIsEditingCompany(false);
        setIsCreatingCompany(false);
        setCompanyForm(emptyCompanyForm);
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;
    const showCompanyForm = isEditingCompany || isCreatingCompany;

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{ background: "radial-gradient(circle, rgb(16,185,129), transparent)" }} />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 py-12 space-y-6">

                {/* Hero card */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-foreground/[0.08] p-8"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at top left, rgba(16,185,129,0.12), transparent 60%)" }} />

                    <div className="relative flex items-center gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="text-2xl font-bold truncate" style={{ color: "rgb(var(--text-1))" }}>
                                    {displayName}
                                </h1>
                                <span className="badge badge-emerald text-xs">Работодатель</span>
                            </div>
                            <p className="text-sm mb-0.5" style={{ color: "rgb(var(--text-3))" }}>@{profile.username}</p>
                            <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>{profile.email}</p>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-foreground/10 text-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10"
                                style={{ color: "rgb(var(--text-2))" }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Изменить
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Profile info / edit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <SectionCard>
                                    <div className="flex items-center justify-between mb-5">
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
                                                <input type={type} value={form[key as keyof typeof form]}
                                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                    className={inputCls} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 pt-5">
                                        <button onClick={handleSave} disabled={isSaving}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                                            style={{ background: "rgb(16,185,129)" }}>
                                            <Check className="w-4 h-4" />
                                            {isSaving ? "Сохранение..." : "Сохранить"}
                                        </button>
                                        <button onClick={cancelEdit} disabled={isSaving}
                                            className="px-6 py-2.5 rounded-xl text-sm border border-foreground/10 transition-colors hover:bg-foreground/5 disabled:opacity-60"
                                            style={{ color: "rgb(var(--text-2))" }}>
                                            Отмена
                                        </button>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        ) : (
                            <motion.div key="view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <SectionCard>
                                    <h2 className="font-semibold mb-5" style={{ color: "rgb(var(--text-1))" }}>Личные данные</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Field label="Имя пользователя" value={profile.username} />
                                        <Field label="Email" value={profile.email} icon={<Mail className="w-3 h-3" />} />
                                        {profile.firstName && <Field label="Имя" value={profile.firstName} />}
                                        {profile.lastName && <Field label="Фамилия" value={profile.lastName} />}
                                        {profile.phoneNumber && <Field label="Телефон" value={profile.phoneNumber} icon={<Phone className="w-3 h-3" />} />}
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Company section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <SectionCard>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(16,185,129,0.15)" }}>
                                    <Building2 className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                                </div>
                                <h2 className="font-semibold" style={{ color: "rgb(var(--text-1))" }}>Моя компания</h2>
                            </div>

                            {!showCompanyForm && !companyLoading && (
                                <div className="flex items-center gap-2">
                                    {company ? (
                                        <>
                                            <button onClick={() => { setCompanyForm({ name: company.name || "", description: company.description || "", location: company.location || "", email: company.email || "", phoneNumber: company.phoneNumber || "", website: company.website || "" }); setIsEditingCompany(true); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-foreground/10 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10"
                                                style={{ color: "rgb(var(--text-2))" }}>
                                                <Pencil className="w-3 h-3" />Изменить
                                            </button>
                                            <button onClick={handleDeleteCompany}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-foreground/10 transition-all hover:border-red-500/40 hover:bg-red-500/10 text-red-400">
                                                <Trash2 className="w-3 h-3" />Удалить
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => { setCompanyForm(emptyCompanyForm); setIsCreatingCompany(true); }}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-white"
                                            style={{ background: "rgb(16,185,129)" }}>
                                            <Plus className="w-4 h-4" />Добавить компанию
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {companyLoading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 py-6" style={{ color: "rgb(var(--text-3))" }}>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm">Загрузка...</span>
                                </motion.div>

                            ) : showCompanyForm ? (
                                <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="text-xs mb-1.5 block" style={{ color: "rgb(var(--text-3))" }}>Название *</label>
                                            <input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} placeholder="Название компании" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                <MapPin className="w-3 h-3" />Местоположение *
                                            </label>
                                            <input value={companyForm.location} onChange={e => setCompanyForm(f => ({ ...f, location: e.target.value }))} placeholder="Москва, Россия" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                <Mail className="w-3 h-3" />Email *
                                            </label>
                                            <input type="email" value={companyForm.email} onChange={e => setCompanyForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@company.com" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                <Phone className="w-3 h-3" />Телефон
                                            </label>
                                            <input value={companyForm.phoneNumber} onChange={e => setCompanyForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+7 (999) 000-00-00" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs mb-1.5 flex items-center gap-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                <Globe className="w-3 h-3" />Сайт
                                            </label>
                                            <input value={companyForm.website} onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))} placeholder="https://company.com" className={inputCls} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs mb-1.5 block" style={{ color: "rgb(var(--text-3))" }}>Описание</label>
                                            <textarea value={companyForm.description} onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))}
                                                rows={3} placeholder="Кратко о компании..." className={`${inputCls} resize-none`} />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={handleSaveCompany}
                                            disabled={isSavingCompany || !companyForm.name.trim() || !companyForm.location.trim() || !companyForm.email.trim()}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                                            style={{ background: "rgb(16,185,129)" }}>
                                            {isSavingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            {isCreatingCompany ? "Создать" : "Сохранить"}
                                        </button>
                                        <button onClick={cancelCompanyEdit} disabled={isSavingCompany}
                                            className="px-6 py-2.5 rounded-xl text-sm border border-foreground/10 transition-colors hover:bg-foreground/5 disabled:opacity-60"
                                            style={{ color: "rgb(var(--text-2))" }}>
                                            Отмена
                                        </button>
                                    </div>
                                </motion.div>

                            ) : company ? (
                                <motion.div key="company" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    {/* Company banner */}
                                    <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl"
                                        style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0"
                                            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(5,150,105))", color: "#fff" }}>
                                            {company.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg" style={{ color: "rgb(var(--text-1))" }}>{company.name}</p>
                                            {company.location && (
                                                <p className="text-sm flex items-center gap-1" style={{ color: "rgb(var(--text-3))" }}>
                                                    <MapPin className="w-3 h-3" />{company.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Field label="Email" value={company.email} icon={<Mail className="w-3 h-3" />} />
                                        {company.phoneNumber && <Field label="Телефон" value={company.phoneNumber} icon={<Phone className="w-3 h-3" />} />}
                                        {company.website && <Field label="Сайт" value={company.website} icon={<Globe className="w-3 h-3" />} />}
                                        {company.description && (
                                            <div className="sm:col-span-2 p-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl">
                                                <p className="text-xs mb-1.5" style={{ color: "rgb(var(--text-3))" }}>Описание</p>
                                                <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-1))" }}>{company.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="py-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: "rgba(16,185,129,0.08)", border: "1px dashed rgba(16,185,129,0.3)" }}>
                                        <Building2 className="w-7 h-7" style={{ color: "rgba(16,185,129,0.5)" }} />
                                    </div>
                                    <p className="font-medium mb-1" style={{ color: "rgb(var(--text-2))" }}>Компания не добавлена</p>
                                    <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>Создайте профиль компании, чтобы публиковать вакансии</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SectionCard>
                </motion.div>
            </div>
        </div>
    );
}
