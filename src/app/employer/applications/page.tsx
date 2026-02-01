"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, Briefcase, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { vacancyService } from "@/services/api";
import type { VacancyDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerVacanciesPage() {
    const { isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        if (isAuthenticated && userRole === "EMPLOYER") {
            fetchVacancies();
        }
    }, [isAuthenticated, userRole, loading, router]);

    const fetchVacancies = async () => {
        setIsLoading(true);
        try {
            const response = await vacancyService.getAll(0, 100);
            setVacancies(response.content);
        } catch (error) {
            toast.error("Failed to load vacancies");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this vacancy?")) return;

        try {
            await vacancyService.delete(id);
            toast.success("Vacancy deleted successfully");
            fetchVacancies();
        } catch (error) {
            toast.error("Failed to delete vacancy");
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Vacancies
                        </h1>
                        <p className="text-gray-600">
                            Manage your job postings
                        </p>
                    </div>
                    <Link href="/employer/vacancies/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Post New Vacancy
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
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    {vacancy.title}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center">
                                                        <Briefcase className="h-4 w-4 mr-1" />
                                                        {vacancy.companyName}
                                                    </div>

                                                    {vacancy.salary && vacancy.salary > 0 && (
                                                        <div className="flex items-center text-green-600 font-medium">
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            ${vacancy.salary.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-gray-700 line-clamp-2">
                                                    {vacancy.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link href={`/employer/vacancies/${vacancy.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
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
                                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No vacancies yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first job posting to start hiring
                                </p>
                                <Link href="/employer/vacancies/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Post Your First Vacancy
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