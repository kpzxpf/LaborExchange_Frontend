"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, DollarSign, Trash2, CheckCircle, XCircle, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { vacancyService, applicationService } from "@/services/api";
import type { VacancyDto, ApplicationResponseDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function EmployerVacancyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userRole, isAuthenticated, loading } = useAuth();
    const [vacancy, setVacancy] = useState<VacancyDto | null>(null);
    const [applications, setApplications] = useState<ApplicationResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        if (params.id) {
            fetchData();
        }
    }, [params.id, isAuthenticated, userRole, loading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const vacancyId = Number(params.id);
            const [vacancyData, applicationsData] = await Promise.all([
                vacancyService.getById(vacancyId),
                applicationService.getByVacancy(vacancyId),
            ]);

            setVacancy(vacancyData);
            setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        } catch (error) {
            console.error(error);
            toast.error("Не удалось загрузить данные");
            router.push("/employer/vacancies");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!vacancy) return;

        const originalStatus = vacancy.isPublished;
        try {
            if (originalStatus) {
                await vacancyService.unpublish(vacancy.id);
                toast.success("Вакансия снята с публикации");
            } else {
                await vacancyService.publish(vacancy.id);
                toast.success("Вакансия опубликована");
            }

            setVacancy({
                ...vacancy,
                isPublished: !originalStatus
            });

        } catch (error) {
            toast.error(handleApiError(error));
        }
    };

    const handleDelete = async () => {
        if (!vacancy) return;
        if (!confirm("Вы уверены, что хотите удалить эту вакансию? Это действие необратимо.")) return;

        try {
            await vacancyService.delete(vacancy.id);
            toast.success("Вакансия успешно удалена");
            router.push("/employer/vacancies");
        } catch (error) {
            toast.error(handleApiError(error));
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!vacancy) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <Link href="/employer/vacancies">
                        <Button variant="ghost" size="sm" className="hover:bg-white text-gray-600">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад к вакансиям
                        </Button>
                    </Link>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTogglePublish}
                            className={vacancy.isPublished ? "hover:bg-orange-50" : "hover:bg-green-50"}
                        >
                            {vacancy.isPublished ? (
                                <>
                                    <XCircle className="h-4 w-4 mr-2 text-orange-600" />
                                    Снять с публикации
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Опубликовать
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="hover:bg-red-50 text-red-600 border-red-100"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-xl bg-white mb-6 border-none">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                    {vacancy.title}
                                </h1>
                                <span
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                                        vacancy.isPublished
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                    {vacancy.isPublished ? "Опубликовано" : "Черновик"}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-6 mb-8 text-sm sm:text-base">
                                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                                    <span className="font-medium">{vacancy.companyName}</span>
                                </div>

                                {vacancy.salary && vacancy.salary > 0 && (
                                    <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded-lg font-semibold">
                                        <DollarSign className="h-5 w-5 mr-1" />
                                        <span>{vacancy.salary.toLocaleString()} ₽</span>
                                    </div>
                                )}

                                <div className="flex items-center text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                                    <span className="font-medium">{applications.length} откликов</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Описание вакансии
                                </h3>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {vacancy.description}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Applications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="shadow-xl bg-white border-none">
                        <CardHeader className="border-b border-gray-50">
                            <CardTitle className="flex items-center text-gray-900">
                                <Users className="h-6 w-6 mr-3 text-blue-600" />
                                Отклики на вакансию
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.map((application) => (
                                        <div
                                            key={application.id}
                                            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Отклик #{application.id}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Статус: <span className="text-blue-600 italic">{application.statusName}</span>
                                                </p>
                                            </div>
                                            <Link href={`/employer/applications#${application.id}`}>
                                                <Button variant="outline" size="sm" className="bg-white">
                                                    Посмотреть
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h4 className="text-gray-900 font-medium mb-1">Пока нет откликов</h4>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                        {vacancy.isPublished
                                            ? "Мы сообщим вам, когда кто-то откликнется на эту вакансию."
                                            : "Опубликуйте вакансию, чтобы она стала доступна соискателям."
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}