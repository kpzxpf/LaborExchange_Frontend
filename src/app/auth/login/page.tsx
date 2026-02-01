"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import type { LoginRequest } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            await login(data);
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4"
                    >
                        <LogIn className="h-10 w-10 text-primary-600" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600"
                    >
                        Sign in to continue to your account
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>Enter your credentials to access your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="pl-10"
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
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        required
                                        error={errors.password?.message}
                                        {...register("password", {
                                            required: "Password is required",
                                        })}
                                    />
                                </div>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <Link href="/auth/register">
                                        <Button variant="outline" className="w-full">
                                            Create New Account
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center text-sm text-gray-600"
                >
                    By signing in, you agree to our{" "}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                        Privacy Policy
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}