"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowRight, Star, Award, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";

export default function HomePage() {
    const features = [
        {
            icon: Briefcase,
            title: "Найдите работу мечты",
            description: "Тысячи вакансий от ведущих компаний в одном месте",
        },
        {
            icon: Users,
            title: "Найдите талантливых специалистов",
            description: "Откройте для себя квалифицированных профессионалов для вашей компании",
        },
        {
            icon: TrendingUp,
            title: "Развивайте карьеру",
            description: "Получайте доступ к ресурсам для профессионального роста",
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
        { icon: Users, value: "10,000+", label: "Активных пользователей" },
        { icon: Briefcase, value: "5,000+", label: "Открытых вакансий" },
        { icon: Award, value: "95%", label: "Успешных размещений" },
        { icon: Shield, value: "100%", label: "Безопасность данных" },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section с улучшенным фоном */}
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
                {/* Декоративные элементы */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center px-4 py-2 mb-6 bg-blue-100 rounded-full"
                        >
                            <Star className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Надежная платформа для поиска работы
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Найдите идеальное{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                совпадение
                            </span>
                            <br />
                            для вашей карьеры
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Соединяем соискателей с работодателями. Развивайте карьеру или найдите идеального кандидата.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <Link href="/auth/register">
                                <Button size="lg" className="group shadow-lg hover:shadow-xl transition-shadow">
                                    Начать работу
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                                    Войти в систему
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                    <stat.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Почему выбирают LaborExchange?
                    </h2>
                    <p className="text-xl text-gray-600">
                        Всё необходимое для успеха в вашей карьере
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
                        >
                            <Card hover className="h-full bg-white shadow-md hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                        <feature.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Создано для успеха
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Наша платформа предоставляет все инструменты, необходимые для успеха в поиске работы или найме сотрудников.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 font-medium">{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-square bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl shadow-2xl flex items-center justify-center">
                                <div className="text-center text-white p-8">
                                    <Briefcase className="h-24 w-24 mx-auto mb-4 opacity-80" />
                                    <p className="text-2xl font-bold">Ваша карьера начинается здесь</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center"
                >
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Готовы начать?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Присоединяйтесь к тысячам соискателей и работодателей, которые нашли своё идеальное совпадение
                    </p>
                    <Link href="/auth/register">
                        <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 border-white shadow-lg hover:shadow-xl transition-shadow">
                            Создать бесплатный аккаунт
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}