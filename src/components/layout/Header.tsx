"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, Briefcase, User, LogOut, Zap, Sun, Moon,
    Search, Settings, Bell, ShieldCheck, ChevronDown,
    BarChart2, Heart, MessageSquare, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import NotificationBell from "@/components/ui/NotificationBell";

// ─── Nav link type ───────────────────────────────────────────────────────────
type NavLink = { href: string; label: string };

// ─── Role-based nav config ───────────────────────────────────────────────────
const NAV: Record<string, { primary: NavLink[]; more: NavLink[] }> = {
    EMPLOYER: {
        primary: [
            { href: "/employer/dashboard",    label: "Панель" },
            { href: "/employer/vacancies",    label: "Вакансии" },
            { href: "/employer/resumes",      label: "Кандидаты" },
            { href: "/employer/applications", label: "Отклики" },
        ],
        more: [
            { href: "/employer/favorites", label: "Избранное" },
            { href: "/messages",           label: "Сообщения" },
            { href: "/employer/stats",     label: "Статистика" },
        ],
    },
    JOBSEEKER: {
        primary: [
            { href: "/jobseeker/vacancies",        label: "Поиск работы" },
            { href: "/jobseeker/recommendations",  label: "Для вас" },
            { href: "/jobseeker/resumes",          label: "Резюме" },
            { href: "/jobseeker/applications",     label: "Отклики" },
        ],
        more: [
            { href: "/jobseeker/dashboard",  label: "Панель" },
            { href: "/jobseeker/favorites",  label: "Избранное" },
            { href: "/messages",             label: "Сообщения" },
            { href: "/jobseeker/stats",      label: "Статистика" },
        ],
    },
    ADMIN: {
        primary: [
            { href: "/admin/dashboard", label: "Панель" },
            { href: "/admin/users",     label: "Пользователи" },
            { href: "/admin/vacancies", label: "Вакансии" },
        ],
        more: [],
    },
};

// ─── Shared hover style helpers ───────────────────────────────────────────────
const hoverItem = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.color = "rgb(99,102,241)";
        e.currentTarget.style.background = "rgba(99,102,241,0.07)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.color = "";
        e.currentTarget.style.background = "";
    },
};

const activeStyle = {
    color: "rgb(99,102,241)",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.25)",
} as React.CSSProperties;

const inactiveStyle = { color: "rgb(var(--text-2))" } as React.CSSProperties;

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavItem({ href, label, active }: NavLink & { active: boolean }) {
    return (
        <Link href={href}>
            <motion.div
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
                style={active ? activeStyle : inactiveStyle}
                {...(!active ? hoverItem : {})}
            >
                {label}
            </motion.div>
        </Link>
    );
}

function MoreDropdown({ links, isActive }: { links: NavLink[]; isActive: (h: string) => boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasActive = links.some(l => isActive(l.href));

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={hasActive ? activeStyle : inactiveStyle}
                {...(!hasActive ? hoverItem : {})}
            >
                Ещё
                <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 mt-2 w-44 rounded-xl overflow-hidden z-50"
                        style={{
                            background: "rgb(var(--card-bg))",
                            border: "1px solid var(--card-border)",
                            boxShadow: "var(--card-shadow-hover)",
                        }}
                    >
                        {links.map(link => (
                            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                                <div
                                    className="px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer"
                                    style={isActive(link.href)
                                        ? { color: "rgb(99,102,241)", background: "rgba(99,102,241,0.08)" }
                                        : { color: "rgb(var(--text-2))" }
                                    }
                                    {...(!isActive(link.href) ? hoverItem : {})}
                                >
                                    {link.label}
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UserMenu({
    profileHref,
    userRole,
    onLogout,
}: {
    profileHref: string;
    userRole: string | null;
    onLogout: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const menuItem = (children: React.ReactNode, onClick?: () => void) => (
        <div
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{ color: "rgb(var(--text-2))" }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgb(99,102,241)"; e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
            onClick={onClick}
        >
            {children}
        </div>
    );

    return (
        <div className="relative" ref={ref}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(v => !v)}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: "rgb(var(--text-2))" }}
                aria-label="Меню пользователя"
            >
                <User style={{ width: 18, height: 18 }} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-50"
                        style={{
                            background: "rgb(var(--card-bg))",
                            border: "1px solid var(--card-border)",
                            boxShadow: "var(--card-shadow-hover)",
                        }}
                    >
                        <Link href={profileHref} onClick={() => setOpen(false)}>
                            {menuItem(<><User className="h-4 w-4" />Профиль</>)}
                        </Link>
                        <Link href="/settings" onClick={() => setOpen(false)}>
                            {menuItem(<><Settings className="h-4 w-4" />Настройки</>)}
                        </Link>
                        {userRole === "ADMIN" && (
                            <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
                                <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer"
                                    style={{ color: "rgb(239,68,68)" }}>
                                    <ShieldCheck className="h-4 w-4" />
                                    Администрирование
                                </div>
                            </Link>
                        )}
                        <div style={{ height: 1, background: "var(--card-border)", margin: "0 12px" }} />
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all duration-150"
                            style={{ color: "rgb(var(--text-3))" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "rgb(239,68,68)"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                        >
                            <LogOut className="h-4 w-4" />
                            Выход
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Header ─────────────────────────────────────────────────────────────

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, userRole, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { setOpen: openPalette } = useCommandPalette();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const role = userRole ?? "JOBSEEKER";
    const nav = NAV[role] ?? NAV.JOBSEEKER;
    const profileHref = userRole === "EMPLOYER" ? "/employer/profile" : "/jobseeker/profile";

    return (
        <header className="header-glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="p-2 rounded-xl"
                            style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))" }}
                        >
                            <Briefcase className="h-5 w-5 text-white" />
                        </motion.div>
                        <span className="text-lg font-bold tracking-tight">
                            <span className="gradient-text">Labor</span>
                            <span style={{ color: "rgb(var(--text-1))" }}>Exchange</span>
                        </span>
                    </Link>

                    {/* Desktop Nav: 4 primary + "Ещё" dropdown */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-0.5 mx-4">
                            {nav.primary.map(link => (
                                <NavItem key={link.href} {...link} active={isActive(link.href)} />
                            ))}
                            {nav.more.length > 0 && (
                                <MoreDropdown links={nav.more} isActive={isActive} />
                            )}
                        </nav>
                    )}

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        {isAuthenticated && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openPalette(true)}
                                className="p-2 rounded-lg transition-all duration-200"
                                style={{ color: "rgb(var(--text-3))" }}
                                title="Поиск (⌘K)"
                                aria-label="Открыть палитру команд"
                            >
                                <Search style={{ width: 18, height: 18 }} />
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ color: "rgb(var(--text-2))" }}
                            aria-label="Переключить тему"
                        >
                            {theme === "dark"
                                ? <Sun style={{ width: 18, height: 18 }} />
                                : <Moon style={{ width: 18, height: 18 }} />}
                        </motion.button>

                        {isAuthenticated ? (
                            <>
                                <NotificationBell />
                                <UserMenu
                                    profileHref={profileHref}
                                    userRole={userRole}
                                    onLogout={logout}
                                />
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <button
                                        className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                                        style={{ color: "rgb(var(--text-2))" }}
                                        onMouseEnter={e => { e.currentTarget.style.color = "rgb(99,102,241)"; e.currentTarget.style.background = "rgba(99,102,241,0.07)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                                    >
                                        Вход
                                    </button>
                                </Link>
                                <Link href="/auth/register">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                        Начать
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: theme + burger */}
                    <div className="md:hidden flex items-center gap-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "rgb(var(--text-2))" }}
                            aria-label="Переключить тему"
                        >
                            {theme === "dark"
                                ? <Sun style={{ width: 18, height: 18 }} />
                                : <Moon style={{ width: 18, height: 18 }} />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "rgb(var(--text-2))" }}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t"
                        style={{ borderColor: "var(--header-border)", background: "var(--header-bg)", backdropFilter: "blur(20px)" }}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {isAuthenticated ? (
                                <>
                                    {[...nav.primary, ...nav.more].map(link => (
                                        <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                                            <div
                                                className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                                                style={isActive(link.href)
                                                    ? { color: "rgb(99,102,241)", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }
                                                    : { color: "rgb(var(--text-2))" }
                                                }
                                            >
                                                {link.label}
                                            </div>
                                        </Link>
                                    ))}
                                    <div style={{ height: 1, background: "var(--card-border)", margin: "8px 0" }} />
                                    <button
                                        onClick={() => { setIsMenuOpen(false); openPalette(true); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                                        style={{ color: "rgb(var(--text-2))" }}
                                    >
                                        <Search className="h-4 w-4" />
                                        Поиск (⌘K)
                                    </button>
                                    <Link href={profileHref} onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                            <User className="h-4 w-4" />Профиль
                                        </div>
                                    </Link>
                                    <Link href="/notifications" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                            <Bell className="h-4 w-4" />Уведомления
                                        </div>
                                    </Link>
                                    <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                            <Settings className="h-4 w-4" />Настройки
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                                        style={{ color: "rgb(239,68,68)" }}
                                    >
                                        <LogOut className="h-4 w-4" />Выход
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                                        <div className="px-4 py-2.5 rounded-lg text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                            Вход
                                        </div>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                                        <div className="px-4 py-2.5 rounded-lg text-sm font-medium text-white btn-primary text-center mt-1">
                                            Начать бесплатно
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
