"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ReferenceLine, Cell,
} from "recharts";
import {
    TrendingUp, Search, DollarSign, BarChart2,
    Users, ArrowUp, ArrowDown, Minus, Info, X,
} from "lucide-react";
import { statsService } from "@/services/api";
import { SalaryStatsDto } from "@/types";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = [
    { value: "", label: "Любой тип занятости" },
    { value: "FULL_TIME", label: "Полная занятость" },
    { value: "PART_TIME", label: "Частичная занятость" },
    { value: "CONTRACT", label: "Контракт" },
    { value: "INTERNSHIP", label: "Стажировка" },
    { value: "REMOTE", label: "Удалённо" },
];

const POPULAR = [
    { title: "Python разработчик", location: "Москва" },
    { title: "Java разработчик", location: "" },
    { title: "Frontend разработчик", location: "" },
    { title: "Data Scientist", location: "Санкт-Петербург" },
    { title: "DevOps инженер", location: "" },
    { title: "Product Manager", location: "Москва" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
    if (n == null) return "—";
    return new Intl.NumberFormat("ru-RU", {
        style: "currency", currency: "RUB", maximumFractionDigits: 0,
    }).format(n);
}

function fmtShort(n: number | null | undefined) {
    if (n == null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₽`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K ₽`;
    return `${n} ₽`;
}

function diffPct(a: number | null, b: number | null): string | null {
    if (a == null || b == null || b === 0) return null;
    const d = Math.round(((a - b) / b) * 100);
    return d > 0 ? `+${d}%` : `${d}%`;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2 text-xs shadow-xl" style={{ minWidth: 140 }}>
            <p className="font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.fill ?? p.color }}>
                    {p.name}: <span className="font-bold">{fmt(p.value)}</span>
                </p>
            ))}
        </div>
    );
};

// ─── Box-plot bar (SVG) ───────────────────────────────────────────────────────

function BoxPlot({ stats }: { stats: SalaryStatsDto }) {
    const { minSalary: min, p25Salary: p25, medianSalary: med, p75Salary: p75, maxSalary: max } = stats;
    if (min == null || max == null || max === min) return null;
    const range = max - min;
    const pct = (v: number | null) => v == null ? 0 : ((v - min) / range) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs" style={{ color: "rgb(var(--text-3))" }}>
                <span>{fmtShort(min)}</span>
                <span className="font-semibold" style={{ color: "rgb(var(--text-1))" }}>Диапазон зарплат</span>
                <span>{fmtShort(max)}</span>
            </div>
            <div className="relative h-10 rounded-xl overflow-hidden" style={{ background: "rgba(99,102,241,0.06)" }}>
                {/* IQR box (P25–P75) */}
                <div
                    className="absolute top-0 bottom-0 rounded-lg"
                    style={{
                        left: `${pct(p25)}%`,
                        width: `${pct(p75) - pct(p25)}%`,
                        background: "rgba(99,102,241,0.25)",
                        border: "1px solid rgba(99,102,241,0.4)",
                    }}
                />
                {/* Median line */}
                {med != null && (
                    <div
                        className="absolute top-1 bottom-1 w-0.5 rounded-full"
                        style={{ left: `${pct(med)}%`, background: "rgb(99,102,241)" }}
                    />
                )}
                {/* Whiskers */}
                <div
                    className="absolute top-1/2 h-0.5 rounded-full"
                    style={{
                        left: `${pct(min)}%`,
                        width: `${pct(p25) - pct(min)}%`,
                        background: "rgba(99,102,241,0.35)",
                        transform: "translateY(-50%)",
                    }}
                />
                <div
                    className="absolute top-1/2 h-0.5 rounded-full"
                    style={{
                        left: `${pct(p75)}%`,
                        width: `${pct(max) - pct(p75)}%`,
                        background: "rgba(99,102,241,0.35)",
                        transform: "translateY(-50%)",
                    }}
                />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "rgb(var(--text-3))" }}>
                <span>P25: <b style={{ color: "rgb(var(--text-2))" }}>{fmtShort(p25)}</b></span>
                <span>Медиана: <b style={{ color: "rgb(99,102,241)" }}>{fmtShort(med)}</b></span>
                <span>P75: <b style={{ color: "rgb(var(--text-2))" }}>{fmtShort(p75)}</b></span>
            </div>
        </div>
    );
}

// ─── Insight chips ────────────────────────────────────────────────────────────

function Insights({ stats }: { stats: SalaryStatsDto }) {
    const insights: { icon: React.ReactNode; text: string; color: string }[] = [];

    if (stats.medianSalary != null && stats.averageSalary != null) {
        const diff = stats.averageSalary - stats.medianSalary;
        if (Math.abs(diff) > stats.medianSalary * 0.1) {
            insights.push({
                icon: diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />,
                text: diff > 0
                    ? `Среднее выше медианы на ${fmtShort(diff)} — рынок смещён вверх высокими офферами`
                    : `Среднее ниже медианы — большинство предложений выше среднего`,
                color: diff > 0 ? "rgb(251,146,60)" : "rgb(34,197,94)",
            });
        } else {
            insights.push({
                icon: <Minus className="w-3 h-3" />,
                text: "Среднее и медиана близки — рынок равномерный",
                color: "rgb(99,102,241)",
            });
        }
    }

    if (stats.p25Salary != null && stats.p75Salary != null && stats.p25Salary > 0) {
        const spread = Math.round(((stats.p75Salary - stats.p25Salary) / stats.p25Salary) * 100);
        insights.push({
            icon: <Info className="w-3 h-3" />,
            text: `50% вакансий укладываются в диапазон ±${Math.round(spread / 2)}% от медианы`,
            color: "rgb(139,92,246)",
        });
    }

    if (!insights.length) return null;

    return (
        <div className="space-y-2">
            {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                    style={{ background: `${ins.color}12`, border: `1px solid ${ins.color}30` }}>
                    <span className="mt-0.5 shrink-0" style={{ color: ins.color }}>{ins.icon}</span>
                    <span style={{ color: "rgb(var(--text-2))" }}>{ins.text}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Result card ──────────────────────────────────────────────────────────────

interface ResultEntry {
    id: number;
    label: string;
    stats: SalaryStatsDto;
}

function ResultCard({ entry, onRemove, isOnly }: { entry: ResultEntry; onRemove: () => void; isOnly: boolean }) {
    const { stats } = entry;

    const chartData = [
        { name: "Мин", value: stats.minSalary, fill: "rgb(239,68,68)" },
        { name: "P25", value: stats.p25Salary, fill: "rgb(251,146,60)" },
        { name: "Медиана", value: stats.medianSalary, fill: "rgb(99,102,241)" },
        { name: "Среднее", value: stats.averageSalary, fill: "rgb(139,92,246)" },
        { name: "P75", value: stats.p75Salary, fill: "rgb(34,197,94)" },
        { name: "Макс", value: stats.maxSalary, fill: "rgb(16,185,129)" },
    ].filter(d => d.value != null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card p-6 space-y-5"
        >
            {/* Card header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold" style={{ color: "rgb(var(--text-1))" }}>{entry.label}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>
                        Данные по {stats.totalVacancies.toLocaleString("ru-RU")} вакансиям с указанной зарплатой
                    </p>
                </div>
                {!isOnly && (
                    <button
                        onClick={onRemove}
                        className="p-1.5 rounded-lg transition-all shrink-0"
                        style={{ color: "rgb(var(--text-3))" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgb(239,68,68)"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Медиана", value: stats.medianSalary, color: "rgb(99,102,241)", icon: <DollarSign className="w-4 h-4" /> },
                    { label: "Среднее", value: stats.averageSalary, color: "rgb(139,92,246)", icon: <TrendingUp className="w-4 h-4" /> },
                    { label: "Вакансий", value: stats.totalVacancies, color: "rgb(34,197,94)", icon: <Users className="w-4 h-4" /> },
                ].map(kpi => (
                    <div key={kpi.label} className="rounded-xl p-3 text-center"
                        style={{ background: `${kpi.color}10`, border: `1px solid ${kpi.color}20` }}>
                        <div className="flex justify-center mb-1" style={{ color: kpi.color }}>{kpi.icon}</div>
                        <p className="text-base font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            {kpi.label === "Вакансий"
                                ? kpi.value?.toLocaleString("ru-RU")
                                : fmtShort(kpi.value as number | null)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-3))" }}>{kpi.label}</p>
                        {kpi.label !== "Вакансий" && diffPct(stats.medianSalary, stats.averageSalary) && kpi.label === "Среднее" && (
                            <p className="text-xs font-semibold mt-0.5" style={{ color: kpi.color }}>
                                {diffPct(stats.averageSalary, stats.medianSalary)} от медианы
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Box plot */}
            <BoxPlot stats={stats} />

            {/* Bar chart */}
            {chartData.length > 0 && (
                <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "rgb(var(--text-2))" }}>
                        Детализация по перцентилям
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "rgb(var(--text-3))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={v => fmtShort(v)}
                                tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }}
                                axisLine={false}
                                tickLine={false}
                                width={56}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                            {stats.medianSalary != null && (
                                <ReferenceLine
                                    y={stats.medianSalary}
                                    stroke="rgba(99,102,241,0.4)"
                                    strokeDasharray="4 4"
                                    label={{ value: "медиана", position: "right", fontSize: 10, fill: "rgb(99,102,241)" }}
                                />
                            )}
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                {chartData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Insights */}
            <Insights stats={stats} />
        </motion.div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SalaryPage() {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [nextId, setNextId] = useState(1);

    const buildLabel = () => {
        const parts = [title.trim() || "Все должности"];
        if (location.trim()) parts.push(location.trim());
        const et = EMPLOYMENT_TYPES.find(t => t.value === employmentType);
        if (et && et.value) parts.push(et.label);
        return parts.join(" · ");
    };

    const handleSearch = async () => {
        if (!title.trim() && !location.trim() && !employmentType) {
            toast.error("Введите хотя бы одно условие поиска");
            return;
        }
        if (results.length >= 3) {
            toast.info("Максимум 3 поиска для сравнения. Удалите один из текущих.");
            return;
        }
        setLoading(true);
        try {
            const data = await statsService.getSalaryStats({
                title: title.trim() || undefined,
                location: location.trim() || undefined,
                employmentType: employmentType || undefined,
            });
            if (data.totalVacancies === 0) {
                toast.info("По этому запросу нет вакансий с указанной зарплатой");
                return;
            }
            setResults(prev => [...prev, { id: nextId, label: buildLabel(), stats: data }]);
            setNextId(n => n + 1);
        } catch {
            toast.error("Не удалось загрузить данные о зарплатах");
        } finally {
            setLoading(false);
        }
    };

    const handlePopular = (item: typeof POPULAR[0]) => {
        setTitle(item.title);
        setLocation(item.location);
        setEmploymentType("");
    };

    const removeResult = (id: number) => setResults(prev => prev.filter(r => r.id !== id));

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Hero header */}
                <div className="card p-6 overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 100%)" }} />
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 rounded-2xl shrink-0"
                            style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}>
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                                Рынок зарплат
                            </h1>
                            <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                                Анализ рыночных зарплат по опубликованным вакансиям — медиана, перцентили, диапазоны
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search form */}
                <div className="card p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-3))" }}>
                        Параметры поиска {results.length > 0 && `· результатов ${results.length}/3`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                Должность / ключевое слово
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Например: Python разработчик"
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                Город / регион
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Например: Москва"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: "rgb(var(--text-2))" }}>
                            Тип занятости
                        </label>
                        <select
                            value={employmentType}
                            onChange={e => setEmploymentType(e.target.value)}
                            className="input-field"
                        >
                            {EMPLOYMENT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        disabled={loading || results.length >= 3}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Search className="w-4 h-4" />}
                        {loading ? "Анализируем рынок..." : results.length > 0 ? "Добавить для сравнения" : "Показать зарплаты"}
                    </motion.button>

                    {/* Popular searches */}
                    <div>
                        <p className="text-xs mb-2" style={{ color: "rgb(var(--text-3))" }}>Популярные запросы:</p>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePopular(p)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                                    style={{
                                        background: "rgba(99,102,241,0.08)",
                                        color: "rgb(99,102,241)",
                                        border: "1px solid rgba(99,102,241,0.18)",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; }}
                                >
                                    {p.title}{p.location ? ` · ${p.location}` : ""}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {results.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card p-12 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: "rgba(99,102,241,0.08)" }}>
                            <BarChart2 className="w-8 h-8" style={{ color: "rgba(99,102,241,0.4)" }} />
                        </div>
                        <p className="font-semibold" style={{ color: "rgb(var(--text-2))" }}>
                            Введите параметры для анализа
                        </p>
                        <p className="text-sm mt-1" style={{ color: "rgb(var(--text-3))" }}>
                            Можно добавить до 3 поисков для сравнения рынков
                        </p>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence mode="popLayout">
                    {results.map(entry => (
                        <ResultCard
                            key={entry.id}
                            entry={entry}
                            onRemove={() => removeResult(entry.id)}
                            isOnly={results.length === 1}
                        />
                    ))}
                </AnimatePresence>

                {/* Comparison summary */}
                {results.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6 space-y-4"
                        style={{ border: "1px solid rgba(99,102,241,0.25)" }}
                    >
                        <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                            Сравнение медианных зарплат
                        </p>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart
                                data={results.map(r => ({
                                    name: r.label.split(" · ")[0],
                                    value: r.stats.medianSalary,
                                    fill: ["rgb(99,102,241)", "rgb(34,197,94)", "rgb(251,146,60)"][results.indexOf(r)],
                                }))}
                                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                            >
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgb(var(--text-3))" }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 10, fill: "rgb(var(--text-3))" }} axisLine={false} tickLine={false} width={56} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                                <Bar dataKey="value" name="Медиана" radius={[8, 8, 0, 0]} maxBarSize={64}>
                                    {results.map((r, i) => (
                                        <Cell key={i} fill={["rgb(99,102,241)", "rgb(34,197,94)", "rgb(251,146,60)"][i]} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3">
                            {results.map((r, i) => (
                                <div key={r.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{
                                        background: ["rgb(99,102,241)", "rgb(34,197,94)", "rgb(251,146,60)"][i]
                                    }} />
                                    <span style={{ color: "rgb(var(--text-2))" }}>{r.label.split(" · ")[0]}</span>
                                    <span className="font-semibold" style={{ color: "rgb(var(--text-1))" }}>
                                        {fmtShort(r.stats.medianSalary)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
