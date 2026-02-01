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
            toast.error("User not authenticated");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Создаем резюме
            const resumePayload: Omit<ResumeDto, "id"> = {
                userId,
                title: data.title,
                summary: data.summary,
                experienceYears: data.experienceYears,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            };

            const createdResume = await resumeService.create(resumePayload);

            // 2. Добавляем образование
            for (const edu of data.education) {
                if (edu.institution && edu.degree && edu.fieldOfStudy) {
                    await educationService.create({
                        ...edu,
                        resumeId: createdResume.id,
                    });
                }
            }

            // 3. Добавляем навыки
            for (const skill of data.skills) {
                if (skill.name.trim()) {
                    await skillService.create({
                        name: skill.name,
                        resumeId: createdResume.id,
                    });
                }
            }

            toast.success("Resume created successfully!");
            router.push("/jobseeker/resumes");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/jobseeker/resumes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Resumes
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Your Resume</CardTitle>
                            <CardDescription>
                                Build a comprehensive resume to apply for jobs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                                    <Input
                                        label="Resume Title"
                                        placeholder="e.g. Senior Software Developer"
                                        required
                                        error={errors.title?.message}
                                        {...register("title", {
                                            required: "Title is required",
                                            minLength: {
                                                value: 3,
                                                message: "Title must be at least 3 characters",
                                            },
                                            maxLength: {
                                                value: 255,
                                                message: "Title must be at most 255 characters",
                                            },
                                        })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Professional Summary
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Brief overview of your experience and skills..."
                                            {...register("summary", {
                                                maxLength: {
                                                    value: 5000,
                                                    message: "Summary must be at most 5000 characters",
                                                },
                                            })}
                                        />
                                        {errors.summary && (
                                            <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
                                        )}
                                    </div>

                                    <Input
                                        label="Years of Experience"
                                        type="number"
                                        placeholder="e.g. 5"
                                        error={errors.experienceYears?.message}
                                        {...register("experienceYears", {
                                            valueAsNumber: true,
                                            min: {
                                                value: 0,
                                                message: "Experience cannot be negative",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Contact Email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        error={errors.contactEmail?.message}
                                        {...register("contactEmail", {
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Contact Phone"
                                        type="tel"
                                        placeholder="+1234567890"
                                        error={errors.contactPhone?.message}
                                        {...register("contactPhone", {
                                            pattern: {
                                                value: /^[+]?[- 0-9()]{7,20}$/,
                                                message: "Invalid phone number",
                                            },
                                        })}
                                    />
                                </div>

                                {/* Education */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendEducation({ institution: "", degree: "", fieldOfStudy: "", startYear: 2020, endYear: 2024 })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Education
                                        </Button>
                                    </div>

                                    {educationFields.map((field, index) => (
                                        <Card key={field.id} className="border-2">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
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
                                                    label="Institution"
                                                    placeholder="University of California"
                                                    {...register(`education.${index}.institution`)}
                                                />

                                                <Input
                                                    label="Degree"
                                                    placeholder="Bachelor of Science"
                                                    {...register(`education.${index}.degree`)}
                                                />

                                                <Input
                                                    label="Field of Study"
                                                    placeholder="Computer Science"
                                                    {...register(`education.${index}.fieldOfStudy`)}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="Start Year"
                                                        type="number"
                                                        placeholder="2020"
                                                        {...register(`education.${index}.startYear`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />

                                                    <Input
                                                        label="End Year (Optional)"
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
                                        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendSkill({ name: "" })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Skill
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <Input
                                                    placeholder="e.g. JavaScript, Python, etc."
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

                                {/* Submit */}
                                <div className="flex gap-4 pt-6 border-t">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        isLoading={isLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Resume
                                    </Button>
                                    <Link href="/jobseeker/resumes" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
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