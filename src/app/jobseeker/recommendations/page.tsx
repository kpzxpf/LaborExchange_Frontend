"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, MapPin, Briefcase, ChevronLeft, ChevronRight, SlidersHorizontal, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resumeService, skillService, searchService } from "@/services/api";
import { VacancySearchResponse } from "@/types";
import { toast } from "sonner";

function SkillBadge({ name }: { name: string }) {
    return (
        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.1)", color: "rgb(99,102,241)", border: "1px solid rgba(99,102,241,0.15)" }}>
            {name}
        </span>
    );
}

function VacancyCard({ vacancy, index, userSkills }: { vacancy: VacancySearchResponse; index: number; userSkills: Set<string> }) {
    const matchCount = vacancy.skills?.filter(s => userSkills.has(s.toLowerCase())).length ?? 0;
    const totalSkills = vacancy.skills?.length ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
        >
            <Link href={`/jobseeker/vacancies/${vacancy.id}`}>
                <div className="card p-5 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{ borderColor: matchCount > 0 ? "rgba(99,102,241,0.3)" : undefined }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{vacancy.title}</h3>
                            <p className="text-sm mt-0.5 font-medium" style={{ color: "rgb(99,102,241)" }}>
                                {vacancy.companyName}
                            </p>
                        </div>
                        {totalSkills > 0 && (
                            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    background: matchCount > 0 ? "rgba(99,102,241,0.1)" : "rgba(var(--text-3),0.08)",
                                    color: matchCount > 0 ? "rgb(99,102,241)" : "rgb(var(--text-3))",
                                    border: matchCount > 0 ? "1px solid rgba(99,102,241,0.2)" : undefined,
                                }}>
                                <Sparkles className="w-3 h-3" />
                                {matchCount}/{totalSkills}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {vacancy.skills?.slice(0, 6).map(skill => (
                            <span key={skill}
                                className="px-2 py-0.5 rounded-md text-xs font-medium"
                                style={{
                                    background: userSkills.has(skill.toLowerCase())
                                        ? "rgba(99,102,241,0.15)" : "rgba(var(--text-3),0.08)",
                                    color: userSkills.has(skill.toLowerCase())
                                        ? "rgb(99,102,241)" : "rgb(var(--text-2))",
                                    border: userSkills.has(skill.toLowerCase())
                                        ? "1px solid rgba(99,102,241,0.2)" : undefined,
                                }}>
                                {skill}
                            </span>
                        ))}
                        {(vacancy.skills?.length ?? 0) > 6 && (
                            <span className="px-2 py-0.5 rounded-md text-xs" style={{ color: "rgb(var(--text-3))" }}>
                                +{vacancy.skills!.length - 6}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs" style={{ color: "rgb(var(--text-3))" }}>
                        {vacancy.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {vacancy.location}
                            </span>
                        )}
                        {vacancy.salary && (
                            <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {vacancy.salary.toLocaleString()} ₽
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function RecommendationsPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [userSkillNames, setUserSkillNames] = useState<string[]>([]);
    const [userSkillSet, setUserSkillSet] = useState<Set<string>>(new Set());
    const [vacancies, setVacancies] = useState<VacancySearchResponse[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [location, setLocation] = useState("");
    const [salaryMin, setSalaryMin] = useState("");
    const [hasResume, setHasResume] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push("/auth/login");
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) loadSkillsAndRecommend(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const loadSkillsAndRecommend = async (p: number) => {
        setLoading(true);
        try {
            const resumes = await resumeService.getMy();
            if (!resumes.length) {
                setHasResume(false);
                setLoading(false);
                return;
            }
            // Collect unique skills from all resumes
            const allSkillArrays = await Promise.all(resumes.map(r => skillService.getSkillsForResume(r.id!)));
            const uniqueSkills = [...new Map(allSkillArrays.flat().map(s => [s.id, s])).values()];
            const skillNames = uniqueSkills.map(s => s.name);

            setUserSkillNames(skillNames);
            setUserSkillSet(new Set(skillNames.map(n => n.toLowerCase())));

            if (!skillNames.length) {
                setVacancies([]);
                setLoading(false);
                return;
            }

            await fetchRecommendations(skillNames, location, salaryMin ? Number(salaryMin) : undefined, p);
        } catch {
            toast.error("Не удалось загрузить рекомендации");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (skills: string[], loc: string, salary: number | undefined, p: number) => {
        const res = await searchService.getRecommendations(skills, loc || undefined, salary, p);
        setVacancies(res.content ?? []);
        setTotalElements(res.totalElements ?? 0);
        setTotalPages(res.totalPages ?? 0);
        setPage(res.currentPage ?? p);
    };

    const handleApplyFilters = async () => {
        setLoading(true);
        try {
            await fetchRecommendations(userSkillNames, location, salaryMin ? Number(salaryMin) : undefined, 0);
        } catch {
            toast.error("Не удалось применить фильтры");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setLoading(true);
        try {
            await fetchRecommendations(userSkillNames, location, salaryMin ? Number(salaryMin) : undefined, newPage);
        } catch {
            toast.error("Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                Для вас
                            </h1>
                            <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                                Вакансии подобраны по навыкам из ваших резюме
                            </p>
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="btn-ghost flex items-center gap-2 text-sm"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Фильтры
                        </button>
                    </div>

                    {/* Skills chips */}
                    {userSkillNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {userSkillNames.slice(0, 12).map(s => <SkillBadge key={s} name={s} />)}
                            {userSkillNames.length > 12 && (
                                <span className="text-xs px-2 py-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                    +{userSkillNames.length - 12}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Filters */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} className="card p-4 mb-5 overflow-hidden">
                            <div className="flex items-center gap-3 flex-wrap">
                                <input
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    placeholder="Город"
                                    className="input-field flex-1 min-w-[140px]"
                                />
                                <input
                                    value={salaryMin}
                                    onChange={e => setSalaryMin(e.target.value)}
                                    placeholder="Зарплата от"
                                    type="number"
                                    min={0}
                                    className="input-field flex-1 min-w-[140px]"
                                />
                                <button onClick={handleApplyFilters} className="btn-primary text-sm px-4 py-2">
                                    Применить
                                </button>
                                {(location || salaryMin) && (
                                    <button onClick={() => { setLocation(""); setSalaryMin(""); handleApplyFilters(); }}
                                        className="btn-ghost text-sm flex items-center gap-1">
                                        <X className="w-3.5 h-3.5" /> Сбросить
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No resume */}
                {!hasResume && !loading && (
                    <div className="card p-8 text-center">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="font-medium mb-1">Нет резюме</p>
                        <p className="text-sm mb-4" style={{ color: "rgb(var(--text-3))" }}>
                            Создайте резюме с навыками, чтобы получать персональные рекомендации
                        </p>
                        <Link href="/jobseeker/resumes/create">
                            <button className="btn-primary text-sm">Создать резюме</button>
                        </Link>
                    </div>
                )}

                {/* No skills */}
                {hasResume && !loading && userSkillNames.length === 0 && (
                    <div className="card p-8 text-center">
                        <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--text-3))" }} />
                        <p className="font-medium mb-1">Добавьте навыки</p>
                        <p className="text-sm mb-4" style={{ color: "rgb(var(--text-3))" }}>
                            Добавьте навыки в резюме, чтобы получать подходящие вакансии
                        </p>
                        <Link href="/jobseeker/resumes">
                            <button className="btn-secondary text-sm">Мои резюме</button>
                        </Link>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="card p-5">
                                <div className="skeleton h-5 w-1/2 rounded-lg mb-2" />
                                <div className="skeleton h-4 w-1/3 rounded-lg mb-3" />
                                <div className="flex gap-2">
                                    {[...Array(4)].map((_, j) => <div key={j} className="skeleton h-5 w-16 rounded-md" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && vacancies.length > 0 && (
                    <>
                        <p className="text-sm mb-4" style={{ color: "rgb(var(--text-3))" }}>
                            Найдено: {totalElements} вакансий
                        </p>
                        <div className="space-y-3">
                            {vacancies.map((v, i) => (
                                <VacancyCard key={v.id} vacancy={v} index={i} userSkills={userSkillSet} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    disabled={page === 0}
                                    onClick={() => handlePageChange(page - 1)}
                                    className="btn-ghost p-2 rounded-lg disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm px-3" style={{ color: "rgb(var(--text-2))" }}>
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    disabled={page + 1 >= totalPages}
                                    onClick={() => handlePageChange(page + 1)}
                                    className="btn-ghost p-2 rounded-lg disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No results */}
                {!loading && hasResume && userSkillNames.length > 0 && vacancies.length === 0 && (
                    <div className="card p-8 text-center">
                        <p className="font-medium mb-1">Ничего не найдено</p>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            По вашим навыкам вакансии не найдены. Попробуйте сбросить фильтры.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
