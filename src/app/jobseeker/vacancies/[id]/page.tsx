"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Building2, DollarSign, Send, FileText,
    Globe, Mail, Phone, MapPin, Calendar, Sparkles, ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { vacancyService, resumeService, applicationService, companyService, skillService } from "@/services/api";
import type { VacancyDto, ResumeDto, ApplicationRequestDto, CompanyDto, SkillDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function VacancyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const [vacancy, setVacancy] = useState<VacancyDto | null>(null);
    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [skills, setSkills] = useState<SkillDto[]>([]);
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        if (params.id) fetchData();
    }, [params.id, isAuthenticated, userId, loading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const vacancyId = Number(params.id);
            const vacancyData = await vacancyService.getById(vacancyId);
            setVacancy(vacancyData);

            // Параллельная загрузка навыков, компании и резюме пользователя
            const [skillIds] = await Promise.all([
                vacancyService.getSkillIds(vacancyId),
            ]);

            const [skillsData, companyData] = await Promise.all([
                skillService.getByIds(skillIds),
                companyService.getByEmployerId(vacancyData.employerId).catch(() => null),
            ]);

            setSkills(skillsData);
            setCompany(companyData);

            if (userRole === "JOB_SEEKER" && userId) {
                const resumesData = await resumeService.getMy();
                const safeResumes = Array.isArray(resumesData) ? resumesData : [];
                setResumes(safeResumes);
                if (safeResumes.length > 0) setSelectedResumeId(safeResumes[0].id);
            }
        } catch (error) {
            setError("Не удалось загрузить вакансию. Возможно, она была удалена или недоступна.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!vacancy || !userId || !selectedResumeId) {
            toast.error("Пожалуйста, выберите резюме");
            return;
        }
        setIsApplying(true);
        try {
            const applicationData: ApplicationRequestDto = {
                vacancyId: vacancy.id,
                employerId: vacancy.employerId,
                candidateId: userId,
                resumeId: selectedResumeId,
            };
            await applicationService.create(applicationData);
            toast.success("Отклик успешно отправлен!");
            setShowApplyModal(false);
            router.push("/jobseeker/applications");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsApplying(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("ru-RU", {
                day: "numeric", month: "long", year: "numeric",
            });
        } catch { return "—"; }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background gap-4">
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{error}</p>
                <Link href="/jobseeker/vacancies">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        К списку вакансий
                    </Button>
                </Link>
            </div>
        );
    }

    if (!vacancy) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Назад */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <Link href="/jobseeker/vacancies">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад к вакансиям
                        </Button>
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Основной контент */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Заголовок вакансии */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <Card>
                                <CardContent className="p-8">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        {vacancy.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 mb-2">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                                            <span className="font-medium">{vacancy.companyName}</span>
                                        </div>
                                        {vacancy.salary && vacancy.salary > 0 && (
                                            <div className="flex items-center text-green-600 font-semibold">
                                                <DollarSign className="h-5 w-5 mr-1" />
                                                <span>{vacancy.salary.toLocaleString()} ₽</span>
                                            </div>
                                        )}
                                        {vacancy.createdAt && (
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(vacancy.createdAt)}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Описание */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Описание вакансии</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {vacancy.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Навыки */}
                        <AnimatePresence>
                            {skills.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center">
                                                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                                                <CardTitle>Требуемые навыки</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map((skill, index) => (
                                                    <motion.span
                                                        key={skill.id}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: 0.2 + index * 0.04 }}
                                                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                                                    >
                                                        {skill.name}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Компания */}
                        <AnimatePresence>
                            {company && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center">
                                                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                                                <CardTitle>О компании</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {company.name}
                                            </h3>
                                            {company.description && (
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {company.description}
                                                </p>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                {company.location && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <MapPin className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                                                        <span>{company.location}</span>
                                                    </div>
                                                )}
                                                {company.email && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <Mail className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                                                        <span>{company.email}</span>
                                                    </div>
                                                )}
                                                {company.phoneNumber && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <Phone className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                                                        <span>{company.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {company.website && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <Globe className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                                                        <a
                                                            href={company.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            {company.website}
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Сайдбар — отклик */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-6"
                        >
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    {vacancy.salary && vacancy.salary > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Зарплата</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {vacancy.salary.toLocaleString()} ₽
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={resumes.length === 0}
                                    >
                                        <Send className="h-5 w-5 mr-2" />
                                        Откликнуться
                                    </Button>

                                    {resumes.length === 0 && (
                                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                            Сначала{" "}
                                            <Link
                                                href="/jobseeker/resumes/create"
                                                className="text-blue-600 hover:text-blue-700 font-medium underline"
                                            >
                                                создайте резюме
                                            </Link>
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Модалка выбора резюме */}
            <AnimatePresence>
                {showApplyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowApplyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Отклик на: {vacancy.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Выберите резюме
                                            </label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedResumeId || ""}
                                                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                            >
                                                {resumes.map((resume) => (
                                                    <option key={resume.id} value={resume.id}>
                                                        {resume.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <Button className="flex-1" onClick={handleApply} isLoading={isApplying}>
                                                <Send className="h-4 w-4 mr-2" />
                                                Отправить
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowApplyModal(false)}
                                                disabled={isApplying}
                                            >
                                                Отмена
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
