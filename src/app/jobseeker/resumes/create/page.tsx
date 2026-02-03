"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    education: Array<Omit<EducationDto, "id" | "resumeId">>;
    skills: Array<{ name: string }>;
};

export default function CreateResumePage() {
    const { userId, isAuthenticated, userRole } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            education: [{ institution: "", degree: "", fieldOfStudy: "", startYear: 2020, endYear: 2024 }],
            skills: [{ name: "" }],
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

    const onSubmit = async (data: FormData) => {
        if (!userId) {
            toast.error("Пользователь не авторизован");
            return;
        }

        setIsLoading(true);
        try {
            const resumePayload: Omit<ResumeDto, "id"> = {
                userId,
                title: data.title,
                summary: data.summary,
                experienceYears: data.experienceYears,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            };

            const createdResume = await resumeService.create(resumePayload);

            for (const edu of data.education) {
                if (edu.institution && edu.degree && edu.fieldOfStudy) {
                    await educationService.create({
                        ...edu,
                        resumeId: createdResume.id,
                    });
                }
            }

            for (const skill of data.skills) {
                if (skill.name.trim()) {
                    await skillService.create({
                        name: skill.name,
                        resumeId: createdResume.id,
                    });
                }
            }

            toast.success("Резюме успешно создано!");
            router.push("/jobseeker/resumes");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

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
                            <CardTitle>Создайте свое резюме</CardTitle>
                            <CardDescription>
                                Создайте полное резюме для подачи заявок на вакансии
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>

                                    <Input
                                        label="Название резюме"
                                        placeholder="например, Старший разработчик ПО"
                                        required
                                        error={errors.title?.message}
                                        {...register("title", {
                                            required: "Название обязательно",
                                            minLength: {
                                                value: 3,
                                                message: "Название должно содержать минимум 3 символа",
                                            },
                                            maxLength: {
                                                value: 255,
                                                message: "Название должно содержать максимум 255 символов",
                                            },
                                        })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Профессиональное резюме
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Краткий обзор вашего опыта и навыков..."
                                            {...register("summary", {
                                                maxLength: {
                                                    value: 5000,
                                                    message: "Резюме должно содержать максимум 5000 символов",
                                                },
                                            })}
                                        />
                                        {errors.summary && (
                                            <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
                                        )}
                                    </div>

                                    <Input
                                        label="Лет опыта"
                                        type="number"
                                        placeholder="например, 5"
                                        error={errors.experienceYears?.message}
                                        {...register("experienceYears", {
                                            valueAsNumber: true,
                                            min: {
                                                value: 0,
                                                message: "Опыт не может быть отрицательным",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Контактный email"
                                        type="email"
                                        placeholder="ivan@example.ru"
                                        error={errors.contactEmail?.message}
                                        {...register("contactEmail", {
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Неверный формат email",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Контактный телефон"
                                        type="tel"
                                        placeholder="+79001234567"
                                        error={errors.contactPhone?.message}
                                        {...register("contactPhone", {
                                            pattern: {
                                                value: /^[+]?[- 0-9()]{7,20}$/,
                                                message: "Неверный формат телефона",
                                            },
                                        })}
                                    />
                                </div>

                                {/* Education */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Образование</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendEducation({ institution: "", degree: "", fieldOfStudy: "", startYear: 2020, endYear: 2024 })}
                                            className="hover:bg-blue-50"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить образование
                                        </Button>
                                    </div>

                                    {educationFields.map((field, index) => (
                                        <Card key={field.id} className="border-2 shadow-md bg-white">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-900">Образование {index + 1}</h4>
                                                    {educationFields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeEducation(index)}
                                                            className="hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <Input
                                                    label="Учебное заведение"
                                                    placeholder="МГУ им. Ломоносова"
                                                    {...register(`education.${index}.institution`)}
                                                />

                                                <Input
                                                    label="Степень"
                                                    placeholder="Бакалавр наук"
                                                    {...register(`education.${index}.degree`)}
                                                />

                                                <Input
                                                    label="Специальность"
                                                    placeholder="Информатика"
                                                    {...register(`education.${index}.fieldOfStudy`)}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="Год начала"
                                                        type="number"
                                                        placeholder="2020"
                                                        {...register(`education.${index}.startYear`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />

                                                    <Input
                                                        label="Год окончания (необязательно)"
                                                        type="number"
                                                        placeholder="2024"
                                                        {...register(`education.${index}.endYear`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Skills */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Навыки</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendSkill({ name: "" })}
                                            className="hover:bg-green-50"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить навык
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <Input
                                                    placeholder="например, JavaScript, Python и т.д."
                                                    {...register(`skills.${index}.name`)}
                                                />
                                                {skillFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSkill(index)}
                                                        className="hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-4 pt-6 border-t">
                                    <Button
                                        type="submit"
                                        className="flex-1 shadow-md hover:shadow-lg transition-shadow"
                                        isLoading={isLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Создать резюме
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