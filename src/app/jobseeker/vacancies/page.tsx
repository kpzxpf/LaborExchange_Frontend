'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService, applicationService } from '@/services/api';
import { VacancySearchResponse, VacancySearchRequest, SearchPageResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const EXPERIENCE_OPTIONS = [
    { label: 'Любой', value: '' },
    { label: 'Без опыта', value: '0-1' },
    { label: '1–3 года', value: '1-3' },
    { label: '3–5 лет', value: '3-5' },
    { label: '5+ лет', value: '5-100' },
];

export default function VacancySearchPage() {
    const { userId } = useAuth();
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [results, setResults] = useState<VacancySearchResponse[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const doSearch = useCallback(async (params: VacancySearchRequest) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchService.searchVacancies(params);
            setResults(Array.isArray(res.content) ? res.content : []);
            setTotalElements(res.totalElements ?? 0);
            setTotalPages(res.totalPages ?? 0);
            setPage(res.currentPage ?? 0);
            setSearched(true);
        } catch (err) {
            console.error('Vacancy search failed:', err);
            setError('Не удалось выполнить поиск. Попробуйте позже.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch({ page: 0, size: 10 });
    }, [doSearch]);

    const handleSearch = (p = 0) => {
        const params: VacancySearchRequest = {
            query: query || undefined,
            location: location || undefined,
            salaryMin: salaryMin ? Number(salaryMin) : undefined,
            salaryMax: salaryMax ? Number(salaryMax) : undefined,
            skills: selectedSkills.length ? selectedSkills : undefined,
            page: p,
            size: 10,
        };
        setPage(p);
        doSearch(params);
    };

    const addSkillFilter = () => {
        const t = skillInput.trim();
        if (t && !selectedSkills.includes(t)) setSelectedSkills([...selectedSkills, t]);
        setSkillInput('');
    };

    return (
        <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-blue-500/8 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 text-sm">⚡</div>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium tracking-wider uppercase">Поиск вакансий</span>
                    </div>
                    <h1 style={{ fontFamily: "'Space Mono', monospace" }} className="text-4xl font-bold">
                        Найдите <span className="text-blue-600 dark:text-blue-400">работу мечты</span>
                    </h1>
                    <p className="text-foreground/40 mt-2">Умный полнотекстовый поиск по всем вакансиям</p>
                </motion.div>

                {/* Search bar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30">🔍</span>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch(0)}
                            placeholder="Должность, ключевые слова..."
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40 focus:bg-foreground/[0.07] transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`px-5 py-4 rounded-2xl border transition-all ${filtersOpen ? 'bg-blue-500/20 border-blue-500/40 text-blue-500 dark:text-blue-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/20'}`}>
                        ⚙ Фильтры {selectedSkills.length + (salaryMin ? 1 : 0) + (location ? 1 : 0) > 0 &&
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                            {selectedSkills.length + (salaryMin ? 1 : 0) + (location ? 1 : 0)}
                        </span>}
                    </button>
                    <button
                        onClick={() => handleSearch(0)}
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-colors disabled:opacity-60">
                        {loading ? '...' : 'Найти'}
                    </button>
                </motion.div>

                {/* Filters panel */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-4">
                            <div className="p-5 bg-foreground/[0.03] border border-foreground/10 rounded-2xl space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Город</label>
                                        <input value={location} onChange={e => setLocation(e.target.value)}
                                               placeholder="Москва, Санкт-Петербург..."
                                               className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Зарплата от (₽)</label>
                                        <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
                                               placeholder="50 000"
                                               className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Зарплата до (₽)</label>
                                        <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
                                               placeholder="200 000"
                                               className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-foreground/40 mb-1 block">Навыки</label>
                                    <div className="flex gap-2 mb-2">
                                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                               onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillFilter(); } }}
                                               placeholder="React, Python, Docker..."
                                               className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40 transition-colors" />
                                        <button onClick={addSkillFilter}
                                                className="px-4 py-2 bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-500 dark:text-blue-400 text-sm hover:bg-blue-600/50 transition-colors">
                                            +
                                        </button>
                                    </div>
                                    {selectedSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSkills.map(s => (
                                                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full text-sm text-blue-600 dark:text-blue-300">
                                                    {s}
                                                    <button onClick={() => setSelectedSkills(selectedSkills.filter(x => x !== s))}
                                                            className="text-blue-400/60 hover:text-red-400 transition-colors">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Results */}
                {loading && (
                    <div className="flex flex-col gap-3 mt-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-foreground/[0.03] rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                )}

                {!loading && searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                        <p className="text-foreground/40 text-sm mb-4">
                            Найдено <span className="text-foreground/70 font-medium">{totalElements}</span> вакансий
                        </p>

                        {results.length === 0 ? (
                            <div className="text-center py-20 text-foreground/30">
                                <p className="text-5xl mb-4">🔭</p>
                                <p className="text-lg">Ничего не найдено</p>
                                <p className="text-sm mt-1">Попробуйте изменить запрос или фильтры</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {results.map((v, i) => (
                                        <motion.div key={v.id}
                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group p-5 bg-foreground/[0.03] border border-foreground/[0.08] hover:border-blue-500/30 hover:bg-foreground/5 rounded-2xl transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-semibold text-foreground group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors truncate">
                                                            {v.title}
                                                        </h3>
                                                        {v.salary && (
                                                            <span className="shrink-0 text-sm text-green-600 dark:text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full">
                                                                {v.salary.toLocaleString()} ₽
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-foreground/50 mb-1">{v.companyName}{v.location && ` · ${v.location}`}</p>
                                                    {v.description && (
                                                        <p className="text-sm text-foreground/40 line-clamp-2">{v.description}</p>
                                                    )}
                                                    {v.skills && v.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {v.skills.slice(0, 6).map(s => (
                                                                <span key={s} className="px-2 py-0.5 bg-foreground/5 rounded-md text-xs text-foreground/50">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {v.skills.length > 6 && (
                                                                <span className="px-2 py-0.5 text-xs text-foreground/30">+{v.skills.length - 6}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={`/jobseeker/vacancies/${v.id}`}
                                                      className="shrink-0 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-600/40 transition-colors">
                                                    Подробнее →
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <button onClick={() => handleSearch(page - 1)} disabled={page === 0}
                                                className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground/60 disabled:opacity-30 hover:border-foreground/20 transition-colors">
                                            ← Пред
                                        </button>
                                        <span className="text-sm text-foreground/40 px-4">
                                            {page + 1} / {totalPages}
                                        </span>
                                        <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages - 1}
                                                className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground/60 disabled:opacity-30 hover:border-foreground/20 transition-colors">
                                            След →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
