"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    User, Mail, Phone, Edit, Save, X, Building2,
    MapPin, Globe, Trash2, Plus, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiClient } from "@/lib/apiClient";
import { companyService } from "@/services/api";
import type { UserDto, CompanyDto } from "@/types";
import toast from "react-hot-toast";

const formatRole = (role?: string) => {
    if (role === "EMPLOYER") return "Работодатель";
    if (role === "JOB_SEEKER") return "Соискатель";
    return role;
};

const emptyCompanyForm = {
    name: "",
    description: "",
    location: "",
    email: "",
    phoneNumber: "",
    website: "",
};

export default function EmployerProfilePage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();

    // Profile state
    const [profile, setProfile] = useState<UserDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });

    // Company state
    const [company, setCompany] = useState<CompanyDto | null>(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);
    const [companyForm, setCompanyForm] = useState(emptyCompanyForm);

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated || userRole !== "EMPLOYER") {
            router.push("/auth/login");
            return;
        }

        if (userId) {
            fetchProfile();
            fetchCompany();
        }
    }, [isAuthenticated, userRole, userId, loading, router]);

    const fetchProfile = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get<UserDto>(`/api/users/${userId}/profile`);
            setProfile(response.data);
            setFormData({
                username: response.data.username || "",
                email: response.data.email || "",
                firstName: response.data.firstName || "",
                lastName: response.data.lastName || "",
                phoneNumber: response.data.phoneNumber || "",
            });
        } catch {
            toast.error("Не удалось загрузить профиль");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompany = async () => {
        setCompanyLoading(true);
        try {
            const c = await companyService.getMyCompany();
            setCompany(c);
        } catch {
            setCompany(null);
        } finally {
            setCompanyLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            await apiClient.put(`/api/users/${userId}`, formData);
            toast.success("Профиль успешно обновлён!");
            setIsEditing(false);
            fetchProfile();
        } catch {
            toast.error("Не удалось обновить профиль");
        } finally {
            setIsSaving(false);
        }
    };

    const startEditCompany = () => {
        if (!company) return;
        setCompanyForm({
            name: company.name || "",
            description: company.description || "",
            location: company.location || "",
            email: company.email || "",
            phoneNumber: company.phoneNumber || "",
            website: company.website || "",
        });
        setIsEditingCompany(true);
    };

    const handleSaveCompany = async () => {
        setIsSavingCompany(true);
        try {
            if (company) {
                const updated = await companyService.update(company.id, companyForm);
                setCompany(updated);
                setIsEditingCompany(false);
                toast.success("Компания обновлена!");
            } else {
                const created = await companyService.create(companyForm);
                setCompany(created);
                setIsCreatingCompany(false);
                toast.success("Компания создана!");
            }
        } catch {
            toast.error("Не удалось сохранить компанию");
        } finally {
            setIsSavingCompany(false);
        }
    };

    const handleDeleteCompany = async () => {
        if (!company) return;
        if (!confirm("Удалить компанию? Вакансии компании останутся.")) return;
        try {
            await companyService.delete(company.id);
            setCompany(null);
            toast.success("Компания удалена");
        } catch {
            toast.error("Не удалось удалить компанию");
        }
    };

    const cancelCompanyEdit = () => {
        setIsEditingCompany(false);
        setIsCreatingCompany(false);
        setCompanyForm(emptyCompanyForm);
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-950 dark:via-background dark:to-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== "EMPLOYER" || !profile) {
        return null;
    }

    const showCompanyForm = isEditingCompany || isCreatingCompany;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-950 dark:via-background dark:to-gray-950 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Профиль работодателя</h1>
                    <p className="text-gray-600 dark:text-gray-400">Управляйте информацией вашего профиля</p>
                </motion.div>

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="shadow-xl bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                                    Информация профиля
                                </CardTitle>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Редактировать
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input
                                        label="Имя пользователя"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Имя"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                    <Input
                                        label="Фамилия"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                    <Input
                                        label="Номер телефона"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                    <div className="flex gap-3 pt-4">
                                        <Button onClick={handleSave} className="flex-1" isLoading={isSaving}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Сохранить
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    username: profile.username || "",
                                                    email: profile.email || "",
                                                    firstName: profile.firstName || "",
                                                    lastName: profile.lastName || "",
                                                    phoneNumber: profile.phoneNumber || "",
                                                });
                                            }}
                                            className="flex-1"
                                            disabled={isSaving}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Отмена
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Имя пользователя</label>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Роль</label>
                                        <p className="mt-1">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                                                {formatRole(profile.roleName)}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                                            <Mail className="h-4 w-4 mr-2" />Email
                                        </label>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.email}</p>
                                    </div>
                                    {profile.phoneNumber && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                                                <Phone className="h-4 w-4 mr-2" />Телефон
                                            </label>
                                            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.phoneNumber}</p>
                                        </div>
                                    )}
                                    {profile.firstName && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Имя</label>
                                            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.firstName}</p>
                                        </div>
                                    )}
                                    {profile.lastName && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Фамилия</label>
                                            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.lastName}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Company Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="shadow-xl bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <Building2 className="h-6 w-6 mr-3 text-indigo-600" />
                                    Моя компания
                                </CardTitle>
                                {!showCompanyForm && (
                                    <div className="flex gap-2">
                                        {company ? (
                                            <>
                                                <Button variant="outline" size="sm" onClick={startEditCompany}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Редактировать
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={handleDeleteCompany}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </>
                                        ) : !companyLoading && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setCompanyForm(emptyCompanyForm);
                                                    setIsCreatingCompany(true);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Добавить компанию
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {companyLoading ? (
                                <div className="flex items-center gap-3 text-gray-500 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Загрузка...</span>
                                </div>
                            ) : showCompanyForm ? (
                                <CompanyForm
                                    form={companyForm}
                                    onChange={(field, val) => setCompanyForm(prev => ({ ...prev, [field]: val }))}
                                    onSave={handleSaveCompany}
                                    onCancel={cancelCompanyEdit}
                                    isSaving={isSavingCompany}
                                    isNew={!company || isCreatingCompany}
                                />
                            ) : company ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Название</label>
                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{company.name}</p>
                                    </div>
                                    {company.location && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />Местоположение
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{company.location}</p>
                                        </div>
                                    )}
                                    {company.email && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />Email
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{company.email}</p>
                                        </div>
                                    )}
                                    {company.phoneNumber && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />Телефон
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{company.phoneNumber}</p>
                                        </div>
                                    )}
                                    {company.website && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Globe className="w-3.5 h-3.5" />Сайт
                                            </label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{company.website}</p>
                                        </div>
                                    )}
                                    {company.description && (
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Описание</label>
                                            <p className="mt-1 text-gray-900 dark:text-white">{company.description}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>У вас нет зарегистрированной компании</p>
                                    <p className="text-sm mt-1">Нажмите «Добавить компанию», чтобы создать её</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

const inputCls =
    "w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400";

function CompanyForm({
    form,
    onChange,
    onSave,
    onCancel,
    isSaving,
    isNew,
}: {
    form: typeof emptyCompanyForm;
    onChange: (field: string, val: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    isNew: boolean;
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Название *</label>
                    <input
                        value={form.name}
                        onChange={e => onChange("name", e.target.value)}
                        placeholder="Название компании"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />Местоположение *
                    </label>
                    <input
                        value={form.location}
                        onChange={e => onChange("location", e.target.value)}
                        placeholder="Москва, Россия"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />Email *
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => onChange("email", e.target.value)}
                        placeholder="contact@company.com"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Телефон</label>
                    <input
                        value={form.phoneNumber}
                        onChange={e => onChange("phoneNumber", e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />Сайт
                    </label>
                    <input
                        value={form.website}
                        onChange={e => onChange("website", e.target.value)}
                        placeholder="https://company.com"
                        className={inputCls}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Описание</label>
                    <textarea
                        value={form.description}
                        onChange={e => onChange("description", e.target.value)}
                        rows={3}
                        placeholder="Кратко о компании..."
                        className={`${inputCls} resize-none`}
                    />
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onSave}
                    disabled={isSaving || !form.name.trim() || !form.location.trim() || !form.email.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isNew ? "Создать" : "Сохранить"}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-4 h-4 inline mr-1" />Отмена
                </button>
            </div>
        </div>
    );
}
