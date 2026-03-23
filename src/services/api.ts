import axios from 'axios';
import { tokenService } from '@/lib/tokenService';
import {
    LoginRequest, RegisterRequest, AuthResponse,
    UserDto, VacancyDto, CompanyDto, ResumeDto, EducationDto, SkillDto,
    ApplicationRequestDto, ApplicationResponseDto, ApplicationStatisticsDto,
    VacancySearchRequest, VacancySearchResponse,
    ResumeSearchRequest, ResumeSearchResponse,
    SearchPageResponse, PageResponse,
    AiResumeRequestDto, AiResumeResponseDto,
    WorkExperienceDto,
    VacancyStatsDto, EmployerDashboardDto, ResumeStatsDto,
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
    forgotPassword: (email: string) =>
        api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string) =>
        api.post('/api/auth/reset-password', { token, newPassword }),
    verifyEmail: (token: string) =>
        api.get('/api/auth/verify-email', { params: { token } }),
};

// ======================== USER ========================
export const userService = {
    getProfile: (id: number) => api.get<UserDto>(`/api/users/${id}/profile`).then(r => r.data),
    update: (id: number, data: Partial<UserDto>) =>
        api.put<UserDto>(`/api/users/${id}`, data).then(r => r.data),
    changePassword: (id: number, data: { oldPassword: string; newPassword: string }) =>
        api.put(`/api/users/${id}/password`, data),
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
    getMyCompany: () => api.get<CompanyDto>('/api/companies/my').then(r => r.data || null),
    getByEmployerId: (employerId: number) =>
        api.get<CompanyDto>(`/api/companies/employer/${employerId}`).then(r => r.data || null),
    create: (data: Omit<CompanyDto, 'id'>) =>
        api.post<CompanyDto>('/api/companies', data).then(r => r.data),
    update: (id: number, data: Partial<CompanyDto>) =>
        api.put<CompanyDto>(`/api/companies/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/api/companies/${id}`),
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
    generateWithAi: (data: AiResumeRequestDto): Promise<AiResumeResponseDto> =>
        api.post<AiResumeResponseDto>('/api/resumes/ai/generate', data).then(r => r.data),
    exportPdf: async (id: number): Promise<void> => {
        const response = await api.get(`/api/resumes/${id}/export/pdf`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    },
};

// ======================== WORK EXPERIENCE ========================
export const workExperienceService = {
    getByResume: (resumeId: number) =>
        api.get<WorkExperienceDto[]>(`/api/work-experience/resume/${resumeId}`).then(r => r.data),
    create: (data: WorkExperienceDto): Promise<WorkExperienceDto> =>
        api.post<WorkExperienceDto>('/api/work-experience', data).then(r => r.data),
    update: (id: number, data: WorkExperienceDto): Promise<WorkExperienceDto> =>
        api.put<WorkExperienceDto>(`/api/work-experience/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/api/work-experience/${id}`),
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
            params: new URLSearchParams(ids.map(id => ['ids', id.toString()])),
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
function buildSearchParams(params: Record<string, unknown>): URLSearchParams {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value == null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach(v => sp.append(key, String(v)));
        } else {
            sp.set(key, String(value));
        }
    });
    return sp;
}

export const searchService = {
    searchVacancies: (params: VacancySearchRequest): Promise<SearchPageResponse<VacancySearchResponse>> =>
        api.get('/api/search/vacancies', { params: buildSearchParams(params as Record<string, unknown>) }).then(r => r.data),
    searchResumes: (params: ResumeSearchRequest): Promise<SearchPageResponse<ResumeSearchResponse>> =>
        api.get('/api/search/resumes', { params: buildSearchParams(params as Record<string, unknown>) }).then(r => r.data),
    getRecommendations: (skills: string[], location?: string, salaryMin?: number, page = 0, size = 10): Promise<SearchPageResponse<VacancySearchResponse>> => {
        const params = new URLSearchParams();
        skills.forEach(s => params.append('skills', s));
        if (location) params.set('location', location);
        if (salaryMin != null) params.set('salaryMin', String(salaryMin));
        params.set('page', String(page));
        params.set('size', String(size));
        return api.get('/api/search/vacancies/recommendations', { params }).then(r => r.data);
    },
};

// ======================== STATS ========================
export const statsService = {
    getEmployerDashboard: (): Promise<EmployerDashboardDto> =>
        api.get<EmployerDashboardDto>('/api/stats/employer').then(r => r.data),
    getVacancyStats: (vacancyId: number): Promise<VacancyStatsDto> =>
        api.get<VacancyStatsDto>(`/api/stats/vacancies/${vacancyId}`).then(r => r.data),
    getResumeStats: (resumeId: number): Promise<ResumeStatsDto> =>
        api.get<ResumeStatsDto>(`/api/stats/resumes/${resumeId}`).then(r => r.data),
};

// ======================== CHAT ========================
export interface MessageDto {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: string;
    read: boolean;
}

export interface ConversationDto {
    id: number;
    user1Id: number;
    user2Id: number;
    otherUserId: number;
    createdAt: string;
    lastMessage?: MessageDto;
    unreadCount: number;
}

export const chatService = {
    getConversations: (): Promise<ConversationDto[]> =>
        api.get<ConversationDto[]>('/api/chat/conversations').then(r => r.data),
    getOrCreate: (recipientId: number): Promise<ConversationDto> =>
        api.post<ConversationDto>('/api/chat/conversations', null, { params: { recipientId } }).then(r => r.data),
    getConversation: (id: number): Promise<ConversationDto> =>
        api.get<ConversationDto>(`/api/chat/conversations/${id}`).then(r => r.data),
    getMessages: (conversationId: number, page = 0, size = 30): Promise<PageResponse<MessageDto>> =>
        api.get<PageResponse<MessageDto>>(`/api/chat/conversations/${conversationId}/messages`, { params: { page, size } }).then(r => r.data),
    sendMessage: (conversationId: number, content: string): Promise<MessageDto> =>
        api.post<MessageDto>(`/api/chat/conversations/${conversationId}/messages`, { content }).then(r => r.data),
    markRead: (conversationId: number) =>
        api.patch(`/api/chat/conversations/${conversationId}/read`),
};

// ======================== ADMIN ========================
export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    roleName: string;
    emailVerified: boolean;
    active: boolean;
    createdAt: string;
}

export const adminService = {
    getUsers: (page = 0, size = 20): Promise<PageResponse<AdminUserDto>> =>
        api.get<PageResponse<AdminUserDto>>('/api/admin/users', { params: { page, size } }).then(r => r.data),
    deactivateUser: (userId: number) =>
        api.patch(`/api/admin/users/${userId}/deactivate`),
    activateUser: (userId: number) =>
        api.patch(`/api/admin/users/${userId}/activate`),
    deleteUser: (userId: number) =>
        api.delete(`/api/admin/users/${userId}`),
};

// ======================== FAVORITES ========================
export type FavoriteItemType = 'VACANCY' | 'RESUME';

export interface FavoriteDto {
    id: number;
    userId: number;
    itemId: number;
    itemType: FavoriteItemType;
    createdAt: string;
}

export const favoriteService = {
    add: (itemId: number, itemType: FavoriteItemType): Promise<FavoriteDto> =>
        api.post<FavoriteDto>('/api/favorites', { itemId, itemType }).then(r => r.data),
    remove: (itemId: number, itemType: FavoriteItemType) =>
        api.delete('/api/favorites', { params: { itemId, itemType } }),
    getByType: (itemType: FavoriteItemType): Promise<FavoriteDto[]> =>
        api.get<FavoriteDto[]>('/api/favorites', { params: { itemType } }).then(r => r.data),
    isFavorite: (itemId: number, itemType: FavoriteItemType): Promise<boolean> =>
        api.get<boolean>('/api/favorites/check', { params: { itemId, itemType } }).then(r => r.data),
};

// ======================== ALERT SUBSCRIPTIONS ========================
export const alertService = {
  getMySubscriptions: () =>
    api.get('/api/alerts'),

  create: (data: {
    keywords?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    employmentType?: string;
    workFormat?: string;
    skillIds?: number[];
  }) => api.post('/api/alerts', data),

  toggle: (id: number) =>
    api.patch(`/api/alerts/${id}/toggle`),

  delete: (id: number) =>
    api.delete(`/api/alerts/${id}`),
};

// ======================== COMPANY REVIEWS ========================
export const reviewService = {
  getByCompany: (companyId: number, page = 0, size = 10) =>
    api.get(`/api/reviews/company/${companyId}`, { params: { page, size } }),

  getSummary: (companyId: number) =>
    api.get(`/api/reviews/company/${companyId}/summary`),

  create: (companyId: number, data: { rating: number; title: string; text: string }) =>
    api.post(`/api/reviews/company/${companyId}`, data),

  update: (reviewId: number, data: { rating: number; title: string; text: string }) =>
    api.put(`/api/reviews/${reviewId}`, data),

  delete: (reviewId: number) =>
    api.delete(`/api/reviews/${reviewId}`),
};

// ======================== SALARY ANALYTICS ========================
export const salaryService = {
  getStats: (params: { title?: string; location?: string; employmentType?: string }) =>
    api.get('/api/stats/salary', { params }),
};

// ======================== AUTOCOMPLETE SUGGESTIONS ========================
export const suggestService = {
  suggest: (q: string, type: 'vacancy' | 'company' | 'location' | 'skill' = 'vacancy') =>
    api.get('/api/search/suggest', { params: { q, type } }),
};

// ======================== BULK VACANCY OPERATIONS ========================
export const vacancyBulkService = {
  bulkPublish: (ids: number[]) =>
    api.post('/api/vacancies/bulk-publish', ids),

  bulkUnpublish: (ids: number[]) =>
    api.post('/api/vacancies/bulk-unpublish', ids),
};

export default api;
