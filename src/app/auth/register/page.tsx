"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, UserCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import type { RegisterRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

type FormData = RegisterRequest;

export default function RegisterPage() {
    const [selectedRole, setSelectedRole] = useState<"JOB_SEEKER" | "EMPLOYER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        if (!selectedRole) {
            toast.error("Please select a role");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser({ ...data, userRole: selectedRole });
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        {
            value: "JOB_SEEKER" as const,
            icon: UserCircle,
            title: "Job Seeker",
            description: "I'm looking for job opportunities",
            features: ["Browse job listings", "Create resumes", "Apply to positions", "Track applications"],
        },
        {
            value: "EMPLOYER" as const,
            icon: Briefcase,
            title: "Employer",
            description: "I'm hiring talent for my company",
            features: ["Post vacancies", "Manage companies", "Review applications", "Find candidates"],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold text-gray-900 mb-2"
                    >
                        Join LaborExchange
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600"
                    >
                        Create your account and start your journey
                    </motion.p>
                </div>

                {/* Role Selection */}
                {!selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                            What brings you here?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {roleOptions.map((option) => (
                                <motion.div
                                    key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        hover
                                        className={`cursor-pointer transition-all ${
                                            selectedRole === option.value
                                                ? "ring-2 ring-primary-500 border-primary-500"
                                                : "hover:border-primary-300"
                                        }`}
                                        onClick={() => setSelectedRole(option.value)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-primary-100 p-3 rounded-lg">
                                                    <option.icon className="h-8 w-8 text-primary-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                        {option.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        {option.description}
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {option.features.map((feature, index) => (
                                                            <li key={index} className="flex items-center text-sm text-gray-700">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Registration Form */}
                {selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Complete Your Registration</CardTitle>
                                        <CardDescription>
                                            Registering as:{" "}
                                            <span className="font-semibold text-primary-600">
                        {roleOptions.find((r) => r.value === selectedRole)?.title}
                      </span>
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedRole(null)}
                                    >
                                        Change Role
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <Input
                                        label="Username"
                                        placeholder="johndoe"
                                        required
                                        error={errors.username?.message}
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: {
                                                value: 3,
                                                message: "Username must be at least 3 characters",
                                            },
                                            maxLength: {
                                                value: 32,
                                                message: "Username must be at most 32 characters",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                        error={errors.email?.message}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="+1234567890"
                                        required
                                        error={errors.phone?.message}
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^\+?[0-9]{10,15}$/,
                                                message: "Phone number must be 10-15 digits",
                                            },
                                        })}
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        error={errors.password?.message}
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters",
                                            },
                                            maxLength: {
                                                value: 64,
                                                message: "Password must be at most 64 characters",
                                            },
                                        })}
                                    />

                                    <Button type="submit" className="w-full" isLoading={isLoading}>
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <Link
                                            href="/auth/login"
                                            className="text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}