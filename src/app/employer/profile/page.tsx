"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Edit, Save, X, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiClient } from "@/lib/apiClient";
import type { UserDto } from "@/types";
import toast from "react-hot-toast";

export default function EmployerProfilePage() {
    const { userId, isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
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

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated || userRole !== "EMPLOYER") {
            router.push("/auth/login");
            return;
        }

        if (userId) {
            fetchProfile();
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
        } catch (error) {
            toast.error("Не удалось загрузить профиль");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        setIsSaving(true);
        try {
            await apiClient.post("/api/users/update", {
                id: userId,
                ...formData,
            });
            toast.success("Профиль успешно обновлен!");
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error("Не удалось обновить профиль");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== "EMPLOYER" || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Профиль работодателя</h1>
                    <p className="text-gray-600">Управляйте информацией вашего профиля</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
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
                                        className="hover:bg-blue-50"
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
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        required
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />

                                    <Input
                                        label="Имя"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                    />

                                    <Input
                                        label="Фамилия"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                    />

                                    <Input
                                        label="Номер телефона"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phoneNumber: e.target.value })
                                        }
                                    />

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleSave}
                                            className="flex-1"
                                            isLoading={isSaving}
                                        >
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
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">
                                                Имя пользователя
                                            </label>
                                            <p className="mt-1 text-lg text-gray-900">{profile.username}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Роль</label>
                                            <p className="mt-1 text-lg text-gray-900">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    {profile.roleName}
                                                </span>
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center">
                                                <Mail className="h-4 w-4 mr-2" />
                                                Email
                                            </label>
                                            <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
                                        </div>

                                        {profile.phoneNumber && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 flex items-center">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Телефон
                                                </label>
                                                <p className="mt-1 text-lg text-gray-900">
                                                    {profile.phoneNumber}
                                                </p>
                                            </div>
                                        )}

                                        {profile.firstName && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Имя</label>
                                                <p className="mt-1 text-lg text-gray-900">
                                                    {profile.firstName}
                                                </p>
                                            </div>
                                        )}

                                        {profile.lastName && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">
                                                    Фамилия
                                                </label>
                                                <p className="mt-1 text-lg text-gray-900">{profile.lastName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}