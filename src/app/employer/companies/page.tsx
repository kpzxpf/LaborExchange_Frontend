"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { companyService } from "@/services/api";
import type { CompanyDto } from "@/types";
import { handleApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

type FormData = Omit<CompanyDto, "id">;

export default function CreateCompanyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await companyService.create(data);
            toast.success("Company created successfully!");
            router.push("/employer/companies");
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/employer/companies">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Companies
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Company</CardTitle>
                            <CardDescription>
                                Add a company profile to associate with your job postings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Input
                                    label="Company Name"
                                    placeholder="e.g. Tech Innovations Inc."
                                    required
                                    error={errors.name?.message}
                                    {...register("name", {
                                        required: "Company name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters",
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "Name must be at most 100 characters",
                                        },
                                    })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Tell us about your company..."
                                        {...register("description", {
                                            maxLength: {
                                                value: 2000,
                                                message: "Description must be at most 2000 characters",
                                            },
                                        })}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                <Input
                                    label="Location"
                                    placeholder="e.g. San Francisco, CA"
                                    required
                                    error={errors.location?.message}
                                    {...register("location", {
                                        required: "Location is required",
                                    })}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="contact@company.com"
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
                                    error={errors.phoneNumber?.message}
                                    {...register("phoneNumber", {
                                        pattern: {
                                            value: /^(\+7|8|\+380|\+375)\d{9,11}$/,
                                            message: "Invalid phone number format",
                                        },
                                    })}
                                />

                                <Input
                                    label="Website"
                                    type="url"
                                    placeholder="https://www.company.com"
                                    error={errors.website?.message}
                                    {...register("website", {
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: "Website must be a valid URL",
                                        },
                                    })}
                                />

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        isLoading={isLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Company
                                    </Button>
                                    <Link href="/employer/companies" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}