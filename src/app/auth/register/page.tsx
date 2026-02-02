"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, UserCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import type { RegisterRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

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
            features: [
                "Просмотр вакансий",
                "Создание резюме",
                "Подача заявок на вакансии",
                "Отслеживание откликов"
            ],
        },
        {
            value: "EMPLOYER" as const,
            icon: Briefcase,
            title: "Работодатель",
            description: "Я нанимаю специалистов для своей компании",
            features: [
                "Публикация вакансий",
                "Управление компаниями",
                "Просмотр откликов",
                "Поиск кандидатов"
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold text-gray-900 mb-2"
                    >
                        Присоединяйтесь к <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LaborExchange</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600"
                    >
                        Создайте аккаунт и начните свой путь
                    </motion.p>
                </div>

                {/* Role Selection */}
                {!selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                            Что привело вас сюда?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {roleOptions.map((option) => (
                                <motion.div
                                    key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        hover
                                        className={`cursor-pointer transition-all shadow-md hover:shadow-xl ${
                                            selectedRole === option.value
                                                ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
                                                : "hover:border-blue-300 bg-white"
                                        }`}
                                        onClick={() => setSelectedRole(option.value)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg shadow-md">
                                                    <option.icon className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                        {option.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        {option.description}
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {option.features.map((feature, index) => (
                                                            <li key={index} className="flex items-center text-sm text-gray-700">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Registration Form */}
                {selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Завершите регистрацию</CardTitle>
                                        <CardDescription>
                                            Регистрируетесь как:{" "}
                                            <span className="font-semibold text-blue-600">
                        {roleOptions.find((r) => r.value === selectedRole)?.title}
                      </span>
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedRole(null)}
                                    >
                                        Изменить роль
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="bg-white">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <Input
                                        label="Имя пользователя"
                                        placeholder="ivan_petrov"
                                        required
                                        error={errors.username?.message}
                                        {...register("username", {
                                            required: "Имя пользователя обязательно",
                                            minLength: {
                                                value: 3,
                                                message: "Имя пользователя должно содержать минимум 3 символа",
                                            },
                                            maxLength: {
                                                value: 32,
                                                message: "Имя пользователя должно содержать максимум 32 символа",
                                            },
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
                                                message: "Неверный формат электронной почты",
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
                                                message: "Номер телефона должен содержать 10-15 цифр",
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
                                            minLength: {
                                                value: 8,
                                                message: "Пароль должен содержать минимум 8 символов",
                                            },
                                            maxLength: {
                                                value: 64,
                                                message: "Пароль должен содержать максимум 64 символа",
                                            },
                                        })}
                                    />

                                    <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-shadow" isLoading={isLoading}>
                                        Создать аккаунт
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Уже есть аккаунт?{" "}
                                        <Link
                                            href="/auth/login"
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Войти
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}