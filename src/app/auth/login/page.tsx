"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import type { LoginRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4 shadow-lg"
                    >
                        <LogIn className="h-10 w-10 text-blue-600" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        С возвращением
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600"
                    >
                        Войдите, чтобы продолжить работу с аккаунтом
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle>Вход в систему</CardTitle>
                            <CardDescription>Введите свои учетные данные для доступа к аккаунту</CardDescription>
                        </CardHeader>
                        <CardContent className="bg-white">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
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
                                    <Lock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
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

                                <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-shadow" isLoading={isLoading}>
                                    Войти
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Нет аккаунта?
                    </span>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <Link href="/auth/register">
                                        <Button variant="outline" className="w-full hover:bg-gray-50 transition-colors">
                                            Создать новый аккаунт
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center text-sm text-gray-600"
                >
                    Входя в систему, вы соглашаетесь с нашими{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Условиями использования
                    </Link>{" "}
                    и{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Политикой конфиденциальности
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}