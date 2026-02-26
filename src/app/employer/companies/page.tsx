"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Страница компании убрана — управление компанией теперь встроено в создание вакансии
export default function CompaniesRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/employer/dashboard");
    }, [router]);
    return null;
}
