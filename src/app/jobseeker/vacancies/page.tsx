"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, MapPin, DollarSign, Building2, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent } from "@/components/ui/Card";
import { vacancyService } from "@/services/api";
import type { VacancyDto, PageResponse } from "@/types";
import toast from "react-hot-toast";

export default function JobSeekerVacanciesPage() {
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchVacancies();
    }, [currentPage]);

    const fetchVacancies = async () => {
        setIsLoading(true);
        try {
            const response: PageResponse<VacancyDto> = await vacancyService.getAll(currentPage, 10);
            setVacancies(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error("Не удалось загрузить вакансии");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVacancies = vacancies.filter((vacancy) =>
        vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacancy.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacancy.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Найдите работу своей мечты
                    </h1>
                    <p className="text-gray-600">
                        Просмотрите {vacancies.length} доступных позиций
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск по названию, компании или описанию..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-8">
                            {filteredVacancies.length > 0 ? (
                                filteredVacancies.map((vacancy, index) => (
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
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                            {vacancy.title}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center">
                                                                <Building2 className="h-4 w-4 mr-1" />
                                                                {vacancy.companyName}
                                                            </div>

                                                            {vacancy.salary && vacancy.salary > 0 && (
                                                                <div className="flex items-center text-green-600 font-medium">
                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                    {vacancy.salary.toLocaleString()} ₽
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-gray-700 line-clamp-2">
                                                            {vacancy.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/jobseeker/vacancies/${vacancy.id}`}>
                                                            <Button>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Подробнее
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Вакансии не найдены
                                        </h3>
                                        <p className="text-gray-600">
                                            {searchTerm
                                                ? "Попробуйте изменить параметры поиска"
                                                : "Загляните позже, чтобы увидеть новые предложения"}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-center gap-2"
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                >
                                    Назад
                                </Button>

                                <div className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                    <span className="text-sm text-gray-700">
                                        Страница {currentPage + 1} из {totalPages}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Вперед
                                </Button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}