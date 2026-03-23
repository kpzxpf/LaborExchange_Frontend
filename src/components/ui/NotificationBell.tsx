"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useNotifications, AppNotification } from "@/contexts/NotificationContext";

const TYPE_ICONS: Record<string, string> = {
    NEW_APPLICATION: "📥",
    ACCEPTED_APPLICATION: "✅",
    REJECTED_APPLICATION: "❌",
    WITHDRAWN_APPLICATION: "↩️",
};

function NotificationItem({ n }: { n: AppNotification }) {
    const icon = TYPE_ICONS[n.type] ?? "🔔";
    const time = n.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return (
        <div className={`flex gap-3 p-3 rounded-xl transition-colors ${n.read ? "opacity-60" : ""}`}
            style={{ background: n.read ? "transparent" : "rgba(99,102,241,0.06)" }}>
            <span className="text-lg shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "rgb(var(--text-1))" }}>{n.message}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{time}</p>
            </div>
        </div>
    );
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen((v) => !v);
        if (!open && unreadCount > 0) markAllRead();
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-xl transition-colors"
                style={{ color: "rgb(var(--text-2))" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(99,102,241)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-2))"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                aria-label="Уведомления"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "rgb(99,102,241)", padding: "0 4px" }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
                        style={{ background: "rgb(var(--card-bg))", border: "1px solid var(--card-border)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--card-border)" }}>
                            <span className="font-semibold text-sm" style={{ color: "rgb(var(--text-1))" }}>
                                Уведомления
                            </span>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-xs transition-colors"
                                        style={{ color: "rgb(var(--text-3))" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgb(var(--text-1))")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgb(var(--text-3))")}>
                                        Очистить
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 rounded-lg transition-colors"
                                    style={{ color: "rgb(var(--text-3))" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-2xl mb-2">🔔</p>
                                    <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>Нет уведомлений</p>
                                </div>
                            ) : (
                                notifications.map((n) => <NotificationItem key={n.id} n={n} />)
                            )}
                        </div>

                        {/* Footer: View all */}
                        <div className="px-4 py-2.5 border-t" style={{ borderColor: "var(--card-border)" }}>
                            <Link href="/notifications" onClick={() => setOpen(false)}>
                                <div className="flex items-center justify-center gap-1.5 text-xs font-medium transition-colors py-1 rounded-lg"
                                    style={{ color: "rgb(99,102,241)" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    Смотреть все
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
