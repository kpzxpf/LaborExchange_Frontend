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
    firstName?: string;
    lastName?: string;
    title: string;
    summary?: string;
    experienceYears?: number;
    location?: string;
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

// ======================== WORK EXPERIENCE ========================
export interface WorkExperienceDto {
    id?: number;
    resumeId?: number;
    companyName: string;
    position: string;
    description?: string;
    startYear: number;
    startMonth?: number;
    endYear?: number;
    endMonth?: number;
    isCurrent?: boolean;
}

// ======================== AI RESUME ========================
export interface AiResumeRequestDto {
    jobTitle: string;
    description: string;
    yearsOfExperience?: number;
    location?: string;
}

export interface AiResumeResponseDto {
    title: string;
    summary: string;
    location?: string;
    experienceYears?: number;
    suggestedSkillNames: string[];
    workExperiences: AiWorkExperienceItem[];
    educations: AiEducationItem[];
}

export interface AiWorkExperienceItem {
    companyName: string;
    position: string;
    description?: string;
    startYear?: number;
    startMonth?: number;
    endYear?: number;
    endMonth?: number;
    isCurrent?: boolean;
}

export interface AiEducationItem {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear?: number;
    endYear?: number;
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
    coverLetter?: string;
}

export interface ApplicationResponseDto {
    id: number;
    vacancyId: number;
    candidateId: number;
    resumeId: number;
    employerId: number;
    statusName?: string;
    statusCode?: string;
    vacancyTitle?: string;
    companyName?: string;
    candidateName?: string;
    candidateEmail?: string;
    resumeTitle?: string;
    coverLetter?: string;
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
    sortBy?: string;
    sortOrder?: string;
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
    location?: string;
    experienceYearsMin?: number;
    experienceYearsMax?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
}

export interface ResumeSearchResponse {
    id: string;
    title: string;
    summary?: string;
    experienceYears?: number;
    location?: string;
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

// ======================== STATISTICS ========================
export interface DailyPointDto {
    date: string;
    views: number;
}

export interface VacancyStatsDto {
    vacancyId: number;
    vacancyTitle: string;
    totalViews: number;
    uniqueViewers: number;
    viewsLast7Days: number;
    uniqueViewersLast7Days: number;
    lastViewedAt?: string;
    dailyViews: DailyPointDto[];
    totalApplications: number;
    newApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    conversionRate: number;
}

export interface ResumeStatsDto {
    resumeId: number;
    resumeTitle: string;
    totalViews: number;
    uniqueViewers: number;
    viewsLast7Days: number;
    uniqueViewersLast7Days: number;
    lastViewedAt?: string;
    dailyViews: DailyPointDto[];
}

export interface EmployerDashboardDto {
    totalViewsAllTime: number;
    totalViewsLast7Days: number;
    totalApplications: number;
    activeApplications: number;
    applicationsByStatus: Record<string, number>;
    overallConversionRate: number;
    topVacancies: {
        vacancyId: number;
        vacancyTitle: string;
        views: number;
        applications: number;
        conversionRate: number;
        lastViewedAt?: string;
    }[];
    dailyViews: DailyPointDto[];
}

// ======================== SALARY ANALYTICS ========================
export interface SalaryStatsDto {
    query?: string | null;
    location?: string | null;
    medianSalary: number | null;
    averageSalary: number | null;
    minSalary: number | null;
    maxSalary: number | null;
    p25Salary: number | null;
    p75Salary: number | null;
    totalVacancies: number;
}

// ======================== API ERROR ========================
export interface ApiError {
    message?: string;
    errors?: Record<string, string>;
    status?: number;
}