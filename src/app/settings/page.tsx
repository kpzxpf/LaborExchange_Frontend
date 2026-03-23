"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Shield, Bell, AlertTriangle, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { userService } from "@/services/api";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

type Tab = "appearance" | "security" | "notifications" | "account";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "appearance", label: "Внешний вид", icon: <Sun className="w-4 h-4" /> },
    { id: "security", label: "Безопасность", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Уведомления", icon: <Bell className="w-4 h-4" /> },
    { id: "account", label: "Аккаунт", icon: <AlertTriangle className="w-4 h-4" /> },
];

function AppearanceTab() {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>Тема оформления</h3>
                <p className="text-sm mb-4" style={{ color: "rgb(var(--text-3))" }}>Выберите светлую или тёмную тему</p>
                <div className="flex gap-3">
                    {(["light", "dark"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { if (theme !== t) toggleTheme(); }}
                            className="flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl transition-all"
                            style={{
                                border: theme === t ? "2px solid rgb(99,102,241)" : "2px solid var(--card-border)",
                                background: theme === t ? "rgba(99,102,241,0.08)" : "rgb(var(--card-bg))",
                            }}
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: t === "light" ? "#f8fafc" : "#0f172a", border: "1px solid var(--card-border)" }}>
                                {t === "light"
                                    ? <Sun className="w-6 h-6" style={{ color: "#f59e0b" }} />
                                    : <Moon className="w-6 h-6" style={{ color: "#818cf8" }} />}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {theme === t && <Check className="w-3.5 h-3.5" style={{ color: "rgb(99,102,241)" }} />}
                                <span className="text-sm font-medium" style={{ color: theme === t ? "rgb(99,102,241)" : "rgb(var(--text-2))" }}>
                                    {t === "light" ? "Светлая" : "Тёмная"}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SecurityTab() {
    const { userId } = useAuth();
    const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ old: false, new: false, confirm: false });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Пароли не совпадают");
            return;
        }
        if (form.newPassword.length < 6) {
            toast.error("Новый пароль должен содержать не менее 6 символов");
            return;
        }
        setSaving(true);
        try {
            await userService.changePassword(userId!, {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            });
            toast.success("Пароль успешно изменён");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e) {
            toast.error(handleApiError(e));
        } finally {
            setSaving(false);
        }
    };

    const fields: { key: keyof typeof form; label: string; showKey: keyof typeof show }[] = [
        { key: "oldPassword", label: "Текущий пароль", showKey: "old" },
        { key: "newPassword", label: "Новый пароль", showKey: "new" },
        { key: "confirmPassword", label: "Подтвердите новый пароль", showKey: "confirm" },
    ];

    return (
        <div className="max-w-md">
            <h3 className="text-base font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>Смена пароля</h3>
            <p className="text-sm mb-5" style={{ color: "rgb(var(--text-3))" }}>Используйте надёжный пароль длиной не менее 6 символов</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(({ key, label, showKey }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "rgb(var(--text-2))" }}>{label}</label>
                        <div className="relative">
                            <input
                                type={show[showKey] ? "text" : "password"}
                                value={form[key]}
                                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                className="input-field pr-10"
                                required
                                autoComplete={key === "oldPassword" ? "current-password" : "new-password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShow(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: "rgb(var(--text-3))" }}
                            >
                                {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60"
                >
                    {saving ? "Сохранение..." : "Изменить пароль"}
                </button>
            </form>
        </div>
    );
}

function NotificationsTab() {
    const [prefs, setPrefs] = useState({
        newApplication: true,
        statusChange: true,
        emailNotifications: false,
    });

    const items = [
        { key: "newApplication" as const, label: "Новые отклики", desc: "Уведомления при поступлении нового отклика" },
        { key: "statusChange" as const, label: "Изменение статуса", desc: "Когда статус заявки меняется" },
        { key: "emailNotifications" as const, label: "Email-уведомления", desc: "Отправлять уведомления на почту (скоро)" },
    ];

    return (
        <div className="space-y-4 max-w-md">
            <h3 className="text-base font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>Настройки уведомлений</h3>
            <p className="text-sm mb-5" style={{ color: "rgb(var(--text-3))" }}>Управляйте тем, какие уведомления вы получаете</p>
            {items.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "rgb(var(--card-bg))", border: "1px solid var(--card-border)" }}>
                    <div>
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-1))" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{desc}</p>
                    </div>
                    <button
                        onClick={() => setPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                        style={{ background: prefs[key] ? "rgb(99,102,241)" : "rgb(var(--card-border))" }}
                        aria-checked={prefs[key]}
                        role="switch"
                    >
                        <span
                            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow"
                            style={{ transform: prefs[key] ? "translateX(20px)" : "translateX(0)" }}
                        />
                    </button>
                </div>
            ))}
            <p className="text-xs pt-2" style={{ color: "rgb(var(--text-3))" }}>
                * Настройки email-уведомлений будут сохранены в следующей версии
            </p>
        </div>
    );
}

function AccountTab() {
    const { logout } = useAuth();
    const [confirm, setConfirm] = useState(false);

    return (
        <div className="max-w-md space-y-6">
            <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>Аккаунт</h3>
                <p className="text-sm mb-5" style={{ color: "rgb(var(--text-3))" }}>Управление аккаунтом</p>
            </div>

            <div className="p-5 rounded-2xl" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" }}>
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-1))" }}>Опасная зона</p>
                        <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                            Удаление аккаунта необратимо. Все ваши данные, резюме и отклики будут удалены навсегда.
                        </p>
                    </div>
                </div>
                {!confirm ? (
                    <button
                        onClick={() => setConfirm(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.4)", background: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                        Удалить аккаунт
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm font-medium" style={{ color: "rgb(239,68,68)" }}>Вы уверены? Это действие нельзя отменить.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { toast.info("Удаление аккаунта будет доступно в следующей версии"); setConfirm(false); }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                                style={{ background: "rgb(239,68,68)" }}
                            >
                                Да, удалить
                            </button>
                            <button
                                onClick={() => setConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{ color: "rgb(var(--text-2))", border: "1px solid var(--card-border)" }}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("appearance");

    const content: Record<Tab, React.ReactNode> = {
        appearance: <AppearanceTab />,
        security: <SecurityTab />,
        notifications: <NotificationsTab />,
        account: <AccountTab />,
    };

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: "rgb(var(--text-1))" }}>Настройки</h1>
                    <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>Управляйте своим аккаунтом и предпочтениями</p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar tabs */}
                    <motion.aside
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        className="md:w-52 shrink-0"
                    >
                        <nav className="card p-2 space-y-1">
                            {TABS.map(({ id, label, icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                                    style={activeTab === id ? {
                                        background: "rgba(99,102,241,0.12)",
                                        color: "rgb(99,102,241)",
                                        border: "1px solid rgba(99,102,241,0.2)",
                                    } : {
                                        color: "rgb(var(--text-2))",
                                    }}
                                    onMouseEnter={e => { if (activeTab !== id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.06)"; }}
                                    onMouseLeave={e => { if (activeTab !== id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </motion.aside>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 }}
                        className="flex-1 card p-6"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {content[activeTab]}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
