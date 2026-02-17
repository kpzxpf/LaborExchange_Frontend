"use client";

import { apiClient } from "@/lib/apiClient";
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    VacancyDto,
    CompanyDto,
    ResumeDto,
    EducationDto,
    SkillDto,
    ApplicationRequestDto,
    ApplicationResponseDto,
    ApplicationStatisticsDto,
    PageResponse,
} from "@/types";

// Auth Service
export const authService = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
        return response.data;
    },

    validateToken: async (token: string): Promise<boolean> => {
        const response = await apiClient.get<boolean>("/api/auth/validate", {
            params: { token },
        });
        return response.data;
    },
};

// Vacancy Service
export const vacancyService = {
    getAll: async (page = 0, size = 10): Promise<PageResponse<VacancyDto>> => {
        const response = await apiClient.get<PageResponse<VacancyDto>>("/api/vacancies", {
            params: { page, size },
        });
        return response.data;
    },

    getById: async (id: number): Promise<VacancyDto> => {
        const response = await apiClient.get<VacancyDto>(`/api/vacancies/${id}`);
        return response.data;
    },

    getByEmployer: async (employerId: number, page = 0, size = 10): Promise<PageResponse<VacancyDto>> => {
        const response = await apiClient.get<PageResponse<VacancyDto>>(
            `/api/vacancies/employer/${employerId}`,
            { params: { page, size } }
        );
        return response.data;
    },

    create: async (data: Omit<VacancyDto, "id">): Promise<VacancyDto> => {
        const response = await apiClient.post<VacancyDto>("/api/vacancies", data);
        return response.data;
    },

    update: async (data: VacancyDto): Promise<VacancyDto> => {
        const response = await apiClient.post<VacancyDto>("/api/vacancies/update", data);
        return response.data;
    },

    publish: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/vacancies/${id}/publish`);
    },

    unpublish: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/vacancies/${id}/unpublish`);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/vacancies/${id}`);
    },
};

// Company Service
export const companyService = {
    getAll: async (): Promise<CompanyDto[]> => {
        const response = await apiClient.get<CompanyDto[]>("/api/companies");
        return response.data;
    },

    getById: async (id: number): Promise<CompanyDto> => {
        const response = await apiClient.get<CompanyDto>(`/api/companies/${id}`);
        return response.data;
    },

    create: async (data: Omit<CompanyDto, "id">): Promise<CompanyDto> => {
        const response = await apiClient.post<CompanyDto>("/api/companies", data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/companies/${id}`);
    },
};

// Resume Service — основной для страницы резюме
export const resumeService = {
    getAll: async (page = 0, size = 10): Promise<PageResponse<ResumeDto>> => {
        const response = await apiClient.get<PageResponse<ResumeDto>>("/api/resumes", {
            params: { page, size },
        });
        return response.data;
    },

    getById: async (id: number): Promise<ResumeDto> => {
        const response = await apiClient.get<ResumeDto>(`/api/resumes/${id}`);
        return response.data;
    },

    getByUser: async (userId: number): Promise<ResumeDto[]> => {
        const response = await apiClient.get<ResumeDto[]>(`/api/resumes/user/${userId}`);
        return response.data;
    },

    create: async (data: Omit<ResumeDto, "id">): Promise<ResumeDto> => {
        const response = await apiClient.post<ResumeDto>("/api/resumes", data);
        return response.data;
    },

    update: async (data: ResumeDto): Promise<ResumeDto> => {
        const response = await apiClient.post<ResumeDto>("/api/resumes/update", data);
        return response.data;
    },

    publish: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/resumes/${id}/publish`);
    },

    unpublish: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/resumes/${id}/unpublish`);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/resumes/${id}`);
    },
};

// Education Service — для отображения образования в резюме
export const educationService = {
    getByResume: async (resumeId: number): Promise<EducationDto[]> => {
        const response = await apiClient.get<EducationDto[]>(`/api/educations/resume/${resumeId}`);
        return response.data;
    },

    create: async (data: Omit<EducationDto, "id">): Promise<EducationDto> => {
        const response = await apiClient.post<EducationDto>("/api/educations", data);
        return response.data;
    },

    update: async (id: number, data: EducationDto): Promise<EducationDto> => {
        const response = await apiClient.put<EducationDto>(`/api/educations/${id}`, data);
        return response.data;
    },
};

// Skill Service — для отображения навыков в резюме
export const skillService = {
    getByResume: async (resumeId: number): Promise<SkillDto[]> => {
        const response = await apiClient.get<SkillDto[]>(`/api/skills/resume/${resumeId}`);
        return response.data;
    },

    create: async (data: Omit<SkillDto, "id">): Promise<SkillDto> => {
        const response = await apiClient.post<SkillDto>("/api/skills", data);
        return response.data;
    },

    update: async (id: number, data: SkillDto): Promise<SkillDto> => {
        const response = await apiClient.put<SkillDto>(`/api/skills/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/skills/${id}`);
    },
};

// Application Service
export const applicationService = {
    create: async (data: ApplicationRequestDto): Promise<ApplicationResponseDto> => {
        const response = await apiClient.post<ApplicationResponseDto>("/api/applications", data);
        return response.data;
    },

    getById: async (id: number): Promise<ApplicationResponseDto> => {
        const response = await apiClient.get<ApplicationResponseDto>(`/api/applications/${id}`);
        return response.data;
    },

    getByVacancy: async (vacancyId: number): Promise<ApplicationResponseDto[]> => {
        const response = await apiClient.get<ApplicationResponseDto[]>(
            `/api/applications/vacancy/${vacancyId}`
        );
        return response.data;
    },

    getByCandidate: async (candidateId: number): Promise<ApplicationResponseDto[]> => {
        const response = await apiClient.get<ApplicationResponseDto[]>(
            `/api/applications/candidate/${candidateId}`
        );
        return response.data;
    },

    reject: async (data: ApplicationRequestDto): Promise<ApplicationResponseDto> => {
        const response = await apiClient.post<ApplicationResponseDto>(
            "/api/applications/reject",
            data
        );
        return response.data;
    },

    withdraw: async (data: ApplicationRequestDto): Promise<ApplicationResponseDto> => {
        const response = await apiClient.post<ApplicationResponseDto>(
            "/api/applications/withdrawn",
            data
        );
        return response.data;
    },

    getByStatus: async (status: string): Promise<ApplicationResponseDto[]> => {
        const response = await apiClient.get<ApplicationResponseDto[]>(
            `/api/applications/status/${status}`
        );
        return response.data;
    },

    getByEmployer: async (employerId: number): Promise<ApplicationResponseDto[]> => {
        const response = await apiClient.get<ApplicationResponseDto[]>(
            `/api/applications/employer/${employerId}`
        );
        return response.data;
    },

    getStatistics: async (): Promise<ApplicationStatisticsDto> => {
        const response = await apiClient.get<ApplicationStatisticsDto>("/api/applications/statistics");
        return response.data;
    },

    getEmployerStatistics: async (employerId: number): Promise<ApplicationStatisticsDto> => {
        const response = await apiClient.get<ApplicationStatisticsDto>(
            `/api/applications/employer/${employerId}/statistics`
        );
        return response.data;
    },
};