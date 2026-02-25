"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    User,
    Briefcase,
    GraduationCap,
    Plus,
    X,
    ArrowLeft,
    Save,
    Loader2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resumeService, educationService } from "@/services/api";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { useAuth } from "@/contexts/AuthContext";

interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
}

export default function CreateResumePage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
    });

    const [educations, setEducations] = useState<Education[]>([
        {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            description: "",
        },
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (
        index: number,
        field: keyof Education,
        value: string
    ) => {
        setEducations((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addEducation = () => {
        setEducations((prev) => [
            ...prev,
            {
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                description: "",
            },
        ]);
    };

    const removeEducation = (index: number) => {
        setEducations((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert("Необходимо войти в систему");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Create resume
            const resume = await resumeService.create({
                title: formData.title,
                summary: formData.summary,
                userId: userId,
            });

            // 2. Add skills (FIXED: properly save skills)
            for (const skillId of selectedSkills) {
                await resumeService.addSkill(resume.id, skillId);
            }

            // 3. Add education (FIXED: save education data)
            for (const edu of educations) {
                if (edu.institution.trim() && edu.degree.trim()) {
                    await educationService.create(resume.id, {
                        institution: edu.institution,
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy || "",
                        startDate: edu.startDate || undefined,
                        endDate: edu.endDate || undefined,
                        description: edu.description || undefined,
                    });
                }
            }

            // Success animation and redirect
            await new Promise((resolve) => setTimeout(resolve, 500));
            router.push("/jobseeker/resumes");
        } catch (error) {
            console.error("Failed to create resume:", error);
            alert("Не удалось создать резюме. Попробуйте снова.");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.title.trim() && formData.summary.trim();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
            >
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Назад</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Новое резюме
                            </h1>
                        </div>

                        <div className="w-24" />
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
                    {/* Basic Info Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Основная информация
                        </h2>

                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Briefcase className="w-4 h-4" />
                                Название резюме *
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
                                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-white dark:bg-gray-700",
                                    "border-gray-200 dark:border-gray-600",
                                    "text-gray-900 dark:text-gray-100",
                                    "placeholder:text-gray-400"
                                )}
                            />
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="w-4 h-4" />
                                О себе *
                            </label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                placeholder="Расскажите о своем опыте, навыках и достижениях..."
                                required
                                rows={6}
                                className={cn(
                                    "w-full px-4 py-3 border-2 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                    "transition-all duration-200",
                                    "bg-white dark:bg-gray-700",
                                    "border-gray-200 dark:border-gray-600",
                                    "text-gray-900 dark:text-gray-100",
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
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                    >
                        <SkillSelector
                            selected={selectedSkills}
                            onChange={setSelectedSkills}
                            placeholder="Начните вводить навык..."
                            maxSkills={20}
                        />
                    </motion.div>

                    {/* Education Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                Образование
                            </h2>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addEducation}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Добавить
                            </motion.button>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {educations.map((edu, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            Учебное заведение #{index + 1}
                                        </h3>
                                        {educations.length > 1 && (
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeEducation(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Название учебного заведения *"
                                            value={edu.institution}
                                            onChange={(e) =>
                                                handleEducationChange(index, "institution", e.target.value)
                                            }
                                            className={cn(
                                                "px-4 py-2 border-2 rounded-lg",
                                                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                                "bg-white dark:bg-gray-700",
                                                "border-gray-200 dark:border-gray-600",
                                                "text-gray-900 dark:text-gray-100"
                                            )}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Степень/квалификация *"
                                            value={edu.degree}
                                            onChange={(e) =>
                                                handleEducationChange(index, "degree", e.target.value)
                                            }
                                            className={cn(
                                                "px-4 py-2 border-2 rounded-lg",
                                                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                                "bg-white dark:bg-gray-700",
                                                "border-gray-200 dark:border-gray-600",
                                                "text-gray-900 dark:text-gray-100"
                                            )}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Специальность"
                                            value={edu.fieldOfStudy}
                                            onChange={(e) =>
                                                handleEducationChange(index, "fieldOfStudy", e.target.value)
                                            }
                                            className={cn(
                                                "px-4 py-2 border-2 rounded-lg",
                                                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                                "bg-white dark:bg-gray-700",
                                                "border-gray-200 dark:border-gray-600",
                                                "text-gray-900 dark:text-gray-100"
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                placeholder="Начало"
                                                value={edu.startDate}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "startDate", e.target.value)
                                                }
                                                className={cn(
                                                    "px-4 py-2 border-2 rounded-lg",
                                                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                                    "bg-white dark:bg-gray-700",
                                                    "border-gray-200 dark:border-gray-600",
                                                    "text-gray-900 dark:text-gray-100"
                                                )}
                                            />
                                            <input
                                                type="date"
                                                placeholder="Окончание"
                                                value={edu.endDate}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "endDate", e.target.value)
                                                }
                                                className={cn(
                                                    "px-4 py-2 border-2 rounded-lg",
                                                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                                    "bg-white dark:bg-gray-700",
                                                    "border-gray-200 dark:border-gray-600",
                                                    "text-gray-900 dark:text-gray-100"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <textarea
                                        placeholder="Дополнительная информация"
                                        value={edu.description}
                                        onChange={(e) =>
                                            handleEducationChange(index, "description", e.target.value)
                                        }
                                        rows={2}
                                        className={cn(
                                            "w-full px-4 py-2 border-2 rounded-lg",
                                            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                                            "bg-white dark:bg-gray-700",
                                            "border-gray-200 dark:border-gray-600",
                                            "text-gray-900 dark:text-gray-100",
                                            "resize-none"
                                        )}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-end gap-4"
                    >
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Отмена
                        </motion.button>

                        <motion.button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            whileHover={isFormValid ? { scale: 1.02 } : {}}
                            whileTap={isFormValid ? { scale: 0.98 } : {}}
                            className={cn(
                                "px-8 py-3 rounded-xl font-medium flex items-center gap-2",
                                "transition-all duration-200",
                                isFormValid && !isLoading
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Создать резюме
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}