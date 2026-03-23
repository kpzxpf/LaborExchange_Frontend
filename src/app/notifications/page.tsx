"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications, AppNotification } from "@/contexts/NotificationContext";

const TYPE_ICONS: Record<string, string> = {
    NEW_APPLICATION: "📥",
    ACCEPTED_APPLICATION: "✅",
    REJECTED_APPLICATION: "❌",
    WITHDRAWN_APPLICATION: "↩️",
};

const TYPE_LABELS: Record<string, string> = {
    NEW_APPLICATION: "Новый отклик",
    ACCEPTED_APPLICATION: "Заявка принята",
    REJECTED_APPLICATION: "Заявка отклонена",
    WITHDRAWN_APPLICATION: "Заявка отозвана",
};

function groupByDate(notifications: AppNotification[]): Record<string, AppNotification[]> {
    const groups: Record<string, AppNotification[]> = {};
    for (const n of notifications) {
        const key = new Date(n.timestamp).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    }
    return groups;
}

export default function NotificationsPage() {
    const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

    // Auto-mark all as read when page is opened
    useEffect(() => {
        if (unreadCount > 0) markAllRead();
    }, []);

    const grouped = groupByDate(notifications);
    const dateKeys = Object.keys(grouped);

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                            <Bell className="w-5 h-5" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                                Уведомления
                            </h1>
                            <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                {notifications.length} всего
                            </p>
                        </div>
                    </div>

                    {notifications.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                                style={{ color: "rgb(var(--text-3))", border: "1px solid var(--card-border)", background: "rgb(var(--card-bg))" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))"; }}
                            >
                                <CheckCheck className="w-4 h-4" />
                                Прочитать все
                            </button>
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                                style={{ color: "rgb(var(--text-3))", border: "1px solid var(--card-border)", background: "rgb(var(--card-bg))" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(239,68,68)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-3))"; }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Очистить
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Empty state */}
                {notifications.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-16 text-center"
                    >
                        <div className="text-5xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-1))" }}>
                            Нет уведомлений
                        </h3>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Здесь будут появляться уведомления об откликах и изменениях статусов
                        </p>
                    </motion.div>
                )}

                {/* Grouped notifications */}
                <AnimatePresence>
                    {dateKeys.map((date, groupIdx) => (
                        <motion.div
                            key={date}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIdx * 0.05 }}
                            className="mb-6"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
                                style={{ color: "rgb(var(--text-3))" }}>
                                {date}
                            </p>
                            <div className="card divide-y" style={{ divideColor: "var(--card-border)" }}>
                                {grouped[date].map((n, i) => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: groupIdx * 0.05 + i * 0.03 }}
                                        className="flex gap-3 p-4"
                                        style={{ opacity: n.read ? 0.65 : 1 }}
                                    >
                                        <span className="text-xl shrink-0 mt-0.5">
                                            {TYPE_ICONS[n.type] ?? "🔔"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-semibold mb-0.5" style={{ color: "rgb(99,102,241)" }}>
                                                        {TYPE_LABELS[n.type] ?? n.type}
                                                    </p>
                                                    <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-1))" }}>
                                                        {n.message}
                                                    </p>
                                                </div>
                                                <span className="text-xs shrink-0 mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                                    {new Date(n.timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            {!n.read && (
                                                <span className="inline-block mt-1.5 w-2 h-2 rounded-full"
                                                    style={{ background: "rgb(99,102,241)" }} />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
