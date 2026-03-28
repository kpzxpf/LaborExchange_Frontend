"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { chatService, MessageDto } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { toast } from "sonner";

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function getDateKey(dateStr: string) {
    return new Date(dateStr).toDateString();
}

export default function ConversationPage() {
    const { id } = useParams<{ id: string }>();
    const conversationId = Number(id);
    const router = useRouter();
    const { userId } = useAuth();
    const { subscribe } = useChat();

    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        chatService.getMessages(conversationId, 0, 50)
            .then((page) => {
                setMessages([...page.content].reverse());
                setTimeout(() => scrollToBottom(false), 50);
            })
            .catch(() => toast.error("Не удалось загрузить сообщения"))
            .finally(() => setLoading(false));

        chatService.markRead(conversationId).catch(() => {});
    }, [conversationId, scrollToBottom]);

    useEffect(() => {
        const unsubscribe = subscribe(conversationId, (msg: MessageDto) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setTimeout(() => scrollToBottom(true), 50);
            if (msg.senderId !== userId) {
                chatService.markRead(conversationId).catch(() => {});
            }
        });
        return unsubscribe;
    }, [conversationId, subscribe, userId, scrollToBottom]);

    const handleSend = async () => {
        const content = text.trim();
        if (!content || sending) return;

        setSending(true);
        setText("");
        try {
            const msg = await chatService.sendMessage(conversationId, content);
            // Optimistically show sent message (WS will deduplicate)
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            setTimeout(() => scrollToBottom(true), 50);
        } catch {
            toast.error("Не удалось отправить сообщение");
            setText(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages by date
    const dateGroups: { dateKey: string; label: string; messages: MessageDto[] }[] = [];
    messages.forEach(msg => {
        const dk = getDateKey(msg.createdAt);
        const last = dateGroups[dateGroups.length - 1];
        if (!last || last.dateKey !== dk) {
            dateGroups.push({ dateKey: dk, label: formatDateSeparator(msg.createdAt), messages: [msg] });
        } else {
            last.messages.push(msg);
        }
    });

    return (
        <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)", background: "rgb(var(--bg))" }}>
            {/* Header */}
            <div
                className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
                style={{
                    borderColor: "var(--card-border)",
                    background: "rgb(var(--card-bg))",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                }}
            >
                <button
                    onClick={() => router.push("/messages")}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: "rgb(var(--text-2))" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                >
                    {conversationId}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "rgb(var(--text-1))" }}>
                        Диалог #{conversationId}
                    </p>
                    <p className="text-xs" style={{ color: "rgb(var(--text-3))" }}>
                        {messages.length > 0 ? `${messages.length} сообщений` : "Нет сообщений"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(99,102,241,0.1)" }}>
                            <Send className="h-7 w-7" style={{ color: "rgb(99,102,241)" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>Начните переписку</p>
                        <p className="text-xs" style={{ color: "rgb(var(--text-3))" }}>Напишите первое сообщение</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {dateGroups.map(group => (
                            <div key={group.dateKey}>
                                {/* Date separator */}
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                                        style={{ background: "rgb(var(--card-bg))", color: "rgb(var(--text-3))", border: "1px solid var(--card-border)" }}>
                                        {group.label}
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                                </div>

                                {group.messages.map((msg, i) => {
                                    const isMine = msg.senderId === userId;
                                    const prevMsg = group.messages[i - 1];
                                    const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.18, ease: "easeOut" }}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirst ? "mt-3" : "mt-0.5"}`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[72%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                                                {/* Avatar placeholder — only show for first in group */}
                                                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold text-white ${isFirst ? "opacity-100" : "opacity-0"}`}
                                                    style={{ background: isMine ? "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" : "linear-gradient(135deg, rgb(100,116,139), rgb(71,85,105))" }}>
                                                    {isMine ? "Я" : "?"}
                                                </div>

                                                <div
                                                    className="px-4 py-2.5 text-sm leading-relaxed"
                                                    style={{
                                                        background: isMine
                                                            ? "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))"
                                                            : "rgb(var(--card-bg))",
                                                        color: isMine ? "#fff" : "rgb(var(--text-1))",
                                                        borderRadius: isMine
                                                            ? (isFirst ? "18px 18px 4px 18px" : "18px 4px 4px 18px")
                                                            : (isFirst ? "18px 18px 18px 4px" : "4px 18px 18px 4px"),
                                                        border: isMine ? "none" : "1px solid var(--card-border)",
                                                        boxShadow: isMine ? "0 2px 12px rgba(99,102,241,0.25)" : "var(--card-shadow)",
                                                    }}
                                                >
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isMine ? "text-white/60 text-right" : "text-right"}`}
                                                        style={isMine ? {} : { color: "rgb(var(--text-3))" }}>
                                                        {formatTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
                className="flex-shrink-0 px-4 py-3 border-t flex items-end gap-3"
                style={{ borderColor: "var(--card-border)", background: "rgb(var(--card-bg))" }}
            >
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написать сообщение... (Enter — отправить, Shift+Enter — новая строка)"
                    rows={1}
                    className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                        background: "rgb(var(--bg))",
                        color: "rgb(var(--text-1))",
                        border: "1px solid var(--card-border)",
                        maxHeight: "120px",
                        lineHeight: "1.5",
                    }}
                    onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgb(99,102,241)"; }}
                    onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--card-border)"; }}
                    onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                >
                    {sending ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                        <Send className="h-5 w-5 text-white" />
                    )}
                </motion.button>
            </div>
        </div>
    );
}
