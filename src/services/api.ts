import axios from 'axios';
import { tokenService } from '@/lib/tokenService';
import {
    LoginRequest, RegisterRequest, AuthResponse,
    UserDto, VacancyDto, CompanyDto, ResumeDto, EducationDto, SkillDto,
    ApplicationRequestDto, ApplicationResponseDto, ApplicationStatisticsDto,
    VacancySearchRequest, VacancySearchResponse,
    ResumeSearchRequest, ResumeSearchResponse,
    SearchPageResponse, PageResponse
} from '@/types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = tokenService.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            tokenService.removeToken();
            window.location.href = '/auth/login';
        }
        return Promise.reject(err);
    }
);

// ======================== AUTH ========================
export const authService = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/api/auth/login', data).then(r => r.data),
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/api/auth/register', data).then(r => r.data),
};

// ======================== USER ========================
export const userService = {
    getProfile: (id: number) => api.get<UserDto>(`/api/users/${id}/profile`).then(r => r.data),
    update: (id: number, data: Partial<UserDto>) =>
        api.put<UserDto>(`/api/users/${id}`, data).then(r => r.data),
};

// ======================== VACANCY ========================
export const vacancyService = {
    getAll: (page = 0, size = 10) =>
        api.get<PageResponse<VacancyDto>>('/api/vacancies', { params: { page, size } }).then(r => r.data),
    getById: (id: number) => api.get<VacancyDto>(`/api/vacancies/${id}`).then(r => r.data),
    getByEmployer: (employerId: number, page = 0, size = 10) =>
        api.get<PageResponse<VacancyDto>>(`/api/vacancies/employer/${employerId}`, { params: { page, size } }).then(r => r.data),
    getPublished: (page = 0, size = 10) =>
        api.get<PageResponse<VacancyDto>>('/api/vacancies', { params: { page, size } }).then(r => r.data),
    create: (data: Omit<VacancyDto, 'id'>) =>
        api.post<VacancyDto>('/api/vacancies', data).then(r => r.data),
    update: (id: number, data: Partial<VacancyDto>) =>
        api.put<VacancyDto>(`/api/vacancies/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/api/vacancies/${id}`),
    publish: (id: number) => api.patch(`/api/vacancies/${id}/publish`),
    unpublish: (id: number) => api.patch(`/api/vacancies/${id}/unpublish`),
    getSkillIds: (id: number) =>
        api.get<number[]>(`/api/vacancies/${id}/skills`).then(r => r.data),
    addSkill: (id: number, skillId: number) =>
        api.post(`/api/vacancies/${id}/skills/${skillId}`),
    removeSkill: (id: number, skillId: number) =>
        api.delete(`/api/vacancies/${id}/skills/${skillId}`),
    setSkills: (id: number, skillIds: number[]) =>
        api.put(`/api/vacancies/${id}/skills`, skillIds),
};

// ======================== COMPANY ========================
export const companyService = {
    getAll: () => api.get<CompanyDto[]>('/api/companies').then(r => r.data),
    getById: (id: number) => api.get<CompanyDto>(`/api/companies/${id}`).then(r => r.data),
    getMyCompany: () => api.get<CompanyDto>('/api/companies/my').then(r => r.data),
    getByEmployerId: (employerId: number) =>
        api.get<CompanyDto>(`/api/companies/employer/${employerId}`).then(r => r.data),
    create: (data: Omit<CompanyDto, 'id'>) =>
        api.post<CompanyDto>('/api/companies', data).then(r => r.data),
    update: (id: number, data: Partial<CompanyDto>) =>
        api.put<CompanyDto>(`/api/companies/${id}`, data).then(r => r.data),
};

// ======================== RESUME ========================
export const resumeService = {
    getAll: (page = 0, size = 10) =>
        api.get<PageResponse<ResumeDto>>('/api/resumes', { params: { page, size } }).then(r => r.data),
    getById: (id: number) => api.get<ResumeDto>(`/api/resumes/${id}`).then(r => r.data),
    getMy: () => api.get<ResumeDto[]>('/api/resumes/my').then(r => r.data),
    create: (data: Omit<ResumeDto, 'id'>) =>
        api.post<ResumeDto>('/api/resumes', data).then(r => r.data),
    update: (id: number, data: Partial<ResumeDto>) =>
        api.put<ResumeDto>(`/api/resumes/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/api/resumes/${id}`),
    publish: (id: number) => api.patch(`/api/resumes/${id}/publish`),
    unpublish: (id: number) => api.patch(`/api/resumes/${id}/unpublish`),
    getSkillIds: (id: number): Promise<number[]> =>
        api.get<number[]>(`/api/resumes/${id}/skills`).then(r => r.data),
    addSkill: (resumeId: number, skillId: number) =>
        api.post(`/api/resumes/${resumeId}/skills/${skillId}`),
    removeSkill: (resumeId: number, skillId: number) =>
        api.delete(`/api/resumes/${resumeId}/skills/${skillId}`),
    setSkills: (resumeId: number, skillIds: number[]) =>
        api.put(`/api/resumes/${resumeId}/skills`, skillIds),
};

// ======================== EDUCATION ========================
export const educationService = {
    getByResume: (resumeId: number) =>
        api.get<EducationDto[]>(`/api/educations/resume/${resumeId}`).then(r => r.data),
    create: (resumeId: number, data: Omit<EducationDto, 'id'>) =>
        api.post<EducationDto>('/api/educations', { ...data, resumeId }).then(r => r.data),
    update: (resumeId: number, id: number, data: Partial<EducationDto>) =>
        api.put<EducationDto>(`/api/educations/${id}`, { ...data, resumeId }).then(r => r.data),
    delete: (resumeId: number, id: number) =>
        api.delete(`/api/educations/${id}`),
};

// ======================== SKILL ========================
export const skillService = {
    getAll: () => api.get<SkillDto[]>('/api/skills').then(r => r.data),
    getById: (id: number) => api.get<SkillDto>(`/api/skills/${id}`).then(r => r.data),
    create: (name: string) =>
        api.post<SkillDto>('/api/skills', { name }).then(r => r.data),
    update: (id: number, name: string) =>
        api.put<SkillDto>(`/api/skills/${id}`, { name }).then(r => r.data),
    delete: (id: number) => api.delete(`/api/skills/${id}`),
    getNamesByIds: (ids: number[]): Promise<string[]> => {
        if (!ids || ids.length === 0) return Promise.resolve([]);
        return api.get<string[]>('/api/skills/names/by-ids', {
            params: { ids: ids.join(',') },
        }).then(r => r.data);
    },
    getByIds: async (ids: number[]): Promise<SkillDto[]> => {
        if (!ids || ids.length === 0) return [];
        const all = await api.get<SkillDto[]>('/api/skills').then(r => r.data);
        return all.filter(s => ids.includes(s.id));
    },
    getSkillsForResume: async (resumeId: number): Promise<SkillDto[]> => {
        const ids = await resumeService.getSkillIds(resumeId);
        return skillService.getByIds(ids);
    },
    getSkillsForVacancy: async (vacancyId: number): Promise<SkillDto[]> => {
        const ids = await vacancyService.getSkillIds(vacancyId);
        return skillService.getByIds(ids);
    },
    findOrCreate: async (name: string): Promise<SkillDto> => {
        const all = await api.get<SkillDto[]>('/api/skills').then(r => r.data);
        const existing = all.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        return api.post<SkillDto>('/api/skills', { name }).then(r => r.data);
    },
};

// ======================== APPLICATION ========================
export const applicationService = {
    create: (data: ApplicationRequestDto) =>
        api.post<ApplicationResponseDto>('/api/applications', data).then(r => r.data),
    getById: (id: number) =>
        api.get<ApplicationResponseDto>(`/api/applications/${id}`).then(r => r.data),
    getMy: () =>
        api.get<ApplicationResponseDto[]>('/api/applications/my').then(r => r.data),
    getByVacancy: (vacancyId: number) =>
        api.get<ApplicationResponseDto[]>(`/api/applications/vacancy/${vacancyId}`).then(r => r.data),
    getByEmployer: (employerId: number) =>
        api.get<ApplicationResponseDto[]>(`/api/applications/employer/${employerId}`).then(r => r.data),
    accept: (id: number) => api.patch(`/api/applications/${id}/accept`),
    reject: (id: number) => api.patch(`/api/applications/${id}/reject`),
    withdraw: (id: number) => api.patch(`/api/applications/${id}/withdraw`),
    getStatistics: (employerId: number): Promise<ApplicationStatisticsDto> =>
        api.get<ApplicationStatisticsDto>(`/api/applications/employer/${employerId}/statistics`).then(r => r.data),
};

// ======================== SEARCH ========================
export const searchService = {
    searchVacancies: (params: VacancySearchRequest): Promise<SearchPageResponse<VacancySearchResponse>> =>
        api.get('/api/search/vacancies', { params }).then(r => r.data),
    searchResumes: (params: ResumeSearchRequest): Promise<SearchPageResponse<ResumeSearchResponse>> =>
        api.get('/api/search/resumes', { params }).then(r => r.data),
};

export default api;
