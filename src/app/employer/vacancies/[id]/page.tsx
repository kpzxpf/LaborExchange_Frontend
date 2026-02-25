"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    MapPin,
    DollarSign,
    Calendar,
    Building2,
    Clock,
    Users,
    Edit,
    Trash2,
    ArrowLeft,
    Loader2,
    Sparkles,
    Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vacancyService, skillService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Vacancy {
    id: number;
    title: string;
    description: string;
    salary?: number | null;
    location?: string;
    companyName: string;
    employmentType?: string;
    experienceLevel?: string;
    createdAt?: string;
    employerId: number;
}

interface Skill {
    id: number;
    name: string;
}

export default function VacancyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vacancyId = Number(params.id);
    const { userId } = useAuth();

    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadVacancyData();
    }, [vacancyId]);

    const loadVacancyData = async () => {
        try {
            setIsLoading(true);

            // Load vacancy
            const vacancyData = await vacancyService.getById(vacancyId);
            setVacancy(vacancyData);

            // Load skills
            const skillIds = await vacancyService.getSkillIds(vacancyId);
            if (skillIds.length > 0) {
                const skillNames = await skillService.getNamesByIds(skillIds);
                const skillsData = skillIds.map((id: number, index: number) => ({
                    id,
                    name: skillNames[index],
                }));
                setSkills(skillsData);
            }
        } catch (error) {
            console.error("Failed to load vacancy:", error);
            alert("Не удалось загрузить вакансию");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Вы уверены, что хотите удалить эту вакансию?")) {
            return;
        }

        try {
            setIsDeleting(true);
            await vacancyService.delete(vacancyId);
            router.push("/employer/vacancies");
        } catch (error) {
            console.error("Failed to delete vacancy:", error);
            alert("Не удалось удалить вакансию");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Ссылка скопирована в буфер обмена!");
    };

    const formatEmploymentType = (type: string) => {
        const types: Record<string, string> = {
            FULL_TIME: "Полная занятость",
            PART_TIME: "Частичная занятость",
            CONTRACT: "Контракт",
            FREELANCE: "Фриланс",
        };
        return types[type] || type;
    };

    const formatExperienceLevel = (level: string) => {
        const levels: Record<string, string> = {
            INTERN: "Стажер",
            JUNIOR: "Junior",
            MIDDLE: "Middle",
            SENIOR: "Senior",
            LEAD: "Lead",
        };
        return levels[level] || level;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-4"
                    >
                        <Loader2 className="w-12 h-12 text-indigo-600" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Загрузка вакансии...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!vacancy) return null;

    const isOwner = userId === vacancy.employerId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
            >
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Назад</span>
                        </motion.button>

                        {isOwner && (
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push(`/employer/vacancies/${vacancyId}/edit`)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Редактировать</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Удалить</span>
                                </motion.button>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Поделиться</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                    {vacancy.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {vacancy.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>{vacancy.companyName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{vacancy.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                Описание вакансии
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {vacancy.description}
                            </div>
                        </motion.div>

                        {/* Skills */}
                        <AnimatePresence>
                            {skills.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                        Требуемые навыки
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <motion.div
                                                key={skill.id}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.3 + index * 0.05 }}
                                                whileHover={{ scale: 1.05 }}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg"
                                            >
                                                {skill.name}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Details Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 sticky top-24"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Детали вакансии
                            </h3>

                            {vacancy.salary && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Зарплата
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {vacancy.salary.toLocaleString()} ₽
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Тип занятости
                                    </p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatEmploymentType(vacancy.employmentType ?? "")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Уровень опыта
                                    </p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatExperienceLevel(vacancy.experienceLevel ?? "")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Опубликовано
                                    </p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {vacancy.createdAt ? formatDate(vacancy.createdAt) : "—"}
                                    </p>
                                </div>
                            </div>

                            {!isOwner && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    Откликнуться
                                </motion.button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}