// ======================== AUTH ========================
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
    userRole: string;
}

export interface AuthResponse {
    token: string;
}

export interface DecodedToken {
    userId: number;
    userRole: string;
    role?: string;
    sub: string;
    exp: number;
    iat: number;
}

// ======================== USER ========================
export interface UserDto {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    roleName?: string;
}

// ======================== VACANCY ========================
export interface VacancyDto {
    id: number;
    title: string;
    description: string;
    companyName: string;
    employerId: number;
    salary?: number | null;
    isPublished: boolean;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    createdAt?: string;
}

// ======================== COMPANY ========================
export interface CompanyDto {
    id: number;
    employerId?: number;
    name: string;
    description?: string;
    location: string;
    email: string;
    phoneNumber?: string;
    website?: string;
}

// ======================== RESUME ========================
export interface ResumeDto {
    id: number;
    userId: number;
    title: string;
    summary?: string;
    experienceYears?: number;
    contactEmail?: string;
    contactPhone?: string;
    isPublished?: boolean;
}

// ======================== EDUCATION ========================
export interface EducationDto {
    id?: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    resumeId?: number;
}

// ======================== SKILL ========================
export interface SkillDto {
    id: number;
    name: string;
}

// ======================== APPLICATION ========================
export interface ApplicationRequestDto {
    id?: number;
    vacancyId: number;
    employerId: number;
    candidateId: number;
    resumeId: number;
}

export interface ApplicationResponseDto {
    id: number;
    vacancyId: number;
    candidateId: number;
    resumeId: number;
    employerId: number;
    statusName?: string;
    vacancyTitle?: string;
    companyName?: string;
    candidateName?: string;
    candidateEmail?: string;
    resumeTitle?: string;
    createdAt: string;
}

export interface ApplicationStatisticsDto {
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    activeApplications: number;
    withdrawalRate: number;
}

// ======================== SEARCH ========================
export interface VacancySearchRequest {
    query?: string;
    skills?: string[];
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    size?: number;
}

export interface VacancySearchResponse {
    id: string;
    title: string;
    description: string;
    companyName: string;
    location?: string;
    salary?: number;
    skills?: string[];
    createdAt?: string;
}

export interface ResumeSearchRequest {
    query?: string;
    skills?: string[];
    experienceYearsMin?: number;
    experienceYearsMax?: number;
    page?: number;
    size?: number;
}

export interface ResumeSearchResponse {
    id: string;
    title: string;
    summary?: string;
    experienceYears?: number;
    skills?: string[];
    institutions?: string[];
}

export interface SearchPageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// ======================== PAGINATION ========================
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number?: number;
    size?: number;
}

// ======================== API ERROR ========================
export interface ApiError {
    message?: string;
    errors?: Record<string, string>;
    status?: number;
}