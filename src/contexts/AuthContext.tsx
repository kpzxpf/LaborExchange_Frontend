"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { tokenService } from "@/lib/tokenService";
import { authService } from "@/services/api";
import type { LoginRequest, RegisterRequest } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
    isAuthenticated: boolean;
    userId: number | null;
    userRole: string | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = tokenService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                setUserId(tokenService.getUserId());
                setUserRole(tokenService.getUserRole());
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const response = await authService.login(data);
            tokenService.setToken(response.token);

            setIsAuthenticated(true);
            setUserId(tokenService.getUserId());
            setUserRole(tokenService.getUserRole());

            toast.success("Successfully logged in!");

            const role = tokenService.getUserRole();
            if (role === "EMPLOYER") {
                router.push("/employer/dashboard");
            } else {
                router.push("/jobseeker/dashboard");
            }
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await authService.register(data);
            tokenService.setToken(response.token);

            setIsAuthenticated(true);
            setUserId(tokenService.getUserId());
            setUserRole(tokenService.getUserRole());

            toast.success("Successfully registered!");

            if (data.userRole === "EMPLOYER") {
                router.push("/employer/dashboard");
            } else {
                router.push("/jobseeker/dashboard");
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
            throw error;
        }
    };

    const logout = () => {
        tokenService.removeToken();
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        toast.success("Logged out successfully");
        router.push("/");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, userId, userRole, login, register, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};