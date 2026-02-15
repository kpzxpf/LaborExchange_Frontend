"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Briefcase, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, userRole, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const employerLinks = [
        { href: "/employer/dashboard", label: "Панель управления" },
        { href: "/employer/vacancies", label: "Мои вакансии" },
        { href: "/employer/companies", label: "Компании" },
        { href: "/employer/applications", label: "Отклики" },
    ];

    const jobSeekerLinks = [
        { href: "/jobseeker/dashboard", label: "Панель управления" },
        { href: "/jobseeker/vacancies", label: "Поиск работы" },
        { href: "/jobseeker/resumes", label: "Мои резюме" },
        { href: "/jobseeker/applications", label: "Мои отклики" },
    ];

    const links = userRole === "EMPLOYER" ? employerLinks : jobSeekerLinks;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-md"
                        >
                            <Briefcase className="h-6 w-6 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Labor</span>Exchange
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex space-x-1">
                            {links.map((link) => (
                                <Link key={link.href} href={link.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                            isActive(link.href)
                                                ? "bg-blue-100 text-blue-700 shadow-sm"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        {link.label}
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* ✅ ИСПРАВЛЕНО: Правильный URL без подчеркивания */}
                                <Link href={userRole === "EMPLOYER" ? "/employer/profile" : "/jobseeker/profile"}>
                                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                        <User className="h-4 w-4 mr-2" />
                                        Профиль
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={logout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Выход
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                        Вход
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                                        Регистрация
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6 text-gray-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 bg-white shadow-lg"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    {links.map((link) => (
                                        <Link key={link.href} href={link.href}>
                                            <div
                                                className={cn(
                                                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                                    isActive(link.href)
                                                        ? "bg-blue-100 text-blue-700 shadow-sm"
                                                        : "text-gray-700 hover:bg-gray-100"
                                                )}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </div>
                                        </Link>
                                    ))}
                                    {/* ✅ ИСПРАВЛЕНО: Правильный URL для мобильного меню */}
                                    <Link href={userRole === "EMPLOYER" ? "/employer/profile" : "/jobseeker/profile"}>
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Профиль
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        Выход
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Вход
                                        </div>
                                    </Link>
                                    <Link href="/auth/register">
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Регистрация
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;