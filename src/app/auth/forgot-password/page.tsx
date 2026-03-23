"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Briefcase, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/api";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            await authService.forgotPassword(data.email);
            setSent(true);
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
                        Забыли пароль?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: "rgb(var(--text-3))" }}
                    >
                        Введите email — отправим ссылку для сброса
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8"
                >
                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "rgb(34,197,94)" }} />
                            <p className="font-semibold text-lg mb-2" style={{ color: "rgb(var(--text-1))" }}>
                                Письмо отправлено
                            </p>
                            <p className="text-sm mb-6" style={{ color: "rgb(var(--text-3))" }}>
                                Проверьте почту <strong>{getValues("email")}</strong> и перейдите по ссылке для сброса пароля.
                            </p>
                            <Link href="/auth/login">
                                <button className="btn-secondary text-sm py-2 px-4">
                                    Вернуться к входу
                                </button>
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-[38px] pointer-events-none" style={{ color: "rgb(100,116,139)", width: "18px", height: "18px" }} />
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

                            <Button
                                type="submit"
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                                isLoading={isLoading}
                            >
                                <Mail className="h-4 w-4" />
                                Отправить ссылку
                            </Button>
                        </form>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                >
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-1.5 text-sm hover:underline"
                        style={{ color: "var(--badge-indigo-color)" }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Вернуться к входу
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
