"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Loader2, User } from "lucide-react";
import { chatService, ConversationDto } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

export default function MessagesPage() {
    const { userId } = useAuth();
    const [conversations, setConversations] = useState<ConversationDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chatService.getConversations()
            .then(setConversations)
            .catch(() => toast.error("Не удалось загрузить сообщения"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                    >
                        <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            Сообщения
                        </h1>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            {conversations.length} диалогов
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                    </div>
                ) : conversations.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="text-lg font-medium mb-2" style={{ color: "rgb(var(--text-1))" }}>
                            Нет сообщений
                        </p>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Начните переписку со страницы резюме или вакансии
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((conv, i) => (
                            <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <Link href={`/messages/${conv.id}`}>
                                    <div className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:border-indigo-500/30 transition-colors">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                                        >
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm" style={{ color: "rgb(var(--text-1))" }}>
                                                    Пользователь #{conv.otherUserId}
                                                </span>
                                                {conv.lastMessage && (
                                                    <span className="text-xs" style={{ color: "rgb(var(--text-3))" }}>
                                                        {formatTime(conv.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.lastMessage && (
                                                <p className="text-sm truncate mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                                    {conv.lastMessage.senderId === userId ? "Вы: " : ""}
                                                    {conv.lastMessage.content}
                                                </p>
                                            )}
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span
                                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                                style={{ background: "rgb(99,102,241)" }}
                                            >
                                                {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
