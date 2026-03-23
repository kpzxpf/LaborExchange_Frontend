"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { chatService, MessageDto } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { toast } from "sonner";

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
            await chatService.sendMessage(conversationId, content);
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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]" style={{ background: "rgb(var(--bg))" }}>
            {/* Header */}
            <div
                className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-2))" }}
            >
                <button
                    onClick={() => router.push("/messages")}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                >
                    <ArrowLeft className="h-5 w-5" style={{ color: "rgb(var(--text-2))" }} />
                </button>
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                >
                    <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-medium text-sm" style={{ color: "rgb(var(--text-1))" }}>
                        Диалог #{conversationId}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-7 w-7 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <MessageCircle className="h-12 w-12" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Начните переписку
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMine = msg.senderId === userId;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                        style={{
                                            background: isMine
                                                ? "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))"
                                                : "rgb(var(--bg-2))",
                                            color: isMine ? "#fff" : "rgb(var(--text-1))",
                                            borderBottomRightRadius: isMine ? "4px" : undefined,
                                            borderBottomLeftRadius: isMine ? undefined : "4px",
                                        }}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <p
                                            className="text-xs mt-1 opacity-60 text-right"
                                        >
                                            {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
                className="flex-shrink-0 px-4 py-3 border-t flex items-end gap-3"
                style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-2))" }}
            >
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написать сообщение..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{
                        background: "rgb(var(--bg))",
                        color: "rgb(var(--text-1))",
                        border: "1px solid rgb(var(--border))",
                        maxHeight: "120px",
                        lineHeight: "1.5",
                    }}
                    onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                >
                    {sending ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 text-white" />
                    )}
                </button>
            </div>
        </div>
    );
}
