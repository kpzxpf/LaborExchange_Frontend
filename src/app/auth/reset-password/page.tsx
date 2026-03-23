"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Briefcase, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/api";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

interface ResetForm {
    newPassword: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") ?? "";

    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetForm>();

    useEffect(() => {
        if (!token) {
            toast.error("Ссылка для сброса пароля недействительна");
        }
    }, [token]);

    const onSubmit = async (data: ResetForm) => {
        if (!token) return;
        setIsLoading(true);
        try {
            await authService.resetPassword(token, data.newPassword);
            setDone(true);
            setTimeout(() => router.push("/auth/login"), 3000);
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

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
                        Новый пароль
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: "rgb(var(--text-3))" }}
                    >
                        Придумайте надёжный пароль
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8"
                >
                    {!token ? (
                        <div className="text-center py-4">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(239,68,68)" }} />
                            <p className="font-semibold mb-4" style={{ color: "rgb(var(--text-1))" }}>
                                Ссылка недействительна
                            </p>
                            <Link href="/auth/forgot-password">
                                <button className="btn-secondary text-sm py-2 px-4">
                                    Запросить новую ссылку
                                </button>
                            </Link>
                        </div>
                    ) : done ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(34,197,94)" }} />
                            <p className="font-semibold text-lg mb-2" style={{ color: "rgb(var(--text-1))" }}>
                                Пароль изменён!
                            </p>
                            <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                Перенаправляем на страницу входа...
                            </p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-[38px] pointer-events-none" style={{ color: "rgb(100,116,139)", width: "18px", height: "18px" }} />
                                <Input
                                    label="Новый пароль"
                                    type={showNew ? "text" : "password"}
                                    placeholder="Минимум 6 символов"
                                    className="pl-10 pr-10"
                                    required
                                    error={errors.newPassword?.message}
                                    {...register("newPassword", {
                                        required: "Пароль обязателен",
                                        minLength: { value: 6, message: "Минимум 6 символов" },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(v => !v)}
                                    className="absolute right-3.5 top-[38px]"
                                    style={{ color: "rgb(100,116,139)" }}
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-[38px] pointer-events-none" style={{ color: "rgb(100,116,139)", width: "18px", height: "18px" }} />
                                <Input
                                    label="Подтвердите пароль"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Повторите пароль"
                                    className="pl-10 pr-10"
                                    required
                                    error={errors.confirmPassword?.message}
                                    {...register("confirmPassword", {
                                        required: "Подтверждение обязательно",
                                        validate: v => v === watch("newPassword") || "Пароли не совпадают",
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3.5 top-[38px]"
                                    style={{ color: "rgb(100,116,139)" }}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                                isLoading={isLoading}
                            >
                                <Lock className="h-4 w-4" />
                                Сохранить пароль
                            </Button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
