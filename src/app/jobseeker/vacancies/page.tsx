'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService } from '@/services/api';
import { VacancySearchResponse, VacancySearchRequest, SearchPageResponse } from '@/types';
import Link from 'next/link';

function VacancySearchInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Init state from URL
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '');
    const [salaryMax, setSalaryMax] = useState(searchParams.get('salaryMax') || '');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(
        searchParams.get('skills') ? searchParams.get('skills')!.split(',').filter(Boolean) : []
    );
    const [skillInput, setSkillInput] = useState('');
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'RELEVANCE');
    const [results, setResults] = useState<VacancySearchResponse[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(Number(searchParams.get('page') || 0));
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

    // Initial search on mount using URL params
    useEffect(() => {
        const initSort = searchParams.get('sort') || 'RELEVANCE';
        const sortBy = initSort === 'DATE_ASC' ? 'DATE' : initSort === 'SALARY_ASC' ? 'SALARY' : initSort.replace('_ASC', '').replace('_DESC', '') || initSort;
        const sortOrder = initSort.endsWith('_ASC') ? 'ASC' : 'DESC';
        doSearch({
            query: searchParams.get('q') || undefined,
            location: searchParams.get('location') || undefined,
            salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
            salaryMax: searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined,
            skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',').filter(Boolean) : undefined,
            sortBy: ['RELEVANCE', 'DATE', 'SALARY'].includes(sortBy) ? sortBy : 'RELEVANCE',
            sortOrder,
            page: Number(searchParams.get('page') || 0),
            size: 10,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (p = 0) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (location) params.set('location', location);
        if (salaryMin) params.set('salaryMin', salaryMin);
        if (salaryMax) params.set('salaryMax', salaryMax);
        if (selectedSkills.length) params.set('skills', selectedSkills.join(','));
        if (sortOption !== 'RELEVANCE') params.set('sort', sortOption);
        if (p > 0) params.set('page', String(p));

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        setPage(p);

        const sortBy = sortOption.replace('_ASC', '').replace('_DESC', '') || sortOption;
        const sortOrder = sortOption.endsWith('_ASC') ? 'ASC' : 'DESC';

        doSearch({
            query: query || undefined,
            location: location || undefined,
            salaryMin: salaryMin ? Number(salaryMin) : undefined,
            salaryMax: salaryMax ? Number(salaryMax) : undefined,
            skills: selectedSkills.length ? selectedSkills : undefined,
            sortBy: ['RELEVANCE', 'DATE', 'SALARY'].includes(sortBy) ? sortBy : 'RELEVANCE',
            sortOrder,
            page: p,
            size: 10,
        });
    };

    const addSkillFilter = () => {
        const t = skillInput.trim();
        if (t && !selectedSkills.includes(t)) setSelectedSkills([...selectedSkills, t]);
        setSkillInput('');
    };

    const activeFilterCount = selectedSkills.length + (salaryMin || salaryMax ? 1 : 0) + (location ? 1 : 0);

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{ background: "radial-gradient(circle, rgb(99,102,241), transparent)" }} />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ background: "rgba(99,102,241,0.2)", color: "var(--badge-indigo-color)" }}>⚡</div>
                        <span className="text-sm font-medium tracking-wider uppercase" style={{ color: "var(--badge-indigo-color)" }}>Поиск вакансий</span>
                    </div>
                    <h1 className="text-4xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                        Найдите <span className="gradient-text">работу мечты</span>
                    </h1>
                    <p className="mt-2" style={{ color: "rgb(var(--text-3))" }}>Умный полнотекстовый поиск по всем вакансиям</p>
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
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 focus:bg-foreground/[0.07] transition-all"
                        />
                    </div>
                    <select
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
                        className="px-4 py-4 border border-foreground/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/40 transition-colors cursor-pointer"
                        style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}
                    >
                        <option value="RELEVANCE">По релевантности</option>
                        <option value="DATE">По дате (нов.)</option>
                        <option value="DATE_ASC">По дате (стар.)</option>
                        <option value="SALARY">По зарплате (убыв.)</option>
                        <option value="SALARY_ASC">По зарплате (возр.)</option>
                    </select>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`px-5 py-4 rounded-2xl border transition-all ${filtersOpen ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/20'}`}>
                        ⚙ Фильтры{activeFilterCount > 0 &&
                            <span className="ml-1 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                                {activeFilterCount}
                            </span>}
                    </button>
                    <button
                        onClick={() => handleSearch(0)}
                        disabled={loading}
                        className="px-8 py-4 btn-primary rounded-2xl font-semibold transition-colors disabled:opacity-60">
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
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Зарплата от (₽)</label>
                                        <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
                                            placeholder="50 000"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-foreground/40 mb-1 block">Зарплата до (₽)</label>
                                        <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
                                            placeholder="200 000"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-foreground/40 mb-1 block">Навыки</label>
                                    <div className="flex gap-2 mb-2">
                                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillFilter(); } }}
                                            placeholder="React, Python, Docker..."
                                            className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                                        <button onClick={addSkillFilter}
                                            className="px-4 py-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-400 text-sm hover:bg-indigo-600/50 transition-colors">
                                            +
                                        </button>
                                    </div>
                                    {selectedSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSkills.map(s => (
                                                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-sm text-indigo-300">
                                                    {s}
                                                    <button onClick={() => setSelectedSkills(selectedSkills.filter(x => x !== s))}
                                                        className="text-indigo-400/60 hover:text-red-400 transition-colors">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={() => {
                                            setLocation('');
                                            setSalaryMin('');
                                            setSalaryMax('');
                                            setSelectedSkills([]);
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                        Сбросить фильтры
                                    </button>
                                )}
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

                {/* Skeleton */}
                {loading && (
                    <div className="flex flex-col gap-3 mt-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card p-5 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="skeleton h-5 w-2/3 rounded-lg" />
                                        <div className="skeleton h-4 w-1/3 rounded-lg" />
                                        <div className="skeleton h-4 w-full rounded-lg" />
                                        <div className="flex gap-2 mt-2">
                                            <div className="skeleton h-5 w-16 rounded-full" />
                                            <div className="skeleton h-5 w-20 rounded-full" />
                                            <div className="skeleton h-5 w-14 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="skeleton h-9 w-28 rounded-xl shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                        <p className="text-foreground/40 text-sm mb-4">
                            Найдено <span className="text-foreground/70 font-medium">{totalElements}</span> вакансий
                        </p>

                        {results.length === 0 ? (
                            <div className="text-center py-20" style={{ color: "rgb(var(--text-3))" }}>
                                <p className="text-5xl mb-4">🔭</p>
                                <p className="text-lg font-medium" style={{ color: "rgb(var(--text-2))" }}>Ничего не найдено</p>
                                <p className="text-sm mt-1">Попробуйте изменить запрос или фильтры</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {results.map((v, i) => (
                                        <motion.div key={v.id}
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ y: -2 }}
                                            className="card p-5 group cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="font-semibold transition-colors truncate"
                                                            style={{ color: "rgb(var(--text-1))" }}>
                                                            {v.title}
                                                        </h3>
                                                        {v.salary && (
                                                            <span className="badge badge-emerald shrink-0 text-sm px-2.5 py-0.5">
                                                                {v.salary.toLocaleString()} ₽
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm mb-2" style={{ color: "rgb(var(--text-3))" }}>
                                                        {v.companyName}{v.location && ` · ${v.location}`}
                                                    </p>
                                                    {v.description && (
                                                        <p className="text-sm line-clamp-2 mb-3" style={{ color: "rgb(var(--text-3))" }}>
                                                            {v.description}
                                                        </p>
                                                    )}
                                                    {v.skills && v.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {v.skills.slice(0, 6).map(s => (
                                                                <span key={s} className="badge badge-indigo text-xs px-2 py-0.5">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {v.skills.length > 6 && (
                                                                <span className="text-xs px-2 py-0.5" style={{ color: "rgb(var(--text-3))" }}>
                                                                    +{v.skills.length - 6}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={`/jobseeker/vacancies/${v.id}`}
                                                    className="btn-secondary shrink-0 px-4 py-2 text-sm">
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
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                const p = totalPages <= 7 ? i : (page <= 3 ? i : page - 3 + i);
                                                if (p >= totalPages) return null;
                                                return (
                                                    <button key={p} onClick={() => handleSearch(p)}
                                                        className="w-9 h-9 rounded-xl text-sm transition-colors"
                                                        style={p === page ? {
                                                            background: "rgb(99,102,241)",
                                                            color: "#fff",
                                                        } : {
                                                            background: "rgba(255,255,255,0.04)",
                                                            color: "rgb(var(--text-3))",
                                                        }}>
                                                        {p + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
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

export default function VacancySearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
                <div className="space-y-3 w-full max-w-2xl px-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
                </div>
            </div>
        }>
            <VacancySearchInner />
        </Suspense>
    );
}
