"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowRight, Star, Award, Shield, Zap, Globe, Lock } from "lucide-react";

export default function HomePage() {
    const features = [
        {
            icon: Briefcase,
            color: "from-indigo-500 to-violet-500",
            glow: "rgba(99,102,241,0.3)",
            title: "Найдите работу мечты",
            description: "Тысячи вакансий от ведущих компаний в одном месте. Умный поиск по навыкам.",
        },
        {
            icon: Users,
            color: "from-violet-500 to-purple-500",
            glow: "rgba(139,92,246,0.3)",
            title: "Найдите таланты",
            description: "Откройте для себя квалифицированных специалистов. Фильтрация по опыту и навыкам.",
        },
        {
            icon: TrendingUp,
            color: "from-indigo-500 to-violet-600",
            glow: "rgba(99,102,241,0.3)",
            title: "Развивайте карьеру",
            description: "Отслеживайте отклики, управляйте резюме и получайте уведомления в реальном времени.",
        },
    ];

    const benefits = [
        "Простой процесс подачи заявок",
        "Прямое общение с работодателями",
        "Конструктор и управление резюме",
        "Уведомления в реальном времени",
        "Безопасная и надежная платформа",
    ];

    const stats = [
        { icon: Users, value: "10 000+", label: "Активных пользователей", color: "from-indigo-500 to-violet-500" },
        { icon: Briefcase, value: "5 000+", label: "Открытых вакансий", color: "from-violet-500 to-purple-500" },
        { icon: Award, value: "95%", label: "Успешных размещений", color: "from-violet-500 to-indigo-500" },
        { icon: Shield, value: "100%", label: "Безопасность данных", color: "from-emerald-500 to-teal-500" },
    ];

    const trusted = [
        { icon: Zap, label: "Мгновенный отклик" },
        { icon: Globe, label: "Тысячи компаний" },
        { icon: Lock, label: "Защита данных" },
    ];

    return (
        <div className="min-h-screen" style={{ background: "rgb(var(--bg))" }}>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="mesh-bg absolute inset-0" />
                <div className="grid-pattern absolute inset-0" />

                {/* Floating orbs */}
                <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgb(99,102,241), transparent)" }} />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgb(139,92,246), transparent)" }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-36">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
                            style={{
                                background: "rgba(99,102,241,0.12)",
                                border: "1px solid rgba(99,102,241,0.3)",
                                color: "var(--badge-indigo-color)",
                            }}
                        >
                            <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
                            Надёжная платформа для карьерного роста
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                            style={{ color: "rgb(var(--text-1))", lineHeight: 1.1 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            Ваша следующая{" "}
                            <span className="gradient-text">карьерная</span>
                            <br />
                            возможность — здесь
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
                            style={{ color: "rgb(var(--text-2))" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            Соединяем соискателей с работодателями. Находите работу мечты или нанимайте лучших специалистов быстро и удобно.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                        >
                            <Link href="/auth/register">
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base font-semibold"
                                >
                                    Начать бесплатно
                                    <ArrowRight className="h-5 w-5" />
                                </motion.button>
                            </Link>
                            <Link href="/auth/login">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-secondary px-8 py-3.5 text-base font-semibold"
                                >
                                    Войти в систему
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div
                            className="flex items-center justify-center gap-6 mt-10 flex-wrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {trusted.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    <item.icon className="h-4 w-4" style={{ color: "rgb(99,102,241)" }} />
                                    {item.label}
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y" style={{ background: "rgb(var(--surface))" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="card-stat text-center"
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${stat.color}`}
                                    style={{ opacity: 0.9 }}
                                >
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold mb-1 gradient-text">{stat.value}</div>
                                <div className="text-sm" style={{ color: "rgb(var(--text-3))" }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24" style={{ background: "rgb(var(--bg))" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-16"
                    >
                        <div
                            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
                            style={{ color: "var(--badge-indigo-color)", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                        >
                            Возможности
                        </div>
                        <h2 className="text-4xl font-bold mb-4" style={{ color: "rgb(var(--text-1))" }}>
                            Почему выбирают{" "}
                            <span className="gradient-text">LaborExchange</span>?
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgb(var(--text-3))" }}>
                            Всё необходимое для успеха в вашей карьере собрано в одном месте
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                whileHover={{ y: -4 }}
                                className="glass-card p-8 group"
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                                    style={{ boxShadow: `0 8px 24px ${feature.glow}` }}
                                >
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3" style={{ color: "rgb(var(--text-1))" }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: "rgb(var(--text-3))" }}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 border-t" style={{ background: "rgb(var(--surface))" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div
                                className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
                                style={{ color: "var(--badge-indigo-color)", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                            >
                                Преимущества
                            </div>
                            <h2 className="text-4xl font-bold mb-6" style={{ color: "rgb(var(--text-1))" }}>
                                Создано для{" "}
                                <span className="gradient-text">успеха</span>
                            </h2>
                            <p className="text-lg mb-10" style={{ color: "rgb(var(--text-3))" }}>
                                Наша платформа предоставляет все инструменты, необходимые для успешного поиска работы или найма сотрудников.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                                            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                        </div>
                                        <span className="font-medium" style={{ color: "rgb(var(--text-2))" }}>{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden p-px"
                                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5), rgba(168,85,247,0.5))" }}>
                                <div className="rounded-3xl p-12 text-center relative overflow-hidden"
                                    style={{ background: "rgb(var(--surface))" }}>
                                    <div className="absolute inset-0 opacity-30"
                                        style={{ background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.4), transparent 70%)" }} />
                                    <div className="relative">
                                        <div
                                            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
                                            style={{
                                                background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
                                                boxShadow: "0 20px 60px rgba(99,102,241,0.4)"
                                            }}
                                        >
                                            <Briefcase className="h-12 w-12 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold mb-2" style={{ color: "rgb(var(--text-1))" }}>
                                            Ваша карьера
                                        </p>
                                        <p className="gradient-text text-2xl font-bold">начинается здесь</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24" style={{ background: "rgb(var(--bg))" }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative rounded-3xl overflow-hidden p-px"
                        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.6))" }}
                    >
                        <div
                            className="rounded-3xl p-16 text-center relative overflow-hidden"
                            style={{ background: "rgb(var(--surface))" }}
                        >
                            {/* Glow */}
                            <div className="absolute inset-0 opacity-20"
                                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.8), transparent 60%)" }} />

                            <div className="relative">
                                <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "rgb(var(--text-1))" }}>
                                    Готовы начать?
                                </h2>
                                <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgb(var(--text-2))" }}>
                                    Присоединяйтесь к тысячам соискателей и работодателей, которые нашли своё идеальное совпадение
                                </p>
                                <Link href="/auth/register">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base font-semibold"
                                    >
                                        Создать бесплатный аккаунт
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
