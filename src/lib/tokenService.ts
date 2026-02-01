import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/types";

const TOKEN_KEY = "auth_token";

export const tokenService = {
    getToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(TOKEN_KEY);
    },

    decodeToken: (): DecodedToken | null => {
        const token = tokenService.getToken();
        if (!token) return null;

        try {
            return jwtDecode<DecodedToken>(token);
        } catch (error) {
            console.error("Failed to decode token:", error);
            return null;
        }
    },

    isTokenExpired: (): boolean => {
        const decoded = tokenService.decodeToken();
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    },

    getUserId: (): number | null => {
        const decoded = tokenService.decodeToken();
        return decoded?.userId ?? null;
    },

    getUserRole: (): string | null => {
        const decoded = tokenService.decodeToken();
        return decoded?.userRole ?? null;
    },

    isAuthenticated: (): boolean => {
        return !!tokenService.getToken() && !tokenService.isTokenExpired();
    },
};