"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    Building2,
    Users,
    TrendingUp,
    Plus,
    Eye,
    FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { vacancyService, companyService, applicationService } from "@/services/api";
import type { VacancyDto, CompanyDto, ApplicationStatisticsDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerDashboard() {
    const { userRole, userId, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
    const [companies, setCompanies] = useState<CompanyDto[]>([]);
    const [statistics, setStatistics] = useState<ApplicationStatisticsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "EMPLOYER")) {
            router.push("/auth/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [vacanciesRes, companiesRes, statsRes] = await Promise.all([
                    vacancyService.getAll(0, 5),
                    companyService.getAll(),
                    applicationService.getStatistics(),
                ]);

                setVacancies(vacanciesRes.content);
                setCompanies(companiesRes);
                setStatistics(statsRes);
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && userRole === "EMPLOYER") {
            fetchData();
        }
    }, [isAuthenticated, userRole, loading, router]);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    const stats = [
        {
            title: "Active Vacancies",
            value: vacancies.length,
            icon: Briefcase,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Companies",
            value: companies.length,
            icon: Building2,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Total Applications",
            value: statistics?.totalApplications || 0,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Active Applications",
            value: statistics?.activeApplications || 0,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Employer Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage your vacancies, companies, and applications
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Commonly used actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/employer/vacancies/create">
                                    <Button className="w-full" size="lg">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Post New Vacancy
                                    </Button>
                                </Link>
                                <Link href="/employer/companies/create">
                                    <Button variant="secondary" className="w-full" size="lg">
                                        <Building2 className="h-5 w-5 mr-2" />
                                        Add Company
                                    </Button>
                                </Link>
                                <Link href="/employer/applications">
                                    <Button variant="outline" className="w-full" size="lg">
                                        <FileText className="h-5 w-5 mr-2" />
                                        View Applications
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Vacancies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Vacancies</CardTitle>
                                    <CardDescription>Your latest job postings</CardDescription>
                                </div>
                                <Link href="/employer/vacancies">
                                    <Button variant="ghost" size="sm">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {vacancies.length > 0 ? (
                                <div className="space-y-4">
                                    {vacancies.map((vacancy) => (
                                        <div
                                            key={vacancy.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {vacancy.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {vacancy.companyName}
                                                </p>
                                                {vacancy.salary && (
                                                    <p className="text-sm text-green-600 font-medium mt-1">
                                                        ${vacancy.salary.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Link href={`/employer/vacancies/${vacancy.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No vacancies yet
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Start by creating your first job posting
                                    </p>
                                    <Link href="/employer/vacancies/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Vacancy
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}