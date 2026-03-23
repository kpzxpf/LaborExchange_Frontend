"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { searchService } from "@/services/api";
import { VacancySearchResponse } from "@/types";

const EMPLOYER_NAV = [
    { label: "Панель работодателя", href: "/employer/dashboard", icon: "🏢" },
    { label: "Мои вакансии", href: "/employer/vacancies", icon: "📋" },
    { label: "Создать вакансию", href: "/employer/vacancies/create", icon: "➕" },
    { label: "Поиск кандидатов", href: "/employer/resumes", icon: "🔍" },
    { label: "Отклики", href: "/employer/applications", icon: "📥" },
    { label: "Профиль", href: "/employer/profile", icon: "👤" },
];

const JOBSEEKER_NAV = [
    { label: "Моя панель", href: "/jobseeker/dashboard", icon: "🏠" },
    { label: "Поиск вакансий", href: "/jobseeker/vacancies", icon: "🔍" },
    { label: "Мои резюме", href: "/jobseeker/resumes", icon: "📄" },
    { label: "Создать резюме", href: "/jobseeker/resumes/create", icon: "➕" },
    { label: "Мои заявки", href: "/jobseeker/applications", icon: "📋" },
    { label: "Профиль", href: "/jobseeker/profile", icon: "👤" },
];

type NavItem = { label: string; href: string; icon: string; type: "nav" };
type VacancyItem = { label: string; href: string; icon: string; type: "vacancy"; sub: string };
type Item = NavItem | VacancyItem;

export default function CommandPalette() {
    const { open, setOpen } = useCommandPalette();
    const { userRole, isAuthenticated } = useAuth();
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [vacancies, setVacancies] = useState<VacancySearchResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navBase = userRole === "EMPLOYER" ? EMPLOYER_NAV : JOBSEEKER_NAV;
    const filteredNav: Item[] = (
        query.trim()
            ? navBase.filter(n => n.label.toLowerCase().includes(query.toLowerCase()))
            : navBase
    ).map(n => ({ ...n, type: "nav" as const }));

    const vacancyItems: Item[] = vacancies.map(v => ({
        label: v.title,
        href: `/jobseeker/vacancies/${v.id}`,
        icon: "💼",
        type: "vacancy" as const,
        sub: v.companyName,
    }));

    const allItems: Item[] = [...filteredNav, ...vacancyItems];

    // Global keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === "Escape" && open) setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, setOpen]);

    // Reset + focus on open
    useEffect(() => {
        if (open) {
            setQuery("");
            setVacancies([]);
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 40);
        }
    }, [open]);

    // Debounced vacancy search
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!query.trim() || query.length < 2) {
            setVacancies([]);
            return;
        }
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchService.searchVacancies({ query, size: 5 });
                setVacancies(res.content ?? []);
            } catch {
                setVacancies([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [query]);

    useEffect(() => { setSelectedIdx(0); }, [query, vacancies.length]);

    const navigate = (item: Item) => {
        router.push(item.href);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allItems.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
        if (e.key === "Enter" && allItems[selectedIdx]) navigate(allItems[selectedIdx]);
    };

    if (!isAuthenticated) return null;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-start justify-center pt-[14vh] px-4"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -12 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: "rgb(var(--card-bg))", border: "1px solid var(--card-border)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <Search className="w-4 h-4 shrink-0" style={{ color: "rgb(var(--text-3))" }} />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Навигация или поиск вакансий..."
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{ color: "rgb(var(--text-1))" }}
                            />
                            {loading && (
                                <span className="text-xs animate-pulse" style={{ color: "rgb(var(--text-3))" }}>поиск...</span>
                            )}
                            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-xs"
                                style={{ background: "rgba(99,102,241,0.1)", color: "rgb(99,102,241)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                Esc
                            </kbd>
                        </div>

                        {/* Items list */}
                        <div className="max-h-[340px] overflow-y-auto py-1.5">
                            {allItems.length === 0 && (
                                <p className="text-sm text-center py-10" style={{ color: "rgb(var(--text-3))" }}>
                                    {query.length >= 2 ? "Ничего не найдено" : "Начните вводить для поиска..."}
                                </p>
                            )}

                            {filteredNav.length > 0 && (
                                <>
                                    {query.trim() === "" && (
                                        <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "rgb(var(--text-3))" }}>
                                            Навигация
                                        </p>
                                    )}
                                    {filteredNav.map((item, i) => (
                                        <button
                                            key={item.href}
                                            onClick={() => navigate(item)}
                                            onMouseEnter={() => setSelectedIdx(i)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                                            style={i === selectedIdx ? {
                                                background: "rgba(99,102,241,0.08)",
                                                color: "rgb(99,102,241)",
                                            } : { color: "rgb(var(--text-2))" }}
                                        >
                                            <span className="text-base w-5 text-center">{item.icon}</span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <span className="ml-auto text-xs" style={{ color: "rgb(var(--text-3))" }}>↵</span>
                                        </button>
                                    ))}
                                </>
                            )}

                            {vacancyItems.length > 0 && (
                                <>
                                    <div className="mx-4 my-1" style={{ height: "1px", background: "var(--card-border)" }} />
                                    <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "rgb(var(--text-3))" }}>
                                        Вакансии
                                    </p>
                                    {vacancyItems.map((item, i) => {
                                        const idx = filteredNav.length + i;
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => navigate(item)}
                                                onMouseEnter={() => setSelectedIdx(idx)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                                                style={idx === selectedIdx ? {
                                                    background: "rgba(99,102,241,0.08)",
                                                    color: "rgb(99,102,241)",
                                                } : { color: "rgb(var(--text-2))" }}
                                            >
                                                <span className="text-base w-5 text-center">{item.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                                    {"sub" in item && (
                                                        <p className="text-xs truncate" style={{ color: "rgb(var(--text-3))" }}>{item.sub}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs shrink-0" style={{ color: "rgb(var(--text-3))" }}>Вакансия</span>
                                            </button>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Footer hints */}
                        <div className="flex items-center gap-4 px-4 py-2.5"
                            style={{ borderTop: "1px solid var(--card-border)" }}>
                            {[["↑↓", "выбор"], ["Enter", "открыть"], ["Esc", "закрыть"]].map(([key, label]) => (
                                <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--text-3))" }}>
                                    <kbd className="px-1.5 py-0.5 rounded text-xs"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)", fontFamily: "monospace" }}>
                                        {key}
                                    </kbd>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
