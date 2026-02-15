"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { resumeService, educationService, skillService } from "@/services/api";
import type { ResumeDto, EducationDto, SkillDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

type FormData = {
    title: string;
    summary: string;
    experienceYears: number;
    contactEmail: string;
    contactPhone: string;
    isPublished: boolean;
    education: Array<Omit<EducationDto, "id" | "resumeId">>;
    skills: Array<{ name: string }>;
};

export default function EditResumePage() {
    const params = useParams();
    const router = useRouter();
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            isPublished: false,
            education: [],
            skills: [],
        },
    });

    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
        control,
        name: "education",
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control,
        name: "skills",
    });

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "JOB_SEEKER")) {
            router.push("/auth/login");
            return;
        }

        if (params.id && userId) {
            loadResumeData();
        }
    }, [params.id, isAuthenticated, userRole, userId, loading, router]);

    const loadResumeData = async () => {
        setIsLoading(true);
        try {
            const resumeId = Number(params.id);
            const [resumeData, educationData, skillsData] = await Promise.all([
                resumeService.getById(resumeId),
                educationService.getByResume(resumeId),
                skillService.getByResume(resumeId),
            ]);

            setValue("title", resumeData.title);
            setValue("summary", resumeData.summary || "");
            setValue("experienceYears", resumeData.experienceYears || 0);
            setValue("contactEmail", resumeData.contactEmail || "");
            setValue("contactPhone", resumeData.contactPhone || "");
            setValue("isPublished", resumeData.isPublished || false);

            if (educationData.length > 0) {
                setValue("education", educationData.map(edu => ({
                    institution: edu.institution,
                    degree: edu.degree,
                    fieldOfStudy: edu.fieldOfStudy,
                    startYear: edu.startYear,
                    endYear: edu.endYear,
                })));
            }

            if (skillsData.length > 0) {
                setValue("skills", skillsData.map(skill => ({ name: skill.name })));
            }
        } catch (error) {
            toast.error("Не удалось загрузить резюме");
            router.push("/jobseeker/resumes");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!userId || !params.id) return;

        setIsSaving(true);
        try {
            const resumePayload: ResumeDto = {
                id: Number(params.id),
                userId,
                title: data.title,
                summary: data.summary,
                experienceYears: data.experienceYears,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                isPublished: data.isPublished,
            };

            await resumeService.update(resumePayload);

            toast.success("Резюме успешно обновлено!");
            router.push("/jobseeker/resumes");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/jobseeker/resumes">
                        <Button variant="ghost" size="sm" className="hover:bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад к резюме
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
                            <CardTitle>Редактировать резюме</CardTitle>
                            <CardDescription>Обновите информацию в вашем резюме</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>

                                    <Input
                                        label="Название резюме"
                                        placeholder="например, Старший разработчик ПО"
                                        required
                                        error={errors.title?.message}
                                        {...register("title", {
                                            required: "Название обязательно",
                                            minLength: { value: 3, message: "Минимум 3 символа" },
                                        })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Профессиональное резюме
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Краткий обзор вашего опыта..."
                                            {...register("summary")}
                                        />
                                    </div>

                                    <Input
                                        label="Лет опыта"
                                        type="number"
                                        {...register("experienceYears", { valueAsNumber: true })}
                                    />

                                    <Input
                                        label="Контактный email"
                                        type="email"
                                        {...register("contactEmail")}
                                    />

                                    <Input
                                        label="Контактный телефон"
                                        type="tel"
                                        {...register("contactPhone")}
                                    />

                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            {...register("isPublished")}
                                        />
                                        <label htmlFor="isPublished" className="text-sm font-medium text-gray-900 cursor-pointer">
                                            Опубликовать резюме (работодатели смогут его увидеть)
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Образование</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendEducation({
                                                institution: "",
                                                degree: "",
                                                fieldOfStudy: "",
                                                startYear: 2020,
                                                endYear: 2024
                                            })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить
                                        </Button>
                                    </div>

                                    {educationFields.map((field, index) => (
                                        <Card key={field.id} className="border-2">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-900">Образование {index + 1}</h4>
                                                    {educationFields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeEducation(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <Input
                                                    label="Учебное заведение"
                                                    {...register(`education.${index}.institution`)}
                                                />
                                                <Input
                                                    label="Степень"
                                                    {...register(`education.${index}.degree`)}
                                                />
                                                <Input
                                                    label="Специальность"
                                                    {...register(`education.${index}.fieldOfStudy`)}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="Год начала"
                                                        type="number"
                                                        {...register(`education.${index}.startYear`, { valueAsNumber: true })}
                                                    />
                                                    <Input
                                                        label="Год окончания"
                                                        type="number"
                                                        {...register(`education.${index}.endYear`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Навыки</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendSkill({ name: "" })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <Input
                                                    placeholder="например, JavaScript"
                                                    {...register(`skills.${index}.name`)}
                                                />
                                                {skillFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSkill(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        isLoading={isSaving}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Сохранить изменения
                                    </Button>
                                    <Link href="/jobseeker/resumes" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Отмена
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}