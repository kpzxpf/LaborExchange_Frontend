"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { authService } from "@/services/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("Ссылка недействительна или истекла");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg("Токен не найден");
            return;
        }

        authService.verifyEmail(token)
            .then(() => setStatus("success"))
            .catch((err) => {
                const msg = err?.response?.data?.message || err?.response?.data || null;
                if (msg) setErrorMsg(msg);
                setStatus("error");
            });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="mesh-bg fixed inset-0 pointer-events-none" />
            <div className="grid-pattern fixed inset-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                        style={{
                            background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
                            boxShadow: "0 16px 40px rgba(99,102,241,0.4)",
                        }}
                    >
                        <Briefcase className="h-8 w-8 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold mb-2"
                        style={{ color: "rgb(var(--text-1))" }}
                    >
                        Подтверждение email
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8 text-center"
                >
                    {status === "loading" && (
                        <div className="py-4">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: "rgb(99,102,241)" }} />
                            <p style={{ color: "rgb(var(--text-3))" }}>Проверяем ссылку...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-4"
                        >
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(34,197,94)" }} />
                            <p className="font-semibold text-lg mb-2" style={{ color: "rgb(var(--text-1))" }}>
                                Email подтверждён!
                            </p>
                            <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                                Ваш адрес электронной почты успешно подтверждён.
                            </p>
                            <Link href="/auth/login">
                                <button className="btn-primary py-2.5 px-6 text-sm">
                                    Войти в аккаунт
                                </button>
                            </Link>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-4"
                        >
                            <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(239,68,68)" }} />
                            <p className="font-semibold text-lg mb-2" style={{ color: "rgb(var(--text-1))" }}>
                                Ошибка подтверждения
                            </p>
                            <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                                {errorMsg}
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link href="/auth/login">
                                    <button className="btn-primary w-full py-2.5 text-sm">
                                        Войти
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
