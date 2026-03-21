"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Trash2, Briefcase, DollarSign, Globe, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { vacancyService } from "@/services/api";
import type { VacancyDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerVacanciesPage() {
    const { isAuthenticated, userRole, userId, loading } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        if (isAuthenticated && userRole === "EMPLOYER" && userId) {
            fetchVacancies();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchVacancies = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const response = await vacancyService.getByEmployer(userId, 0, 100);
            setVacancies(Array.isArray(response.content) ? response.content : []);
        } catch (error) {
            toast.error("Не удалось загрузить вакансии");
            console.error("Fetch vacancies error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить вакансию?")) return;

        try {
            await vacancyService.delete(id);
            toast.success("Вакансия удалена");
            fetchVacancies();
        } catch (error) {
            toast.error("Не удалось удалить вакансию");
        }
    };

    const handleTogglePublish = async (vacancy: VacancyDto) => {
        try {
            if (vacancy.isPublished) {
                await vacancyService.unpublish(vacancy.id);
                toast.success("Вакансия снята с публикации");
            } else {
                await vacancyService.publish(vacancy.id);
                toast.success("Вакансия опубликована");
            }
            fetchVacancies();
        } catch (error) {
            toast.error("Не удалось изменить статус публикации");
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background py-8 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Мои вакансии
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Управление объявлениями о вакансиях
                        </p>
                    </div>
                    <Link href="/employer/vacancies/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Разместить новую вакансию
                        </Button>
                    </Link>
                </motion.div>

                {/* Vacancies List */}
                {vacancies.length > 0 ? (
                    <div className="space-y-4">
                        {vacancies.map((vacancy, index) => (
                            <motion.div
                                key={vacancy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card hover>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                        {vacancy.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        vacancy.isPublished
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                                    }`}>
                                                        {vacancy.isPublished ? "Опубликована" : "Черновик"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    <div className="flex items-center">
                                                        <Briefcase className="h-4 w-4 mr-1" />
                                                        {vacancy.companyName}
                                                    </div>

                                                    {vacancy.salary && vacancy.salary > 0 && (
                                                        <div className="flex items-center text-green-600 font-medium">
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            {vacancy.salary.toLocaleString()} ₽
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                                                    {vacancy.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTogglePublish(vacancy)}
                                                    title={vacancy.isPublished ? "Снять с публикации" : "Опубликовать"}
                                                >
                                                    {vacancy.isPublished ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                            Скрыть
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Globe className="h-4 w-4 mr-1" />
                                                            Опубликовать
                                                        </>
                                                    )}
                                                </Button>
                                                <Link href={`/employer/vacancies/${vacancy.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Вид
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(vacancy.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Вакансий пока нет
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Создайте первое объявление о вакансии, чтобы начать набор персонала
                                </p>
                                <Link href="/employer/vacancies/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Разместите свою первую вакансию
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
