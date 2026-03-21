"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    DollarSign,
    FileText,
    Building2,
    ArrowLeft,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Globe,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vacancyService, companyService } from "@/services/api";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { useAuth } from "@/contexts/AuthContext";
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

export default function CreateVacancyPage() {
    const router = useRouter();
    const { userId } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [myCompany, setMyCompany] = useState<CompanyDto | null>(null);
    const [editingCompany, setEditingCompany] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        salary: "",
    });

    const [companyForm, setCompanyForm] = useState({
        name: "",
        description: "",
        location: "",
        email: "",
        phoneNumber: "",
        website: "",
    });
    const [editCompanyForm, setEditCompanyForm] = useState({
        name: "",
        description: "",
        location: "",
        email: "",
        phoneNumber: "",
        website: "",
    });

    useEffect(() => {
        companyService.getMyCompany()
            .then(c => setMyCompany(c))
            .catch(() => setMyCompany(null))
            .finally(() => setCompanyLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEditCompany = async () => {
        if (!myCompany) return;
        try {
            const updated = await companyService.update(myCompany.id, editCompanyForm);
            setMyCompany(updated);
            setEditingCompany(false);
            toast.success("Компания обновлена!");
        } catch {
            toast.error("Не удалось обновить компанию");
        }
    };

    const startEditCompany = () => {
        if (!myCompany) return;
        setEditCompanyForm({
            name: myCompany.name || "",
            description: myCompany.description || "",
            location: myCompany.location || "",
            email: myCompany.email || "",
            phoneNumber: myCompany.phoneNumber || "",
            website: myCompany.website || "",
        });
        setEditingCompany(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsLoading(true);
        try {
            let companyName: string;

            if (myCompany) {
                companyName = myCompany.name;
            } else {
                // Сначала создаём компанию
                const newCompany = await companyService.create({
                    name: companyForm.name,
                    description: companyForm.description || undefined,
                    location: companyForm.location,
                    email: companyForm.email,
                    phoneNumber: companyForm.phoneNumber || undefined,
                    website: companyForm.website || undefined,
                });
                companyName = newCompany.name;
                setMyCompany(newCompany);
                toast.success("Компания создана!");
            }

            const vacancy = await vacancyService.create({
                title: formData.title,
                description: formData.description,
                salary: formData.salary ? parseFloat(formData.salary) : null,
                companyName,
                employerId: userId,
                isPublished: false,
            });

            if (selectedSkills.length > 0) {
                await vacancyService.setSkills(vacancy.id, selectedSkills);
            }

            toast.success("Вакансия создана!");
            router.push("/employer/vacancies");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Не удалось создать вакансию";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const vacancyValid = formData.title.trim() && formData.description.trim();
    const companyValid = myCompany ||
        (companyForm.name.trim() && companyForm.location.trim() && companyForm.email.trim());
    const isFormValid = vacancyValid && companyValid;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Sticky header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
            >
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
                        <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Новая вакансия</h1>
                    </div>
                    <div className="w-24" />
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Компания */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            Компания
                        </h2>

                        {companyLoading ? (
                            <div className="flex items-center gap-3 text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Загрузка информации о компании...</span>
                            </div>
                        ) : myCompany && !editingCompany ? (
                            /* Компания уже есть */
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                            >
                                <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white text-lg">{myCompany.name}</p>
                                    {myCompany.location && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <MapPin className="w-3.5 h-3.5" />{myCompany.location}
                                        </p>
                                    )}
                                    {myCompany.email && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />{myCompany.email}
                                        </p>
                                    )}
                                    {myCompany.website && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Globe className="w-3.5 h-3.5" />{myCompany.website}
                                        </p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                        Вакансия будет привязана к этой компании
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={startEditCompany}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline shrink-0"
                                >
                                    Изменить
                                </button>
                            </motion.div>
                        ) : myCompany && editingCompany ? (
                            /* Редактирование компании */
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Редактирование компании</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            <Building2 className="w-4 h-4 inline mr-1" />Название *
                                        </label>
                                        <input name="name" value={editCompanyForm.name}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, name: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            <MapPin className="w-4 h-4 inline mr-1" />Местоположение *
                                        </label>
                                        <input name="location" value={editCompanyForm.location}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, location: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            <Mail className="w-4 h-4 inline mr-1" />Email *
                                        </label>
                                        <input type="email" name="email" value={editCompanyForm.email}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, email: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            <Phone className="w-4 h-4 inline mr-1" />Телефон
                                        </label>
                                        <input name="phoneNumber" value={editCompanyForm.phoneNumber}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, phoneNumber: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            <Globe className="w-4 h-4 inline mr-1" />Сайт
                                        </label>
                                        <input name="website" value={editCompanyForm.website}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, website: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Описание</label>
                                        <textarea name="description" value={editCompanyForm.description} rows={2}
                                            onChange={e => setEditCompanyForm(p => ({ ...p, description: e.target.value }))}
                                            className={cn(inputCls, "resize-none")} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleSaveEditCompany}
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                                        Сохранить компанию
                                    </button>
                                    <button type="button" onClick={() => setEditingCompany(false)}
                                        className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        Отмена
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* Компании нет — показываем форму создания */
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        У вас нет зарегистрированной компании. Заполните данные ниже — компания будет создана вместе с вакансией.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Building2 className="w-4 h-4" />
                                            Название компании *
                                        </label>
                                        <input
                                            name="name"
                                            value={companyForm.name}
                                            onChange={handleCompanyChange}
                                            placeholder="Например: Tech Innovations Inc."
                                            required={!myCompany}
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
                                            value={companyForm.location}
                                            onChange={handleCompanyChange}
                                            placeholder="Москва, Россия"
                                            required={!myCompany}
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
                                            value={companyForm.email}
                                            onChange={handleCompanyChange}
                                            placeholder="contact@company.com"
                                            required={!myCompany}
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
                                            value={companyForm.phoneNumber}
                                            onChange={handleCompanyChange}
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
                                            value={companyForm.website}
                                            onChange={handleCompanyChange}
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
                                            value={companyForm.description}
                                            onChange={handleCompanyChange}
                                            rows={3}
                                            placeholder="Кратко о компании..."
                                            className={cn(inputCls, "resize-none")}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Основная информация о вакансии */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Информация о вакансии
                        </h2>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Briefcase className="w-4 h-4" />
                                Название должности *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Senior Frontend Developer"
                                required
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <DollarSign className="w-4 h-4" />
                                Зарплата (необязательно)
                            </label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="150000"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="w-4 h-4" />
                                Описание вакансии *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Опишите требования, обязанности и условия работы..."
                                required
                                rows={8}
                                className={cn(inputCls, "resize-none")}
                            />
                        </div>
                    </motion.div>

                    {/* Навыки */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                    >
                        <SkillSelector
                            selected={selectedSkills}
                            onChange={setSelectedSkills}
                            placeholder="Начните вводить навык..."
                            maxSkills={15}
                        />
                    </motion.div>

                    {/* Кнопки */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-end gap-4"
                    >
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Отмена
                        </motion.button>

                        <motion.button
                            type="submit"
                            disabled={!isFormValid || isLoading || companyLoading}
                            whileHover={isFormValid ? { scale: 1.02 } : {}}
                            whileTap={isFormValid ? { scale: 0.98 } : {}}
                            className={cn(
                                "px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200",
                                isFormValid && !isLoading && !companyLoading
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Создать вакансию
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
