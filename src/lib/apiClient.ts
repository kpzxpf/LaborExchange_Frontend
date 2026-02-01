import axios, { AxiosError } from "axios";
import { tokenService } from "./tokenService";
import type { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            tokenService.removeToken();
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        if (axiosError.response?.data?.errors) {
            const errors = Object.values(axiosError.response.data.errors);
            return errors.join(", ");
        }

        if (axiosError.message) {
            return axiosError.message;
        }
    }

    return "An unexpected error occurred";
};