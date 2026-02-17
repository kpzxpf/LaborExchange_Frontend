"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Award, GraduationCap, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { resumeService, educationService, skillService } from "@/services/api";
import type { ResumeDto, EducationDto, SkillDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerResumeViewPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, userRole, loading } = useAuth();

    const [resume, setResume] = useState<ResumeDto | null>(null);
    const [education, setEducation] = useState<EducationDto[]>([]);
    const [skills, setSkills] = useState<SkillDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        // Проверка доступа: только для авторизованных работодателей
        if (!isAuthenticated || userRole !== "EMPLOYER") {
            router.push("/auth/login");
            return;
        }

        if (params.id) {
            fetchResumeData();
        }
    }, [params.id, isAuthenticated, userRole, loading, router]);

    const fetchResumeData = async () => {
        setIsLoading(true);
        try {
            const resumeId = Number(params.id);

            // Параллельная загрузка всех данных резюме
            const [resumeData, educationData, skillsData] = await Promise.all([
                resumeService.getById(resumeId),
                educationService.getByResume(resumeId),
                skillService.getByResume(resumeId),
            ]);

            setResume(resumeData);
            setEducation(educationData || []);
            setSkills(skillsData || []);
        } catch (error) {
            console.error(error);
            toast.error("Не удалось загрузить данные резюме");
            router.push("/employer/applications");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!resume) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Кнопка возврата к списку откликов */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/employer/applications")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад к откликам
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6 border-none shadow-md overflow-hidden">
                        <div className="h-2 bg-blue-600" />
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {resume.title}
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {resume.contactEmail && (
                                    <div className="flex items-center text-gray-700">
                                        <Mail className="h-5 w-5 mr-3 text-blue-500" />
                                        <span className="font-medium">{resume.contactEmail}</span>
                                    </div>
                                )}

                                {resume.contactPhone && (
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="h-5 w-5 mr-3 text-blue-500" />
                                        <span className="font-medium">{resume.contactPhone}</span>
                                    </div>
                                )}

                                {resume.experienceYears !== undefined && (
                                    <div className="flex items-center text-gray-700">
                                        <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                                        <span>Опыт работы: <strong>{resume.experienceYears} лет</strong></span>
                                    </div>
                                )}
                            </div>

                            {resume.summary && (
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        О кандидате
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {resume.summary}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {education.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card className="border-none shadow-md">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <div className="flex items-center">
                                    <GraduationCap className="h-6 w-6 text-blue-600 mr-3" />
                                    <CardTitle>Образование</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-8">
                                    {education.map((edu, index) => (
                                        <div key={edu.id || index} className="relative">
                                            <h4 className="text-lg font-bold text-gray-900">
                                                {edu.degree}
                                            </h4>
                                            <p className="text-blue-600 font-semibold mt-1">
                                                {edu.institution}
                                            </p>
                                            <p className="text-gray-600 mt-1">
                                                {edu.fieldOfStudy}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2 font-medium">
                                                {edu.startYear} — {edu.endYear || "По настоящее время"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {skills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-none shadow-md">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <div className="flex items-center">
                                    <Award className="h-6 w-6 text-blue-600 mr-3" />
                                    <CardTitle>Профессиональные навыки</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100"
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}