"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Building2,
    ArrowLeft,
    Save,
    Loader2,
    Globe,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { companyService } from "@/services/api";
import type { CompanyDto } from "@/types";
import toast from "react-hot-toast";

const inputCls = cn(
    "w-full px-4 py-3 border-2 rounded-xl",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
    "transition-all duration-200",
    "bg-white dark:bg-gray-700",
    "border-gray-200 dark:border-gray-600",
    "text-gray-900 dark:text-gray-100",
    "placeholder:text-gray-400"
);

export default function EditCompanyPage() {
    const router = useRouter();

    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        location: "",
        email: "",
        phoneNumber: "",
        website: "",
    });

    useEffect(() => {
        companyService.getMyCompany()
            .then(c => {
                setCompany(c);
                setForm({
                    name: c.name ?? "",
                    description: c.description ?? "",
                    location: c.location ?? "",
                    email: c.email ?? "",
                    phoneNumber: c.phoneNumber ?? "",
                    website: c.website ?? "",
                });
            })
            .catch(() => {
                toast.error("Компания не найдена. Сначала создайте вакансию.");
                router.replace("/employer/vacancies/create");
            })
            .finally(() => setLoading(false));
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.id) return;

        setSaving(true);
        try {
            const updated = await companyService.update(company.id, {
                name: form.name,
                description: form.description || undefined,
                location: form.location,
                email: form.email,
                phoneNumber: form.phoneNumber || undefined,
                website: form.website || undefined,
            });
            setCompany(updated);
            toast.success("Сохранено");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Не удалось сохранить";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const isValid = form.name.trim() && form.location.trim() && form.email.trim();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Sticky header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
            >
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Назад</span>
                    </motion.button>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Моя компания</h1>
                    </div>
                    <div className="w-24" />
                </div>
            </motion.div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    Название компании *
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Например: Tech Innovations Inc."
                                    required
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Местоположение *
                                </label>
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Москва, Россия"
                                    required
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="w-4 h-4" />
                                    Email компании *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="contact@company.com"
                                    required
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="w-4 h-4" />
                                    Телефон
                                </label>
                                <input
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+7 (999) 000-00-00"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Globe className="w-4 h-4" />
                                    Сайт
                                </label>
                                <input
                                    name="website"
                                    value={form.website}
                                    onChange={handleChange}
                                    placeholder="https://company.com"
                                    className={inputCls}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Описание компании
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Кратко о компании..."
                                    className={cn(inputCls, "resize-none")}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <motion.button
                                type="submit"
                                disabled={!isValid || saving}
                                whileHover={isValid && !saving ? { scale: 1.02 } : {}}
                                whileTap={isValid && !saving ? { scale: 0.98 } : {}}
                                className={cn(
                                    "px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200",
                                    isValid && !saving
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Сохранить
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
