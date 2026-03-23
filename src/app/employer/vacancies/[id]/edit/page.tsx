"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Briefcase,
    DollarSign,
    FileText,
    Building2,
    ArrowLeft,
    Save,
    Loader2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vacancyService } from "@/services/api";
import { SkillSelector } from "@/components/ui/SkillSelector";

export default function EditVacancyPage() {
    const router = useRouter();
    const params = useParams();
    const vacancyId = Number(params.id);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        salary: "",
        companyName: "",
    });

    useEffect(() => {
        loadVacancy();
    }, [vacancyId]);

    const loadVacancy = async () => {
        try {
            setIsLoading(true);
            const vacancy = await vacancyService.getById(vacancyId);

            setFormData({
                title: vacancy.title,
                description: vacancy.description || "",
                salary: vacancy.salary?.toString() || "",
                companyName: vacancy.companyName || "",
            });

            // Load current skills
            const skillIds = await vacancyService.getSkillIds(vacancyId);
            setSelectedSkills(skillIds);
        } catch (error) {
            console.error("Failed to load vacancy:", error);
            alert("Не удалось загрузить вакансию");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSaving(true);

            // 1. Update vacancy
            await vacancyService.update(vacancyId, {
                title: formData.title,
                description: formData.description,
                salary: formData.salary ? parseFloat(formData.salary) : null,
                companyName: formData.companyName,
            });

            // 2. Update skills (use bulk update)
            await vacancyService.setSkills(vacancyId, selectedSkills);

            // Success animation and redirect
            await new Promise((resolve) => setTimeout(resolve, 500));
            router.push(`/employer/vacancies/${vacancyId}`);
        } catch (error) {
            console.error("Failed to update vacancy:", error);
            alert("Не удалось обновить вакансию. Попробуйте снова.");
        } finally {
            setIsSaving(false);
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
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
                    <p className="text-slate-600 dark:text-slate-400">
                        Загрузка вакансии...
                    </p>
                </motion.div>
            </div>
        );
    }

    const isFormValid =
        formData.title.trim() &&
        formData.description.trim() &&
        formData.companyName.trim();

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header-glass border-b border-white/5 sticky top-0 z-10"
            >
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Назад</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Редактировать вакансию
                            </h1>
                        </div>

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
                </div>
            </motion.div>

            {/* Form */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Main Info Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8 space-y-6"
                    >
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Основная информация
                        </h2>

                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <Briefcase className="w-4 h-4" />
                                Название должности *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Senior Frontend Developer"
                                required
                                className={cn(
                                    "w-full px-4 py-3 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-slate-50 dark:bg-[#11111c]",
                                    "border-slate-200 dark:border-slate-700",
                                    "text-slate-900 dark:text-slate-100",
                                    "placeholder:text-gray-400"
                                )}
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <Building2 className="w-4 h-4" />
                                Название компании *
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Например: Tech Innovations Inc."
                                required
                                className={cn(
                                    "w-full px-4 py-3 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-slate-50 dark:bg-[#11111c]",
                                    "border-slate-200 dark:border-slate-700",
                                    "text-slate-900 dark:text-slate-100",
                                    "placeholder:text-gray-400"
                                )}
                            />
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <DollarSign className="w-4 h-4" />
                                Зарплата (необязательно)
                            </label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="150000"
                                className={cn(
                                    "w-full px-4 py-3 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-slate-50 dark:bg-[#11111c]",
                                    "border-slate-200 dark:border-slate-700",
                                    "text-slate-900 dark:text-slate-100",
                                    "placeholder:text-gray-400"
                                )}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <FileText className="w-4 h-4" />
                                Описание вакансии *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Опишите требования, обязанности и условия работы..."
                                required
                                rows={8}
                                className={cn(
                                    "w-full px-4 py-3 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-slate-50 dark:bg-[#11111c]",
                                    "border-slate-200 dark:border-slate-700",
                                    "text-slate-900 dark:text-slate-100",
                                    "placeholder:text-gray-400",
                                    "resize-none"
                                )}
                            />
                        </div>
                    </motion.div>

                    {/* Skills Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8"
                    >
                        <SkillSelector
                            selected={selectedSkills}
                            onChange={setSelectedSkills}
                            placeholder="Начните вводить навык..."
                            maxSkills={15}
                        />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-end gap-4"
                    >
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Отмена
                        </motion.button>

                        <motion.button
                            type="submit"
                            disabled={!isFormValid || isSaving}
                            whileHover={isFormValid ? { scale: 1.02 } : {}}
                            whileTap={isFormValid ? { scale: 0.98 } : {}}
                            className={cn(
                                "px-8 py-3 rounded-xl font-medium flex items-center gap-2",
                                "transition-all duration-200",
                                isFormValid && !isSaving
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Сохранить изменения
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}