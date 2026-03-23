"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, Mail, Lock, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { LoginRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            await login(data);
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: "rgb(var(--bg))" }}>
            {/* Background */}
            <div className="mesh-bg fixed inset-0 pointer-events-none" />
            <div className="grid-pattern fixed inset-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-md w-full"
            >
                {/* Logo & Title */}
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
                        С возвращением
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: "rgb(var(--text-3))" }}
                    >
                        Войдите, чтобы продолжить
                    </motion.p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-[38px] h-4.5 w-4.5 pointer-events-none" style={{ color: "rgb(100,116,139)", width: "18px", height: "18px" }} />
                            <Input
                                label="Электронная почта"
                                type="email"
                                placeholder="ivan@example.com"
                                className="pl-10"
                                required
                                error={errors.email?.message}
                                {...register("email", {
                                    required: "Электронная почта обязательна",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Неверный формат электронной почты",
                                    },
                                })}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-[38px] pointer-events-none" style={{ color: "rgb(100,116,139)", width: "18px", height: "18px" }} />
                            <Input
                                label="Пароль"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                required
                                error={errors.password?.message}
                                {...register("password", {
                                    required: "Пароль обязателен",
                                })}
                            />
                        </div>

                        <div className="flex justify-end -mt-1">
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs hover:underline"
                                style={{ color: "var(--badge-indigo-color)" }}
                            >
                                Забыли пароль?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                            isLoading={isLoading}
                        >
                            <LogIn className="h-4 w-4" />
                            Войти
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                        <span className="text-xs" style={{ color: "rgb(var(--text-3))" }}>НЕТ АККАУНТА?</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>

                    <Link href="/auth/register">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="btn-secondary w-full py-3 text-sm font-medium"
                        >
                            Создать новый аккаунт
                        </motion.button>
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center text-xs"
                    style={{ color: "rgb(var(--text-3))" }}
                >
                    Продолжая, вы соглашаетесь с{" "}
                    <Link href="/terms" className="hover:underline" style={{ color: "var(--badge-indigo-color)" }}>
                        Условиями использования
                    </Link>{" "}
                    и{" "}
                    <Link href="/privacy" className="hover:underline" style={{ color: "var(--badge-indigo-color)" }}>
                        Политикой конфиденциальности
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
