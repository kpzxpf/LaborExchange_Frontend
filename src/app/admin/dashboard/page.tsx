"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Briefcase, ShieldCheck } from "lucide-react";

const cards = [
    {
        title: "Пользователи",
        description: "Управление аккаунтами: просмотр, блокировка, удаление",
        icon: Users,
        href: "/admin/users",
        color: "rgb(99,102,241)",
        bg: "rgba(99,102,241,0.12)",
    },
    {
        title: "Вакансии",
        description: "Просмотр и модерация всех опубликованных вакансий",
        icon: Briefcase,
        href: "/admin/vacancies",
        color: "rgb(34,197,94)",
        bg: "rgba(34,197,94,0.12)",
    },
];

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen py-8 px-4" style={{ background: "rgb(var(--bg))" }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                    >
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-1))" }}>
                            Панель администратора
                        </h1>
                        <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                            Управление платформой LaborExchange
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.href}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link href={card.href}>
                                <div
                                    className="glass-card p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                    style={{ borderColor: `${card.color}20` }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: card.bg }}
                                    >
                                        <card.icon className="h-6 w-6" style={{ color: card.color }} />
                                    </div>
                                    <h2 className="text-lg font-semibold mb-1" style={{ color: "rgb(var(--text-1))" }}>
                                        {card.title}
                                    </h2>
                                    <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                        {card.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
