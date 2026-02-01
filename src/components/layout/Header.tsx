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
        { href: "/employer/dashboard", label: "Dashboard" },
        { href: "/employer/vacancies", label: "My Vacancies" },
        { href: "/employer/companies", label: "Companies" },
        { href: "/employer/applications", label: "Applications" },
    ];

    const jobSeekerLinks = [
        { href: "/jobseeker/dashboard", label: "Dashboard" },
        { href: "/jobseeker/vacancies", label: "Find Jobs" },
        { href: "/jobseeker/resumes", label: "My Resumes" },
        { href: "/jobseeker/applications", label: "My Applications" },
    ];

    const links = userRole === "EMPLOYER" ? employerLinks : jobSeekerLinks;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="bg-primary-600 p-2 rounded-lg"
                        >
                            <Briefcase className="h-6 w-6 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold text-gray-900">
              Labor<span className="text-primary-600">Exchange</span>
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
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive(link.href)
                                                ? "bg-primary-100 text-primary-700"
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
                                <Link href={`/${userRole?.toLowerCase()}/profile`}>
                                    <Button variant="ghost" size="sm">
                                        <User className="h-4 w-4 mr-2" />
                                        Profile
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Get Started</Button>
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
                        className="md:hidden border-t border-gray-200 bg-white"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    {links.map((link) => (
                                        <Link key={link.href} href={link.href}>
                                            <div
                                                className={cn(
                                                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                                    isActive(link.href)
                                                        ? "bg-primary-100 text-primary-700"
                                                        : "text-gray-700 hover:bg-gray-100"
                                                )}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href={`/${userRole?.toLowerCase()}/profile`}>
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Profile
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </div>
                                    </Link>
                                    <Link href="/auth/register">
                                        <div
                                            className="block px-4 py-3 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started
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