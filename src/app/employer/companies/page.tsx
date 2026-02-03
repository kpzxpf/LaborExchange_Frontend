"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { companyService } from "@/services/api";
import type { CompanyDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

type FormData = Omit<CompanyDto, "id">;

export default function CreateCompanyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await companyService.create(data);
            toast.success("Компания успешно создана!");
            router.push("/employer/companies");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/employer/companies">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Вернуться к компаниям
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Создание новой компании</CardTitle>
                            <CardDescription>
                                Добавьте профиль компании, чтобы связать его с вашими вакансиями
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Input
                                    label="Название компании"
                                    placeholder="Например: Техно Инновации"
                                    required
                                    error={errors.name?.message}
                                    {...register("name", {
                                        required: "Название компании обязательно",
                                        minLength: {
                                            value: 2,
                                            message: "Название должно содержать минимум 2 символа",
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "Название должно содержать не более 100 символов",
                                        },
                                    })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Описание
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Расскажите о вашей компании..."
                                        {...register("description", {
                                            maxLength: {
                                                value: 2000,
                                                message: "Описание должно содержать не более 2000 символов",
                                            },
                                        })}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                <Input
                                    label="Местоположение"
                                    placeholder="Например: Москва, Россия"
                                    required
                                    error={errors.location?.message}
                                    {...register("location", {
                                        required: "Местоположение обязательно",
                                    })}
                                />

                                <Input
                                    label="Электронная почта"
                                    type="email"
                                    placeholder="contact@company.com"
                                    required
                                    error={errors.email?.message}
                                    {...register("email", {
                                        required: "Email обязателен",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Некорректный адрес почты",
                                        },
                                    })}
                                />

                                <Input
                                    label="Номер телефона"
                                    type="tel"
                                    placeholder="+7 (999) 000-00-00"
                                    error={errors.phoneNumber?.message}
                                    {...register("phoneNumber", {
                                        pattern: {
                                            value: /^(\+7|8|\+380|\+375)\d{9,11}$/,
                                            message: "Некорректный формат номера телефона",
                                        },
                                    })}
                                />

                                <Input
                                    label="Сайт"
                                    type="url"
                                    placeholder="https://www.company.com"
                                    error={errors.website?.message}
                                    {...register("website", {
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: "Сайт должен быть валидным URL адресом",
                                        },
                                    })}
                                />

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        isLoading={isLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Создать компанию
                                    </Button>
                                    <Link href="/employer/companies" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Отмена
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}