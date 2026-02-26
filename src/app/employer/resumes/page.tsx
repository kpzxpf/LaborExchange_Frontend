'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService } from '@/services/api';
import { ResumeSearchResponse, ResumeSearchRequest } from '@/types';
import Link from 'next/link';

export default function ResumeSearchPage() {
    const [query, setQuery] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [expMin, setExpMin] = useState('');
    const [expMax, setExpMax] = useState('');
    const [results, setResults] = useState<ResumeSearchResponse[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const doSearch = useCallback(async (params: ResumeSearchRequest) => {
        setLoading(true);
        try {
            const res = await searchService.searchResumes(params);
            setResults(res.content);
            setTotalElements(res.totalElements);
            setTotalPages(res.totalPages);
            setPage(res.currentPage);
            setSearched(true);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch({ page: 0, size: 10 });
    }, [doSearch]);

    const handleSearch = (p = 0) => {
        const params: ResumeSearchRequest = {
            query: query || undefined,
            skills: selectedSkills.length ? selectedSkills : undefined,
            experienceYearsMin: expMin ? Number(expMin) : undefined,
            experienceYearsMax: expMax ? Number(expMax) : undefined,
            page: p,
            size: 10,
        };
        setPage(p);
        doSearch(params);
    };

    const addSkill = () => {
        const t = skillInput.trim();
        if (t && !selectedSkills.includes(t)) setSelectedSkills([...selectedSkills, t]);
        setSkillInput('');
    };

    const activeFiltersCount =
        selectedSkills.length + (expMin ? 1 : 0) + (expMax ? 1 : 0);

    return (
        <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-violet-500/8 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 text-sm">👤</div>
                        <span className="text-violet-600 dark:text-violet-400 text-sm font-medium tracking-wider uppercase">Поиск кандидатов</span>
                    </div>
                    <h1 style={{ fontFamily: "'Space Mono', monospace" }} className="text-4xl font-bold">
                        Найдите <span className="text-violet-600 dark:text-violet-400">нужного кандидата</span>
                    </h1>
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
                            placeholder="Должность, специализация, ключевые слова..."
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-violet-500/40 focus:bg-foreground/[0.07] transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`px-5 py-4 rounded-2xl border transition-all ${filtersOpen ? 'bg-violet-500/20 border-violet-500/40 text-violet-500 dark:text-violet-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/20'}`}
                    >
                        ⚙ Фильтры{activeFiltersCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-violet-500 text-white text-xs rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleSearch(0)}
                        disabled={loading}
                        className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-semibold transition-colors disabled:opacity-60"
                    >
                        {loading ? '...' : 'Найти'}
                    </button>
                </motion.div>

                {/* Filters panel */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="p-5 bg-foreground/[0.03] border border-foreground/10 rounded-2xl space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Опыт от (лет)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={50}
                                            value={expMin}
                                            onChange={e => setExpMin(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-violet-500/40 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Опыт до (лет)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={50}
                                            value={expMax}
                                            onChange={e => setExpMax(e.target.value)}
                                            placeholder="10"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-violet-500/40 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Навыки</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={skillInput}
                                                onChange={e => setSkillInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                                placeholder="React, Python..."
                                                className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-violet-500/40 transition-colors"
                                            />
                                            <button
                                                onClick={addSkill}
                                                className="px-4 py-2 bg-violet-600/30 border border-violet-500/30 rounded-xl text-violet-500 dark:text-violet-400 text-sm hover:bg-violet-600/50 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {selectedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.map(s => (
                                            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/15 border border-violet-500/30 rounded-full text-sm text-violet-600 dark:text-violet-300">
                                                {s}
                                                <button
                                                    onClick={() => setSelectedSkills(selectedSkills.filter(x => x !== s))}
                                                    className="text-violet-400/60 hover:text-red-400 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Skeleton */}
                {loading && (
                    <div className="flex flex-col gap-3 mt-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-foreground/[0.03] rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                        <p className="text-foreground/40 text-sm mb-4">
                            Найдено <span className="text-foreground/70 font-medium">{totalElements}</span> резюме
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
                                    {results.map((r, i) => (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group p-5 bg-foreground/[0.03] border border-foreground/[0.08] hover:border-violet-500/30 hover:bg-foreground/5 rounded-2xl transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-semibold text-foreground group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors truncate">
                                                            {r.title}
                                                        </h3>
                                                        {r.experienceYears !== undefined && (
                                                            <span className="shrink-0 text-sm text-foreground/50 bg-foreground/5 px-2.5 py-0.5 rounded-full">
                                                                {r.experienceYears} {r.experienceYears === 1 ? 'год' : r.experienceYears < 5 ? 'года' : 'лет'} опыта
                                                            </span>
                                                        )}
                                                    </div>

                                                    {r.summary && (
                                                        <p className="text-sm text-foreground/50 line-clamp-2 mb-2">{r.summary}</p>
                                                    )}

                                                    {r.institutions && r.institutions.length > 0 && (
                                                        <p className="text-xs text-foreground/35 mb-2">
                                                            🎓 {r.institutions.join(', ')}
                                                        </p>
                                                    )}

                                                    {r.skills && r.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {r.skills.slice(0, 8).map(s => (
                                                                <span key={s} className="px-2 py-0.5 bg-foreground/5 rounded-md text-xs text-foreground/50">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {r.skills.length > 8 && (
                                                                <span className="px-2 py-0.5 text-xs text-foreground/30">+{r.skills.length - 8}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/employer/resumes/${r.id}`}
                                                    className="shrink-0 px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-xl text-violet-600 dark:text-violet-400 text-sm hover:bg-violet-600/40 transition-colors"
                                                >
                                                    Подробнее →
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <button
                                            onClick={() => handleSearch(page - 1)}
                                            disabled={page === 0}
                                            className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground/60 disabled:opacity-30 hover:border-foreground/20 transition-colors"
                                        >
                                            ← Пред
                                        </button>
                                        <span className="text-sm text-foreground/40 px-4">
                                            {page + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handleSearch(page + 1)}
                                            disabled={page >= totalPages - 1}
                                            className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground/60 disabled:opacity-30 hover:border-foreground/20 transition-colors"
                                        >
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
