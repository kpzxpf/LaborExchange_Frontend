'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService } from '@/services/api';
import { ResumeSearchResponse, ResumeSearchRequest, SearchPageResponse } from '@/types';
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

    const handleSearch = async (p = 0) => {
        setLoading(true);
        try {
            const params: ResumeSearchRequest = {
                query: query || undefined,
                skills: selectedSkills.length ? selectedSkills : undefined,
                experienceYearsMin: expMin ? Number(expMin) : undefined,
                experienceYearsMax: expMax ? Number(expMax) : undefined,
                page: p,
                size: 10,
            };
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
    };

    const addSkill = () => {
        const t = skillInput.trim();
        if (t && !selectedSkills.includes(t)) setSelectedSkills([...selectedSkills, t]);
        setSkillInput('');
    };

    return (
        <div className="min-h-screen bg-[#080b0f]" style={{ fontFamily: "'Raleway', sans-serif", color: 'white' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-teal-500/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <span className="text-emerald-400/70 text-xs tracking-[0.3em] uppercase font-medium">Поиск кандидатов</span>
                    <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl font-bold mt-2 text-white">
                        Найдите идеального <em className="text-emerald-400 not-italic">кандидата</em>
                    </h1>
                    <p className="text-white/35 mt-2 text-sm">Полнотекстовый поиск по базе резюме с Elasticsearch</p>
                </motion.div>

                {/* Search + filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="p-5 bg-white/3 border border-white/8 rounded-2xl space-y-4 mb-6">
                    <div className="flex gap-3">
                        <input value={query} onChange={e => setQuery(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && handleSearch(0)}
                               placeholder="Должность, специализация, ключевые слова..."
                               className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 transition-colors" />
                        <button onClick={() => handleSearch(0)} disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-colors disabled:opacity-60">
                            {loading ? '...' : 'Найти'}
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-white/40 mb-1 block">Опыт от (лет)</label>
                            <input type="number" min={0} max={50} value={expMin} onChange={e => setExpMin(e.target.value)}
                                   placeholder="0"
                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs text-white/40 mb-1 block">Опыт до (лет)</label>
                            <input type="number" min={0} max={50} value={expMax} onChange={e => setExpMax(e.target.value)}
                                   placeholder="10"
                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs text-white/40 mb-1 block">Навыки (Enter для добавления)</label>
                            <div className="flex gap-2">
                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                       placeholder="React, Python..."
                                       className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors" />
                                <button onClick={addSkill} className="px-3 bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-600/50 transition-colors">+</button>
                            </div>
                        </div>
                    </div>

                    {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedSkills.map(s => (
                                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-sm text-emerald-300">
                  {s}
                                    <button onClick={() => setSelectedSkills(selectedSkills.filter(x => x !== s))}
                                            className="text-emerald-400/60 hover:text-red-400 transition-colors">×</button>
                </span>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Results */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-white/3 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                        ))}
                    </div>
                )}

                {!loading && searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-white/40 text-sm mb-4">
                            Найдено <span className="text-white/70 font-medium">{totalElements}</span> резюме
                        </p>

                        {results.length === 0 ? (
                            <div className="text-center py-20 text-white/25">
                                <p className="text-5xl mb-4">🔍</p>
                                <p className="text-lg">Резюме не найдены</p>
                                <p className="text-sm mt-1">Попробуйте другой запрос</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {results.map((r, i) => (
                                        <motion.div key={r.id}
                                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group p-5 bg-white/3 border border-white/8 hover:border-emerald-500/25 hover:bg-white/5 rounded-2xl transition-all">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                                            {r.title}
                                                        </h3>
                                                        {r.experienceYears !== undefined && (
                                                            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                {r.experienceYears} {r.experienceYears === 1 ? 'год' : r.experienceYears < 5 ? 'года' : 'лет'} опыта
                              </span>
                                                        )}
                                                    </div>
                                                    {r.summary && (
                                                        <p className="text-sm text-white/45 line-clamp-2 mb-2">{r.summary}</p>
                                                    )}
                                                    {r.institutions && r.institutions.length > 0 && (
                                                        <p className="text-xs text-white/30 mb-2">🎓 {r.institutions.join(', ')}</p>
                                                    )}
                                                    {r.skills && r.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {r.skills.slice(0, 8).map(s => (
                                                                <span key={s} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-400/70">
                                  {s}
                                </span>
                                                            ))}
                                                            {r.skills.length > 8 && <span className="text-xs text-white/25">+{r.skills.length - 8}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={`/employer/resumes/${r.id}`}
                                                      className="shrink-0 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm hover:bg-emerald-600/40 transition-colors">
                                                    Смотреть →
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <button onClick={() => handleSearch(page - 1)} disabled={page === 0}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 disabled:opacity-30 hover:border-white/20 transition-colors">
                                            ← Пред
                                        </button>
                                        <span className="text-sm text-white/40 px-4">{page + 1} / {totalPages}</span>
                                        <button onClick={() => handleSearch(page + 1)} disabled={page >= totalPages - 1}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 disabled:opacity-30 hover:border-white/20 transition-colors">
                                            След →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {!loading && !searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="text-center py-20 text-white/20">
                        <p className="text-6xl mb-4">📋</p>
                        <p className="text-lg">Введите запрос для поиска кандидатов</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}