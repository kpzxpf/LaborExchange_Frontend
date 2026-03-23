"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, UserCircle, ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { RegisterRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import { toast } from "sonner";

type FormData = RegisterRequest;

export default function RegisterPage() {
    const [selectedRole, setSelectedRole] = useState<"JOB_SEEKER" | "EMPLOYER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        if (!selectedRole) {
            toast.error("Пожалуйста, выберите роль");
            return;
        }
        setIsLoading(true);
        try {
            await registerUser({ ...data, userRole: selectedRole });
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        {
            value: "JOB_SEEKER" as const,
            icon: UserCircle,
            title: "Соискатель",
            description: "Я ищу возможности для трудоустройства",
            color: "from-indigo-500 to-violet-500",
            glow: "rgba(99,102,241,0.35)",
            features: [
                "Просмотр вакансий",
                "Создание резюме",
                "Подача заявок",
                "Отслеживание откликов",
            ],
        },
        {
            value: "EMPLOYER" as const,
            icon: Briefcase,
            title: "Работодатель",
            description: "Я нанимаю специалистов для своей компании",
            color: "from-violet-500 to-purple-500",
            glow: "rgba(139,92,246,0.35)",
            features: [
                "Публикация вакансий",
                "Управление компанией",
                "Просмотр откликов",
                "Поиск кандидатов",
            ],
        },
    ];

    return (
        <div className="min-h-screen py-12 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="mesh-bg fixed inset-0 pointer-events-none" />
            <div className="grid-pattern fixed inset-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-3xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                        style={{
                            background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
                            boxShadow: "0 12px 32px rgba(99,102,241,0.4)",
                        }}
                    >
                        <Briefcase className="h-7 w-7 text-white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl font-bold mb-2"
                        style={{ color: "rgb(var(--text-1))" }}
                    >
                        Присоединяйтесь к{" "}
                        <span className="gradient-text">LaborExchange</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: "rgb(var(--text-3))" }}
                    >
                        Создайте аккаунт и начните свой путь
                    </motion.p>
                </div>

                {/* Role Selection */}
                {!selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-lg font-semibold text-center mb-6" style={{ color: "rgb(var(--text-2))" }}>
                            Выберите вашу роль
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {roleOptions.map((option, index) => (
                                <motion.div
                                    key={option.value}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.4 }}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedRole(option.value)}
                                    className="glass-card p-6 cursor-pointer group transition-all duration-300 hover:border-indigo-500/40"
                                    style={{
                                        boxShadow: "none",
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${option.color}`}
                                            style={{ boxShadow: `0 8px 20px ${option.glow}` }}
                                        >
                                            <option.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>
                                                {option.title}
                                            </h3>
                                            <p className="text-sm mb-4" style={{ color: "rgb(var(--text-3))" }}>
                                                {option.description}
                                            </p>
                                            <ul className="space-y-1.5">
                                                {option.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--text-2))" }}>
                                                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "rgb(52, 211, 153)" }} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: "var(--badge-indigo-color)" }}>
                                            Выбрать →
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <p className="mt-6 text-center text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Уже есть аккаунт?{" "}
                            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--badge-indigo-color)" }}>
                                Войти
                            </Link>
                        </p>
                    </motion.div>
                )}

                {/* Registration Form */}
                {selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-md mx-auto"
                    >
                        {/* Back button + role badge */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                                style={{ color: "rgb(var(--text-3))" }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Изменить роль
                            </button>
                            <div
                                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    background: "rgba(99,102,241,0.12)",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    color: "var(--badge-indigo-color)",
                                }}
                            >
                                {(() => {
                                    const opt = roleOptions.find(r => r.value === selectedRole);
                                    if (!opt) return null;
                                    const Icon = opt.icon;
                                    return (
                                        <>
                                            <Icon className="h-3.5 w-3.5" />
                                            {opt.title}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <h2 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-1))" }}>
                                Завершите регистрацию
                            </h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    label="Имя пользователя"
                                    placeholder="ivan_petrov"
                                    required
                                    error={errors.username?.message}
                                    {...register("username", {
                                        required: "Имя пользователя обязательно",
                                        minLength: { value: 3, message: "Минимум 3 символа" },
                                        maxLength: { value: 32, message: "Максимум 32 символа" },
                                    })}
                                />

                                <Input
                                    label="Электронная почта"
                                    type="email"
                                    placeholder="ivan@example.com"
                                    required
                                    error={errors.email?.message}
                                    {...register("email", {
                                        required: "Электронная почта обязательна",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Неверный формат",
                                        },
                                    })}
                                />

                                <Input
                                    label="Номер телефона"
                                    type="tel"
                                    placeholder="+79001234567"
                                    required
                                    error={errors.phone?.message}
                                    {...register("phone", {
                                        required: "Номер телефона обязателен",
                                        pattern: {
                                            value: /^\+?[0-9]{10,15}$/,
                                            message: "10–15 цифр",
                                        },
                                    })}
                                />

                                <Input
                                    label="Пароль"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    error={errors.password?.message}
                                    {...register("password", {
                                        required: "Пароль обязателен",
                                        minLength: { value: 8, message: "Минимум 8 символов" },
                                        maxLength: { value: 64, message: "Максимум 64 символа" },
                                    })}
                                />

                                <Button
                                    type="submit"
                                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-2"
                                    isLoading={isLoading}
                                >
                                    Создать аккаунт
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </form>

                            <p className="mt-5 text-center text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                Уже есть аккаунт?{" "}
                                <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--badge-indigo-color)" }}>
                                    Войти
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
