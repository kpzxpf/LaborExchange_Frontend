"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
    const { userId, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !userId) {
            router.push("/auth/login");
        }
    }, [loading, userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="space-y-4 w-full max-w-4xl px-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-foreground/[0.03] rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!userId) return null;

    return <>{children}</>;
}
