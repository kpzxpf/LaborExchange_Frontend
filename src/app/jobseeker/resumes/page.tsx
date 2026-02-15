"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { resumeService } from "@/services/api";
import type { ResumeDto } from "@/types";
import toast from "react-hot-toast";

export default function ResumesListPage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated || userRole !== "JOB_SEEKER") {
            router.push("/auth/login");
            return;
        }

        if (userId) {
            fetchResumes();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchResumes = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const data = await resumeService.getByUser(userId);
            setResumes(data || []);
        } catch (error) {
            console.error("Resumes error:", error);
            toast.error("Не удалось загрузить резюме");
            setResumes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Вы уверены, что хотите удалить это резюме?")) return;

        try {
            await resumeService.delete(id);
            toast.success("Резюме успешно удалено");
            fetchResumes();
        } catch (error) {
            toast.error("Не удалось удалить резюме");
        }
    };

    const handleTogglePublish = async (resume: ResumeDto) => {
        try {
            if (resume.isPublished) {
                await resumeService.unpublish(resume.id);
                toast.success("Резюме снято с публикации");
            } else {
                await resumeService.publish(resume.id);
                toast.success("Резюме опубликовано");
            }
            fetchResumes();
        } catch (error) {
            toast.error("Не удалось изменить статус публикации");
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== "JOB_SEEKER") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Мои резюме
                        </h1>
                        <p className="text-gray-600">
                            Управляйте резюме и откликайтесь на вакансии
                        </p>
                    </div>
                    <Link href="/jobseeker/resumes/create">
                        <Button className="shadow-md hover:shadow-lg transition-shadow">
                            <Plus className="h-4 w-4 mr-2" />
                            Создать резюме
                        </Button>
                    </Link>
                </motion.div>

                {resumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume, index) => (
                            <motion.div
                                key={resume.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover className="shadow-md hover:shadow-xl transition-all bg-white h-full">
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                        <CardTitle className="text-lg">{resume.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {resume.isPublished !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        resume.isPublished
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {resume.isPublished ? '✓ Опубликовано' : 'Не опубликовано'}
                                                    </span>
                                                </div>
                                            )}

                                            {resume.experienceYears !== undefined && resume.experienceYears !== null && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Опыт:</span> {resume.experienceYears} лет
                                                </p>
                                            )}

                                            {resume.contactEmail && (
                                                <p className="text-sm text-gray-600 truncate">
                                                    <span className="font-medium">Email:</span> {resume.contactEmail}
                                                </p>
                                            )}

                                            {resume.summary && (
                                                <p className="text-sm text-gray-700 line-clamp-3">
                                                    {resume.summary}
                                                </p>
                                            )}

                                            <div className="flex flex-col gap-2 pt-4 border-t">
                                                <div className="flex gap-2">
                                                    <Link href={`/jobseeker/resumes/${resume.id}`} className="flex-1">
                                                        <Button variant="outline" size="sm" className="w-full hover:bg-blue-50">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Просмотр
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/jobseeker/resumes/${resume.id}/edit`} className="flex-1">
                                                        <Button variant="outline" size="sm" className="w-full hover:bg-green-50">
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Редактировать
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleTogglePublish(resume)}
                                                        className="flex-1 hover:bg-blue-50"
                                                    >
                                                        {resume.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(resume.id)}
                                                        className="hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
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
                        <Card className="shadow-xl bg-white">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Пока нет резюме
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Создайте свое первое резюме, чтобы начать откликаться на вакансии
                                </p>
                                <Link href="/jobseeker/resumes/create">
                                    <Button className="shadow-md hover:shadow-lg transition-shadow">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Создать первое резюме
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