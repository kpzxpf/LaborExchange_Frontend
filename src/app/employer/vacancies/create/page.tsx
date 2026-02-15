"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { vacancyService, companyService } from "@/services/api";
import type { VacancyDto, CompanyDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

type FormData = Omit<VacancyDto, "id" | "employerId">;

export default function CreateVacancyPage() {
    const { userId, userRole, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [companies, setCompanies] = useState<CompanyDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated || userRole !== "EMPLOYER") {
            router.push("/auth/login");
            return;
        }

        fetchCompanies();
    }, [isAuthenticated, userRole, loading, router]);

    const fetchCompanies = async () => {
        setIsLoadingCompanies(true);
        try {
            const data = await companyService.getAll();
            setCompanies(data);
        } catch (error) {
            toast.error("Не удалось загрузить компании");
        } finally {
            setIsLoadingCompanies(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!userId) {
            toast.error("Пользователь не авторизован");
            return;
        }

        if (companies.length === 0) {
            toast.error("Сначала создайте компанию");
            router.push("/employer/companies");
            return;
        }

        setIsLoading(true);
        try {
            await vacancyService.create({
                ...data,
                employerId: userId,
                salary: data.salary ? Number(data.salary) : undefined,
            });
            toast.success("Вакансия успешно создана!");
            router.push("/employer/vacancies");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoadingCompanies) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== "EMPLOYER") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/employer/vacancies">
                        <Button variant="ghost" size="sm" className="hover:bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад к вакансиям
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle>Создать новую вакансию</CardTitle>
                            <CardDescription>
                                Заполните информацию о вакансии для привлечения кандидатов
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {companies.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 mb-4">
                                        У вас нет компаний. Создайте компанию перед публикацией вакансии.
                                    </p>
                                    <Link href="/employer/companies">
                                        <Button>Создать компанию</Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <Input
                                        label="Название вакансии"
                                        placeholder="например, Старший разработчик ПО"
                                        required
                                        error={errors.title?.message}
                                        {...register("title", {
                                            required: "Название обязательно",
                                            minLength: {
                                                value: 3,
                                                message: "Название должно содержать минимум 3 символа",
                                            },
                                            maxLength: {
                                                value: 255,
                                                message: "Название должно содержать максимум 255 символов",
                                            },
                                        })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Описание <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Подробное описание вакансии, требований и обязанностей..."
                                            {...register("description", {
                                                required: "Описание обязательно",
                                                maxLength: {
                                                    value: 5000,
                                                    message: "Описание должно содержать максимум 5000 символов",
                                                },
                                            })}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Компания <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            {...register("companyName", {
                                                required: "Выберите компанию",
                                            })}
                                        >
                                            <option value="">Выберите компанию</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.name}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.companyName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.companyName.message}
                                            </p>
                                        )}
                                    </div>

                                    <Input
                                        label="Зарплата (₽)"
                                        type="number"
                                        placeholder="например, 150000"
                                        error={errors.salary?.message}
                                        {...register("salary", {
                                            min: {
                                                value: 0,
                                                message: "Зарплата не может быть отрицательной",
                                            },
                                        })}
                                    />

                                    <div className="flex gap-4 pt-6 border-t">
                                        <Button
                                            type="submit"
                                            className="flex-1 shadow-md hover:shadow-lg transition-shadow"
                                            isLoading={isLoading}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Создать вакансию
                                        </Button>
                                        <Link href="/employer/vacancies" className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Отмена
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}