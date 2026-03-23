"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!isAuthenticated || userRole !== "ADMIN")) {
            router.replace("/");
        }
    }, [isAuthenticated, userRole, loading, router]);

    if (loading || !isAuthenticated || userRole !== "ADMIN") return null;

    return <>{children}</>;
}
