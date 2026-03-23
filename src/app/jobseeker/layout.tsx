"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function JobseekerLayout({ children }: { children: React.ReactNode }) {
    const { userId, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !userId) {
            router.push("/auth/login");
        }
    }, [loading, userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
                <div className="space-y-3 w-full max-w-3xl px-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-20 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!userId) return null;

    return <>{children}</>;
}
