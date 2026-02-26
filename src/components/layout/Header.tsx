"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Briefcase, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, userRole, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const employerLinks = [
        { href: "/employer/dashboard", label: "Панель управления" },
        { href: "/employer/vacancies", label: "Мои вакансии" },
        { href: "/employer/resumes", label: "Поиск кандидатов" },
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
        <header className="sticky top-0 z-50 bg-background/95 border-b border-border shadow-sm backdrop-blur-sm">
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
                        <span className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
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
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm"
                                                : "text-foreground/70 hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        {link.label}
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-all"
                            aria-label="Переключить тему"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link href={userRole === "EMPLOYER" ? "/employer/profile" : "/jobseeker/profile"}>
                                    <Button variant="ghost" size="sm" className="hover:bg-accent">
                                        <User className="h-4 w-4 mr-2" />
                                        Профиль
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={logout} className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-600 transition-all">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Выход
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="hover:bg-accent">
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

                    {/* Mobile: theme toggle + menu button */}
                    <div className="md:hidden flex items-center gap-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-all"
                            aria-label="Переключить тему"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-foreground" />
                            ) : (
                                <Menu className="h-6 w-6 text-foreground" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border bg-background shadow-lg"
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
                                                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                                                )}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href={userRole === "EMPLOYER" ? "/employer/profile" : "/jobseeker/profile"}>
                                        <Button variant="ghost" size="sm" className="hover:bg-accent w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            Профиль
                                        </Button>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        Выход
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground transition-all"
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
