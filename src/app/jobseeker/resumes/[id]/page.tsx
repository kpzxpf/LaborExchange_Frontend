"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Award, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { resumeService, educationService, skillService } from "@/services/api";
import type { ResumeDto, EducationDto, SkillDto } from "@/types";
import toast from "react-hot-toast";

export default function ViewResumePage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, userRole, loading } = useAuth();
    const [resume, setResume] = useState<ResumeDto | null>(null);
    const [education, setEducation] = useState<EducationDto[]>([]);
    const [skills, setSkills] = useState<SkillDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        if (params.id) {
            fetchResumeData();
        }
    }, [params.id, isAuthenticated, loading, router]);

    const fetchResumeData = async () => {
        setIsLoading(true);
        try {
            const resumeId = Number(params.id);

            const [resumeData, educationData, skillsData] = await Promise.all([
                resumeService.getById(resumeId),
                educationService.getByResume(resumeId),
                skillService.getByResume(resumeId),
            ]);

            setResume(resumeData);
            setEducation(educationData);
            setSkills(skillsData);
        } catch (error) {
            toast.error("Failed to load resume");
            router.push("/jobseeker/resumes");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!resume) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <Link href="/jobseeker/resumes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Resumes
                        </Button>
                    </Link>

                    {userRole === "JOB_SEEKER" && (
                        <Link href={`/jobseeker/resumes/${resume.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Resume
                            </Button>
                        </Link>
                    )}
                </motion.div>

                {/* Resume Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6">
                        <CardContent className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {resume.title}
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {resume.contactEmail && (
                                    <div className="flex items-center text-gray-700">
                                        <Mail className="h-5 w-5 mr-3 text-primary-600" />
                                        <span>{resume.contactEmail}</span>
                                    </div>
                                )}

                                {resume.contactPhone && (
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="h-5 w-5 mr-3 text-primary-600" />
                                        <span>{resume.contactPhone}</span>
                                    </div>
                                )}

                                {resume.experienceYears !== undefined && (
                                    <div className="flex items-center text-gray-700">
                                        <Calendar className="h-5 w-5 mr-3 text-primary-600" />
                                        <span>{resume.experienceYears} years of experience</span>
                                    </div>
                                )}
                            </div>

                            {resume.summary && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Professional Summary
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {resume.summary}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Education */}
                {education.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center">
                                    <GraduationCap className="h-6 w-6 text-primary-600 mr-3" />
                                    <CardTitle>Education</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {education.map((edu, index) => (
                                        <div
                                            key={edu.id || index}
                                            className={index !== 0 ? "pt-6 border-t" : ""}
                                        >
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {edu.degree}
                                            </h4>
                                            <p className="text-primary-600 font-medium mt-1">
                                                {edu.institution}
                                            </p>
                                            <p className="text-gray-600 mt-1">
                                                {edu.fieldOfStudy}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {edu.startYear} - {edu.endYear || "Present"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center">
                                    <Award className="h-6 w-6 text-primary-600 mr-3" />
                                    <CardTitle>Skills</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
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