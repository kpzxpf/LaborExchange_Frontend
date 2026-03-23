'use client';

import axios from 'axios';
import { useState, useCallback, useEffect } from 'react';
import {
    authService, userService, vacancyService, companyService,
    resumeService, educationService, skillService, applicationService, searchService,
    workExperienceService, statsService, chatService, adminService,
    favoriteService, alertService, reviewService, salaryService,
    suggestService, vacancyBulkService,
} from '@/services/api';
import { tokenService } from '@/lib/tokenService';

// ─── Types ─────────────────────────────────────────────────────────────────

type Status = 'idle' | 'running' | 'ok' | 'error';
interface Result { status: Status; data?: unknown; error?: string; ms?: number }
type Results = Record<string, Result>;

type CycleStep = { step: string; status: 'running' | 'ok' | 'error'; data?: unknown; error?: string; ms?: number };

// ─── Helpers ───────────────────────────────────────────────────────────────

function decode(token: string | null) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function TestPage() {
    const [results, setResults] = useState<Results>({});
    const [cfg, setCfg] = useState({
        email: 'test@test.com', password: '12345678',
        regEmail: `test${Date.now()}@test.com`, regPassword: '12345678',
        regUsername: 'TestUser', regPhone: '+79001234567', regRole: 'EMPLOYER',
        userId: '1', vacancyId: '1', companyId: '1', resumeId: '1',
        educationId: '1', skillId: '1', applicationId: '1', employerId: '1',
        searchQuery: 'developer', skillName: 'TestSkill',
        workExperienceId: '1', conversationId: '1', alertId: '1',
        reviewId: '1', salaryTitle: 'Developer',
    });

    const [token, setToken] = useState<string | null>(null);
    useEffect(() => { setToken(tokenService.getToken()); }, []);
    const decoded = decode(token);

    // Full cycle state
    const [cycleLog, setCycleLog] = useState<CycleStep[]>([]);
    const [cycleRunning, setCycleRunning] = useState(false);

    const run = useCallback(async (id: string, fn: () => Promise<unknown>) => {
        setResults(r => ({ ...r, [id]: { status: 'running' } }));
        const t0 = Date.now();
        try {
            const data = await fn();
            setResults(r => ({ ...r, [id]: { status: 'ok', data, ms: Date.now() - t0 } }));
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
            const msg = err?.response?.data?.message ?? err?.message ?? String(e);
            const status = err?.response?.status;
            setResults(r => ({ ...r, [id]: { status: 'error', error: status ? `${status}: ${msg}` : msg, ms: Date.now() - t0 } }));
        }
    }, []);

    const n = (k: keyof typeof cfg) => Number(cfg[k]);

    // ─── Full Cycle ─────────────────────────────────────────────────────────

    const runFullCycle = useCallback(async () => {
        setCycleRunning(true);
        setCycleLog([]);

        const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const addStep = (step: string) =>
            setCycleLog(prev => [...prev, { step, status: 'running' }]);
        const updateStep = (step: string, update: Partial<CycleStep>) =>
            setCycleLog(prev => prev.map(s => s.step === step ? { ...s, ...update } : s));

        const doStep = async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
            addStep(name);
            const t0 = Date.now();
            try {
                const data = await fn();
                updateStep(name, { status: 'ok', data, ms: Date.now() - t0 });
                return data;
            } catch (e: unknown) {
                const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
                const msg = err?.response?.data?.message ?? err?.message ?? String(e);
                const status = err?.response?.status;
                updateStep(name, { status: 'error', error: status ? `${status}: ${msg}` : msg, ms: Date.now() - t0 });
                throw e;
            }
        };

        const decodeUserId = (t: string): number => {
            try { return JSON.parse(atob(t.split('.')[1])).userId; } catch { return 0; }
        };

        const makeApi = (t?: string) => {
            const inst = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });
            if (t) inst.defaults.headers.common['Authorization'] = `Bearer ${t}`;
            return inst;
        };

        const suffix = Date.now();
        const publicApi = makeApi();

        try {
            // ── Phase 1: Registration ────────────────────────────────────────
            const jsReg = await doStep<{ token: string }>('1. [AUTH] Register JOBSEEKER', () =>
                publicApi.post('/api/auth/register', {
                    username: `jobseeker_${suffix}`,
                    email: `js_${suffix}@test.com`,
                    phone: '+79001111111',
                    password: 'Password123!',
                    userRole: 'JOB_SEEKER',
                }).then(r => r.data)
            );

            const empReg = await doStep<{ token: string }>('2. [AUTH] Register EMPLOYER', () =>
                publicApi.post('/api/auth/register', {
                    username: `employer_${suffix}`,
                    email: `emp_${suffix}@test.com`,
                    phone: '+79002222222',
                    password: 'Password123!',
                    userRole: 'EMPLOYER',
                }).then(r => r.data)
            );

            const jsToken = jsReg.token;
            const empToken = empReg.token;
            const jsUserId = decodeUserId(jsToken);
            const empUserId = decodeUserId(empToken);
            const jsApi = makeApi(jsToken);
            const empApi = makeApi(empToken);

            // ── Phase 2: User profiles ───────────────────────────────────────
            await doStep('3. [JOBSEEKER] Get user profile', () =>
                jsApi.get(`/api/users/${jsUserId}/profile`).then(r => r.data)
            );
            await doStep('4. [JOBSEEKER] Update profile (add name)', () =>
                jsApi.put(`/api/users/${jsUserId}`, {
                    username: `jobseeker_${suffix}`,
                    email: `js_${suffix}@test.com`,
                    phone: '+79001111111',
                    firstName: 'Ivan',
                    lastName: 'Petrov',
                }).then(r => r.data)
            );
            await doStep('5. [EMPLOYER] Get user profile', () =>
                empApi.get(`/api/users/${empUserId}/profile`).then(r => r.data)
            );
            await doStep('6. [EMPLOYER] Update profile (add name)', () =>
                empApi.put(`/api/users/${empUserId}`, {
                    username: `employer_${suffix}`,
                    email: `emp_${suffix}@test.com`,
                    phone: '+79002222222',
                    firstName: 'Dmitry',
                    lastName: 'Ivanov',
                }).then(r => r.data)
            );

            // ── Phase 3: Skill ───────────────────────────────────────────────
            const skill = await doStep<{ id: number; name: string }>('7. [SKILL] Create skill', () =>
                empApi.post('/api/skills', { name: `TypeScript_${suffix}` }).then(r => r.data)
            );
            await doStep('8. [SKILL] Get all skills', () =>
                empApi.get('/api/skills').then(r => r.data)
            );
            await doStep('9. [SKILL] Get skill by id', () =>
                empApi.get(`/api/skills/${skill.id}`).then(r => r.data)
            );
            await doStep('10. [SKILL] Get skill names by ids', () =>
                empApi.get('/api/skills/names/by-ids', { params: new URLSearchParams([['ids', String(skill.id)]]) }).then(r => r.data)
            );
            await doStep('11. [SKILL] Update skill name', () =>
                empApi.put(`/api/skills/${skill.id}`, { name: `TypeScript_upd_${suffix}` }).then(r => r.data)
            );

            // ── Phase 4: Company ─────────────────────────────────────────────
            const company = await doStep<{ id: number }>('12. [EMPLOYER] Create company', () =>
                empApi.post('/api/companies', {
                    name: `TechCorp_${suffix}`,
                    location: 'Moscow',
                    email: `corp_${suffix}@test.com`,
                    description: 'A great tech company',
                    phoneNumber: '+79001234567',
                    website: 'https://techcorp.example.com',
                }).then(r => r.data)
            );
            await doStep('13. [EMPLOYER] Get company by id', () =>
                empApi.get(`/api/companies/${company.id}`).then(r => r.data)
            );
            await doStep('14. [EMPLOYER] Get my company', () =>
                empApi.get('/api/companies/my').then(r => r.data)
            );
            await doStep('15. [EMPLOYER] Get company by employerId', () =>
                empApi.get(`/api/companies/employer/${empUserId}`).then(r => r.data)
            );
            await doStep('16. [ALL] Get all companies', () =>
                empApi.get('/api/companies').then(r => r.data)
            );
            await doStep('17. [EMPLOYER] Update company (add phone)', () =>
                empApi.put(`/api/companies/${company.id}`, {
                    name: `TechCorp_${suffix}`,
                    location: 'Moscow',
                    email: `corp_${suffix}@test.com`,
                    description: 'A great tech company',
                    phoneNumber: '+79009999999',
                    website: 'https://techcorp.example.com',
                }).then(r => r.data)
            );

            // ── Phase 5: Vacancy ─────────────────────────────────────────────
            const vacancy = await doStep<{ id: number }>('18. [EMPLOYER] Create vacancy', () =>
                empApi.post('/api/vacancies', {
                    title: 'Senior TypeScript Developer',
                    description: 'We are looking for a skilled TypeScript developer with React experience',
                    companyName: `TechCorp_${suffix}`,
                    employerId: empUserId,
                    salary: 250000,
                    isPublished: false,
                    location: 'Moscow',
                    employmentType: 'FULL_TIME',
                    experienceLevel: 'SENIOR',
                }).then(r => r.data)
            );
            await doStep('19. [EMPLOYER] Get vacancy by id', () =>
                empApi.get(`/api/vacancies/${vacancy.id}`).then(r => r.data)
            );
            await doStep('20. [EMPLOYER] Get vacancies by employer', () =>
                empApi.get(`/api/vacancies/employer/${empUserId}`).then(r => r.data)
            );
            await doStep('21. [EMPLOYER] Update vacancy (raise salary)', () =>
                empApi.put(`/api/vacancies/${vacancy.id}`, {
                    title: 'Senior TypeScript Developer',
                    description: 'We are looking for a skilled TypeScript developer with React experience',
                    companyName: `TechCorp_${suffix}`,
                    employerId: empUserId,
                    salary: 300000,
                    isPublished: false,
                    location: 'Moscow',
                    employmentType: 'FULL_TIME',
                    experienceLevel: 'SENIOR',
                }).then(r => r.data)
            );
            await doStep('22. [EMPLOYER] Add skill to vacancy', () =>
                empApi.post(`/api/vacancies/${vacancy.id}/skills/${skill.id}`).then(r => r.data)
            );
            await doStep('23. [EMPLOYER] Get vacancy skill ids', () =>
                empApi.get(`/api/vacancies/${vacancy.id}/skills`).then(r => r.data)
            );
            await doStep('24. [EMPLOYER] Publish vacancy', () =>
                empApi.patch(`/api/vacancies/${vacancy.id}/publish`).then(r => r.data)
            );
            await doStep('25. [ALL] Get all vacancies (paginated)', () =>
                empApi.get('/api/vacancies', { params: { page: 0, size: 5 } }).then(r => r.data)
            );

            // ── Phase 6: Resume ──────────────────────────────────────────────
            const resume = await doStep<{ id: number }>('26. [JOBSEEKER] Create resume', () =>
                jsApi.post('/api/resumes', {
                    userId: jsUserId,
                    title: 'Full-Stack TypeScript Developer',
                    summary: 'Experienced developer seeking new opportunities',
                    experienceYears: 5,
                    contactEmail: `js_${suffix}@test.com`,
                    contactPhone: '+79001111111',
                    isPublished: false,
                }).then(r => r.data)
            );
            await doStep('27. [JOBSEEKER] Get resume by id', () =>
                jsApi.get(`/api/resumes/${resume.id}`).then(r => r.data)
            );
            await doStep('28. [JOBSEEKER] Get my resumes', () =>
                jsApi.get('/api/resumes/my').then(r => r.data)
            );
            await doStep('29. [ALL] Get all resumes (paginated)', () =>
                empApi.get('/api/resumes', { params: { page: 0, size: 5 } }).then(r => r.data)
            );
            await doStep('30. [JOBSEEKER] Update resume (improve summary)', () =>
                jsApi.put(`/api/resumes/${resume.id}`, {
                    userId: jsUserId,
                    title: 'Full-Stack TypeScript Developer',
                    summary: 'Senior TypeScript developer with 5 years of hands-on experience',
                    experienceYears: 5,
                    contactEmail: `js_${suffix}@test.com`,
                    contactPhone: '+79001111111',
                    isPublished: false,
                }).then(r => r.data)
            );

            // ── Phase 7: Education ───────────────────────────────────────────
            const education = await doStep<{ id: number }>('31. [JOBSEEKER] Add education', () =>
                jsApi.post('/api/educations', {
                    resumeId: resume.id,
                    institution: 'Moscow State University',
                    degree: 'Bachelor',
                    fieldOfStudy: 'Computer Science',
                    startYear: 2015,
                    endYear: 2019,
                }).then(r => r.data)
            );
            await doStep('32. [JOBSEEKER] Get education by resume', () =>
                jsApi.get(`/api/educations/resume/${resume.id}`).then(r => r.data)
            );
            await doStep('33. [JOBSEEKER] Update education (to Master)', () =>
                jsApi.put(`/api/educations/${education.id}`, {
                    resumeId: resume.id,
                    institution: 'Moscow State University',
                    degree: 'Master',
                    fieldOfStudy: 'Computer Science',
                    startYear: 2015,
                    endYear: 2021,
                }).then(r => r.data)
            );

            // ── Phase 8: Resume skills & publish ─────────────────────────────
            await doStep('34. [JOBSEEKER] Add skill to resume', () =>
                jsApi.post(`/api/resumes/${resume.id}/skills/${skill.id}`).then(r => r.data)
            );
            await doStep('35. [JOBSEEKER] Get resume skill ids', () =>
                jsApi.get(`/api/resumes/${resume.id}/skills`).then(r => r.data)
            );
            await doStep('36. [JOBSEEKER] Publish resume', () =>
                jsApi.patch(`/api/resumes/${resume.id}/publish`).then(r => r.data)
            );

            // ── Phase 9: Search (Elasticsearch) ──────────────────────────────
            await doStep('37. [SEARCH] Search vacancies by query', () =>
                jsApi.get('/api/search/vacancies', { params: { query: 'TypeScript', size: 5 } }).then(r => r.data)
            );
            await doStep('38. [SEARCH] Search resumes by query', () =>
                empApi.get('/api/search/resumes', { params: { query: 'TypeScript', size: 5 } }).then(r => r.data)
            );

            // ── Phase 10: Application ────────────────────────────────────────
            const application = await doStep<{ id: number }>('39. [JOBSEEKER] Apply to vacancy', () =>
                jsApi.post('/api/applications', {
                    vacancyId: vacancy.id,
                    employerId: empUserId,
                    candidateId: jsUserId,
                    resumeId: resume.id,
                }).then(r => r.data)
            );
            await doStep('40. [JOBSEEKER] Get my applications', () =>
                jsApi.get('/api/applications/my').then(r => r.data)
            );
            await doStep('41. [JOBSEEKER] Get application by id', () =>
                jsApi.get(`/api/applications/${application.id}`).then(r => r.data)
            );
            await doStep('42. [EMPLOYER] Get applications by vacancy', () =>
                empApi.get(`/api/applications/vacancy/${vacancy.id}`).then(r => r.data)
            );
            await doStep('43. [EMPLOYER] Get applications by employer', () =>
                empApi.get(`/api/applications/employer/${empUserId}`).then(r => r.data)
            );
            await doStep('44. [EMPLOYER] Get employer statistics', () =>
                empApi.get(`/api/applications/employer/${empUserId}/statistics`).then(r => r.data)
            );
            await doStep('45. [EMPLOYER] Accept application', () =>
                empApi.patch(`/api/applications/${application.id}/accept`).then(r => r.data)
            );
            await doStep('46. [JOBSEEKER] Get my applications (should be ACCEPTED)', () =>
                jsApi.get('/api/applications/my').then(r => r.data)
            );

            // ── Phase 11: Work Experience ────────────────────────────────
            const workExp = await doStep<{ id: number }>('47. [JOBSEEKER] Add work experience', () =>
                jsApi.post('/api/work-experience', {
                    resumeId: resume.id,
                    companyName: 'Previous Corp',
                    position: 'Junior Developer',
                    description: 'Worked on backend services',
                    startYear: 2019,
                    endYear: 2022,
                }).then(r => r.data)
            );
            await doStep('48. [JOBSEEKER] Get work experience by resume', () =>
                jsApi.get(`/api/work-experience/resume/${resume.id}`).then(r => r.data)
            );
            await doStep('49. [JOBSEEKER] Update work experience', () =>
                jsApi.put(`/api/work-experience/${workExp.id}`, {
                    resumeId: resume.id,
                    companyName: 'Previous Corp',
                    position: 'Middle Developer',
                    description: 'Led backend services team',
                    startYear: 2019,
                    endYear: 2022,
                }).then(r => r.data)
            );

            // ── Phase 12: Favorites ──────────────────────────────────────
            await doStep('50. [JOBSEEKER] Add vacancy to favorites', () =>
                jsApi.post('/api/favorites', { itemId: vacancy.id, itemType: 'VACANCY' }).then(r => r.data)
            );
            await doStep('51. [JOBSEEKER] Get favorite vacancies', () =>
                jsApi.get('/api/favorites', { params: { itemType: 'VACANCY' } }).then(r => r.data)
            );
            await doStep('52. [JOBSEEKER] Check is favorite', () =>
                jsApi.get('/api/favorites/check', { params: { itemId: vacancy.id, itemType: 'VACANCY' } }).then(r => r.data)
            );
            await doStep('53. [EMPLOYER] Add resume to favorites', () =>
                empApi.post('/api/favorites', { itemId: resume.id, itemType: 'RESUME' }).then(r => r.data)
            );

            // ── Phase 13: Job Alerts ─────────────────────────────────────
            const alert = await doStep<{ id: number }>('54. [JOBSEEKER] Create job alert subscription', () =>
                jsApi.post('/api/alerts', {
                    keywords: 'TypeScript',
                    location: 'Moscow',
                    minSalary: 100000,
                    employmentType: 'FULL_TIME',
                }).then(r => r.data)
            );
            await doStep('55. [JOBSEEKER] Get my alert subscriptions', () =>
                jsApi.get('/api/alerts').then(r => r.data)
            );
            await doStep('56. [JOBSEEKER] Toggle alert (disable)', () =>
                jsApi.patch(`/api/alerts/${alert.id}/toggle`).then(r => r.data)
            );

            // ── Phase 14: Company Reviews ────────────────────────────────
            const review = await doStep<{ id: number }>('57. [JOBSEEKER] Create company review', () =>
                jsApi.post(`/api/reviews/company/${company.id}`, {
                    rating: 4,
                    title: 'Great place to work',
                    text: 'Good team, interesting tasks, competitive salary',
                }).then(r => r.data)
            );
            await doStep('58. [ALL] Get company reviews', () =>
                jsApi.get(`/api/reviews/company/${company.id}`).then(r => r.data)
            );
            await doStep('59. [ALL] Get company review summary', () =>
                jsApi.get(`/api/reviews/company/${company.id}/summary`).then(r => r.data)
            );

            // ── Phase 15: Salary Analytics ───────────────────────────────
            await doStep('60. [ALL] Get salary stats for TypeScript', () =>
                jsApi.get('/api/stats/salary', { params: { title: 'TypeScript', location: 'Moscow' } }).then(r => r.data)
            );

            // ── Phase 16: Search Autocomplete ────────────────────────────
            await doStep('61. [ALL] Autocomplete vacancies (q=Type)', () =>
                jsApi.get('/api/search/suggest', { params: { q: 'Type', type: 'vacancy' } }).then(r => r.data)
            );
            await doStep('62. [ALL] Autocomplete skills (q=Type)', () =>
                jsApi.get('/api/search/suggest', { params: { q: 'Type', type: 'skill' } }).then(r => r.data)
            );
            await doStep('63. [ALL] Autocomplete locations (q=Mos)', () =>
                jsApi.get('/api/search/suggest', { params: { q: 'Mos', type: 'location' } }).then(r => r.data)
            );

            // ── Phase 17: Chat ───────────────────────────────────────────
            const conversation = await doStep<{ id: number }>('64. [JOBSEEKER] Start chat with employer', () =>
                jsApi.post('/api/chat/conversations', null, { params: { recipientId: empUserId } }).then(r => r.data)
            );
            await doStep('65. [JOBSEEKER] Send message', () =>
                jsApi.post(`/api/chat/conversations/${conversation.id}/messages`, {
                    content: 'Hello! I am interested in the TypeScript Developer position.',
                }).then(r => r.data)
            );
            await doStep('66. [EMPLOYER] Get conversations', () =>
                empApi.get('/api/chat/conversations').then(r => r.data)
            );
            await doStep('67. [EMPLOYER] Get messages in conversation', () =>
                empApi.get(`/api/chat/conversations/${conversation.id}/messages`).then(r => r.data)
            );
            await doStep('68. [EMPLOYER] Mark conversation as read', () =>
                empApi.patch(`/api/chat/conversations/${conversation.id}/read`).then(r => r.data)
            );

            // ── Phase 18: Stats ──────────────────────────────────────────
            await doStep('69. [EMPLOYER] Get employer dashboard stats', () =>
                empApi.get('/api/stats/employer').then(r => r.data)
            );
            await doStep('70. [EMPLOYER] Get vacancy stats', () =>
                empApi.get(`/api/stats/vacancies/${vacancy.id}`).then(r => r.data)
            );
            await doStep('71. [JOBSEEKER] Get resume stats', () =>
                jsApi.get(`/api/stats/resumes/${resume.id}`).then(r => r.data)
            );

            // ── Phase 19: Bulk Vacancy ───────────────────────────────────
            const vacancy2 = await doStep<{ id: number }>('72. [EMPLOYER] Create second vacancy for bulk test', () =>
                empApi.post('/api/vacancies', {
                    title: 'React Developer',
                    description: 'Looking for React developer',
                    companyName: `TechCorp_${suffix}`,
                    employerId: empUserId,
                    salary: 200000,
                    isPublished: false,
                    location: 'Moscow',
                    employmentType: 'FULL_TIME',
                    experienceLevel: 'MIDDLE',
                }).then(r => r.data)
            );
            await doStep('73. [EMPLOYER] Bulk publish 2 vacancies', () =>
                empApi.post('/api/vacancies/bulk-publish', [vacancy.id, vacancy2.id]).then(r => r.data)
            );
            await doStep('74. [EMPLOYER] Bulk unpublish 2 vacancies', () =>
                empApi.post('/api/vacancies/bulk-unpublish', [vacancy.id, vacancy2.id]).then(r => r.data)
            );

            // ── Phase 20: Cleanup ────────────────────────────────────────
            await doStep('75. [JOBSEEKER] Withdraw application', () =>
                jsApi.patch(`/api/applications/${application.id}/withdraw`).then(r => r.data)
            );
            await doStep('76. [JOBSEEKER] Remove favorite vacancy', () =>
                jsApi.delete('/api/favorites', { params: { itemId: vacancy.id, itemType: 'VACANCY' } }).then(r => r.data)
            );
            await doStep('77. [JOBSEEKER] Delete job alert', () =>
                jsApi.delete(`/api/alerts/${alert.id}`).then(r => r.data)
            );
            await doStep('78. [JOBSEEKER] Delete review', () =>
                jsApi.delete(`/api/reviews/${review.id}`).then(r => r.data)
            );
            await doStep('79. [EMPLOYER] Unpublish vacancy', () =>
                empApi.patch(`/api/vacancies/${vacancy.id}/unpublish`).then(r => r.data)
            );
            await doStep('80. [JOBSEEKER] Unpublish resume', () =>
                jsApi.patch(`/api/resumes/${resume.id}/unpublish`).then(r => r.data)
            );
            await doStep('81. [JOBSEEKER] Delete work experience', () =>
                jsApi.delete(`/api/work-experience/${workExp.id}`).then(r => r.data)
            );
            await doStep('82. [JOBSEEKER] Remove skill from resume', () =>
                jsApi.delete(`/api/resumes/${resume.id}/skills/${skill.id}`).then(r => r.data)
            );
            await doStep('83. [JOBSEEKER] Delete education', () =>
                jsApi.delete(`/api/educations/${education.id}`).then(r => r.data)
            );
            await doStep('84. [JOBSEEKER] Delete resume', () =>
                jsApi.delete(`/api/resumes/${resume.id}`).then(r => r.data)
            );
            await doStep('85. [EMPLOYER] Remove skill from vacancy', () =>
                empApi.delete(`/api/vacancies/${vacancy.id}/skills/${skill.id}`).then(r => r.data)
            );
            await doStep('86. [EMPLOYER] Delete vacancy', () =>
                empApi.delete(`/api/vacancies/${vacancy.id}`).then(r => r.data)
            );
            await doStep('87. [EMPLOYER] Delete second vacancy', () =>
                empApi.delete(`/api/vacancies/${vacancy2.id}`).then(r => r.data)
            );
            await doStep('88. [EMPLOYER] Delete company', () =>
                empApi.delete(`/api/companies/${company.id}`).then(r => r.data)
            );
            await doStep('89. [SKILL] Delete skill', () =>
                empApi.delete(`/api/skills/${skill.id}`).then(r => r.data)
            );
        } catch {
            // cycle stopped at failed step
        } finally {
            setCycleRunning(false);
        }
    }, []);

    // run all "read" (non-destructive) tests sequentially
    const runAllRead = async () => {
        const reads: [string, () => Promise<unknown>][] = [
            ['vacancy.getAll', () => vacancyService.getAll()],
            ['vacancy.getById', () => vacancyService.getById(n('vacancyId'))],
            ['vacancy.getByEmployer', () => vacancyService.getByEmployer(n('employerId'))],
            ['company.getAll', () => companyService.getAll()],
            ['company.getById', () => companyService.getById(n('companyId'))],
            ['company.getMyCompany', () => companyService.getMyCompany()],
            ['resume.getAll', () => resumeService.getAll()],
            ['resume.getById', () => resumeService.getById(n('resumeId'))],
            ['resume.getMy', () => resumeService.getMy()],
            ['education.getByResume', () => educationService.getByResume(n('resumeId'))],
            ['workExperience.getByResume', () => workExperienceService.getByResume(n('resumeId'))],
            ['skill.getAll', () => skillService.getAll()],
            ['skill.getById', () => skillService.getById(n('skillId'))],
            ['application.getMy', () => applicationService.getMy()],
            ['application.getByVacancy', () => applicationService.getByVacancy(n('vacancyId'))],
            ['search.vacancies', () => searchService.searchVacancies({ query: cfg.searchQuery })],
            ['search.resumes', () => searchService.searchResumes({ query: cfg.searchQuery })],
            ['search.suggest', () => suggestService.suggest(cfg.searchQuery, 'vacancy').then(r => r.data)],
            ['user.getProfile', () => userService.getProfile(n('userId'))],
            ['stats.vacancyStats', () => statsService.getVacancyStats(n('vacancyId'))],
            ['stats.resumeStats', () => statsService.getResumeStats(n('resumeId'))],
            ['stats.employerDashboard', () => statsService.getEmployerDashboard()],
            ['salary.getStats', () => salaryService.getStats({ title: cfg.salaryTitle }).then(r => r.data)],
            ['alerts.getMy', () => alertService.getMySubscriptions().then(r => r.data)],
            ['reviews.getByCompany', () => reviewService.getByCompany(n('companyId')).then(r => r.data)],
            ['reviews.getSummary', () => reviewService.getSummary(n('companyId')).then(r => r.data)],
            ['chat.getConversations', () => chatService.getConversations()],
            ['favorites.getVacancies', () => favoriteService.getByType('VACANCY')],
            ['favorites.getResumes', () => favoriteService.getByType('RESUME')],
            ['admin.getUsers', () => adminService.getUsers()],
        ];
        for (const [id, fn] of reads) await run(id, fn);
    };

    const clearAll = () => setResults({});

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono text-sm">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl font-bold text-white">API Test Panel</h1>
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={runFullCycle} disabled={cycleRunning}
                            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-wait rounded text-white text-xs font-bold">
                            {cycleRunning ? '⏳ Running cycle...' : '⚡ Full Cycle Test (2 users)'}
                        </button>
                        {cycleLog.length > 0 && (
                            <button onClick={() => setCycleLog([])}
                                className="px-4 py-2 bg-purple-900 hover:bg-purple-800 rounded text-xs text-purple-300">
                                Clear Cycle
                            </button>
                        )}
                        <button onClick={runAllRead}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-bold">
                            ▶ Run All Read Tests
                        </button>
                        <button onClick={clearAll}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                            Clear Results
                        </button>
                    </div>
                </div>

                {/* Token status */}
                <div className={`p-3 rounded border text-xs ${token ? 'border-green-600 bg-green-950' : 'border-red-700 bg-red-950'}`}>
                    <span className={token ? 'text-green-400' : 'text-red-400'}>
                        {token ? '✓ Authenticated' : '✗ No token — login first'}
                    </span>
                    {decoded && (
                        <span className="ml-4 text-gray-400">
                            userId={decoded.userId} | role={decoded.userRole} | email={decoded.sub}
                        </span>
                    )}
                </div>

                {/* Full Cycle Log */}
                {cycleLog.length > 0 && (
                    <CycleSection steps={cycleLog} running={cycleRunning} />
                )}

                {/* Config */}
                <Section title="⚙ Config (IDs & defaults)">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(Object.keys(cfg) as (keyof typeof cfg)[]).map(k => (
                            <label key={k} className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs">{k}</span>
                                <input
                                    value={cfg[k]}
                                    onChange={e => setCfg(c => ({ ...c, [k]: e.target.value }))}
                                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}
                    </div>
                </Section>

                {/* AUTH */}
                <Section title="AUTH">
                    <Row id="auth.login" label="login(email, password)" results={results}
                        onRun={() => run('auth.login', () => authService.login({ email: cfg.email, password: cfg.password }))} />
                    <Row id="auth.register" label="register(username, email, phone, password, role)" results={results}
                        onRun={() => run('auth.register', () => authService.register({
                            username: cfg.regUsername, email: cfg.regEmail,
                            phone: cfg.regPhone, password: cfg.regPassword, userRole: cfg.regRole,
                        }))} />
                </Section>

                {/* USER */}
                <Section title="USER">
                    <Row id="user.getProfile" label={`getProfile(userId=${cfg.userId})`} results={results}
                        onRun={() => run('user.getProfile', () => userService.getProfile(n('userId')))} />
                    <Row id="user.update" label={`update(userId=${cfg.userId}, {firstName: "Test"})`} results={results} destructive
                        onRun={() => run('user.update', () => userService.update(n('userId'), { firstName: 'Test' }))} />
                </Section>

                {/* VACANCY */}
                <Section title="VACANCY">
                    <Row id="vacancy.getAll" label="getAll(page=0, size=5)" results={results}
                        onRun={() => run('vacancy.getAll', () => vacancyService.getAll(0, 5))} />
                    <Row id="vacancy.getById" label={`getById(${cfg.vacancyId})`} results={results}
                        onRun={() => run('vacancy.getById', () => vacancyService.getById(n('vacancyId')))} />
                    <Row id="vacancy.getByEmployer" label={`getByEmployer(employerId=${cfg.employerId})`} results={results}
                        onRun={() => run('vacancy.getByEmployer', () => vacancyService.getByEmployer(n('employerId')))} />
                    <Row id="vacancy.getSkillIds" label={`getSkillIds(vacancyId=${cfg.vacancyId})`} results={results}
                        onRun={() => run('vacancy.getSkillIds', () => vacancyService.getSkillIds(n('vacancyId')))} />
                    <Row id="vacancy.create" label='create({title:"Test Vacancy", description:"desc", salary:100000, ...})' results={results} destructive
                        onRun={() => run('vacancy.create', () => vacancyService.create({
                            title: 'Test Vacancy', description: 'Test description', companyName: 'Test Co',
                            employerId: n('employerId'), salary: 100000, isPublished: false,
                            location: 'Moscow', employmentType: 'FULL_TIME', experienceLevel: 'JUNIOR',
                        }))} />
                    <Row id="vacancy.publish" label={`publish(vacancyId=${cfg.vacancyId})`} results={results} destructive
                        onRun={() => run('vacancy.publish', () => vacancyService.publish(n('vacancyId')))} />
                    <Row id="vacancy.unpublish" label={`unpublish(vacancyId=${cfg.vacancyId})`} results={results} destructive
                        onRun={() => run('vacancy.unpublish', () => vacancyService.unpublish(n('vacancyId')))} />
                </Section>

                {/* COMPANY */}
                <Section title="COMPANY">
                    <Row id="company.getAll" label="getAll()" results={results}
                        onRun={() => run('company.getAll', () => companyService.getAll())} />
                    <Row id="company.getById" label={`getById(${cfg.companyId})`} results={results}
                        onRun={() => run('company.getById', () => companyService.getById(n('companyId')))} />
                    <Row id="company.getMyCompany" label="getMyCompany()" results={results}
                        onRun={() => run('company.getMyCompany', () => companyService.getMyCompany())} />
                    <Row id="company.getByEmployerId" label={`getByEmployerId(${cfg.employerId})`} results={results}
                        onRun={() => run('company.getByEmployerId', () => companyService.getByEmployerId(n('employerId')))} />
                    <Row id="company.create" label='create({name:"Test Co", location:"Moscow", email:"co@test.com"})' results={results} destructive
                        onRun={() => run('company.create', () => companyService.create({
                            name: 'Test Company', location: 'Moscow', email: 'testco@test.com',
                            description: 'Test company description',
                        }))} />
                </Section>

                {/* RESUME */}
                <Section title="RESUME">
                    <Row id="resume.getAll" label="getAll(page=0, size=5)" results={results}
                        onRun={() => run('resume.getAll', () => resumeService.getAll(0, 5))} />
                    <Row id="resume.getById" label={`getById(${cfg.resumeId})`} results={results}
                        onRun={() => run('resume.getById', () => resumeService.getById(n('resumeId')))} />
                    <Row id="resume.getMy" label="getMy()" results={results}
                        onRun={() => run('resume.getMy', () => resumeService.getMy())} />
                    <Row id="resume.getSkillIds" label={`getSkillIds(resumeId=${cfg.resumeId})`} results={results}
                        onRun={() => run('resume.getSkillIds', () => resumeService.getSkillIds(n('resumeId')))} />
                    <Row id="resume.create" label='create({title:"My Resume", summary:"summary", ...})' results={results} destructive
                        onRun={() => run('resume.create', () => resumeService.create({
                            userId: n('userId'), title: 'Test Resume', summary: 'Test summary',
                            experienceYears: 2, contactEmail: cfg.email, isPublished: false,
                        }))} />
                    <Row id="resume.publish" label={`publish(resumeId=${cfg.resumeId})`} results={results} destructive
                        onRun={() => run('resume.publish', () => resumeService.publish(n('resumeId')))} />
                    <Row id="resume.unpublish" label={`unpublish(resumeId=${cfg.resumeId})`} results={results} destructive
                        onRun={() => run('resume.unpublish', () => resumeService.unpublish(n('resumeId')))} />
                </Section>

                {/* EDUCATION */}
                <Section title="EDUCATION">
                    <Row id="education.getByResume" label={`getByResume(resumeId=${cfg.resumeId})`} results={results}
                        onRun={() => run('education.getByResume', () => educationService.getByResume(n('resumeId')))} />
                    <Row id="education.create" label={`create(resumeId=${cfg.resumeId}, {institution, degree})`} results={results} destructive
                        onRun={() => run('education.create', () => educationService.create(n('resumeId'), {
                            institution: 'Test University', degree: 'Bachelor',
                            fieldOfStudy: 'Computer Science', startYear: 2018, endYear: 2022,
                        }))} />
                    <Row id="education.update" label={`update(resumeId=${cfg.resumeId}, educationId=${cfg.educationId})`} results={results} destructive
                        onRun={() => run('education.update', () => educationService.update(n('resumeId'), n('educationId'), {
                            degree: 'Master',
                        }))} />
                    <Row id="education.delete" label={`delete(resumeId=${cfg.resumeId}, educationId=${cfg.educationId})`} results={results} destructive danger
                        onRun={() => run('education.delete', () => educationService.delete(n('resumeId'), n('educationId')))} />
                </Section>

                {/* SKILL */}
                <Section title="SKILL">
                    <Row id="skill.getAll" label="getAll()" results={results}
                        onRun={() => run('skill.getAll', () => skillService.getAll())} />
                    <Row id="skill.getById" label={`getById(${cfg.skillId})`} results={results}
                        onRun={() => run('skill.getById', () => skillService.getById(n('skillId')))} />
                    <Row id="skill.create" label={`create("${cfg.skillName}")`} results={results} destructive
                        onRun={() => run('skill.create', () => skillService.create(cfg.skillName))} />
                    <Row id="skill.findOrCreate" label={`findOrCreate("${cfg.skillName}")`} results={results}
                        onRun={() => run('skill.findOrCreate', () => skillService.findOrCreate(cfg.skillName))} />
                    <Row id="skill.getNamesByIds" label={`getNamesByIds([${cfg.skillId}])`} results={results}
                        onRun={() => run('skill.getNamesByIds', () => skillService.getNamesByIds([n('skillId')]))} />
                    <Row id="skill.getSkillsForResume" label={`getSkillsForResume(resumeId=${cfg.resumeId})`} results={results}
                        onRun={() => run('skill.getSkillsForResume', () => skillService.getSkillsForResume(n('resumeId')))} />
                    <Row id="skill.getSkillsForVacancy" label={`getSkillsForVacancy(vacancyId=${cfg.vacancyId})`} results={results}
                        onRun={() => run('skill.getSkillsForVacancy', () => skillService.getSkillsForVacancy(n('vacancyId')))} />
                </Section>

                {/* APPLICATION */}
                <Section title="APPLICATION">
                    <Row id="application.getMy" label="getMy()" results={results}
                        onRun={() => run('application.getMy', () => applicationService.getMy())} />
                    <Row id="application.getById" label={`getById(${cfg.applicationId})`} results={results}
                        onRun={() => run('application.getById', () => applicationService.getById(n('applicationId')))} />
                    <Row id="application.getByVacancy" label={`getByVacancy(vacancyId=${cfg.vacancyId})`} results={results}
                        onRun={() => run('application.getByVacancy', () => applicationService.getByVacancy(n('vacancyId')))} />
                    <Row id="application.getByEmployer" label={`getByEmployer(employerId=${cfg.employerId})`} results={results}
                        onRun={() => run('application.getByEmployer', () => applicationService.getByEmployer(n('employerId')))} />
                    <Row id="application.getStatistics" label={`getStatistics(employerId=${cfg.employerId})`} results={results}
                        onRun={() => run('application.getStatistics', () => applicationService.getStatistics(n('employerId')))} />
                    <Row id="application.create" label={`create({vacancyId, resumeId, ...})`} results={results} destructive
                        onRun={() => run('application.create', () => applicationService.create({
                            vacancyId: n('vacancyId'), employerId: n('employerId'),
                            candidateId: n('userId'), resumeId: n('resumeId'),
                        }))} />
                    <Row id="application.accept" label={`accept(applicationId=${cfg.applicationId})`} results={results} destructive
                        onRun={() => run('application.accept', () => applicationService.accept(n('applicationId')))} />
                    <Row id="application.reject" label={`reject(applicationId=${cfg.applicationId})`} results={results} destructive
                        onRun={() => run('application.reject', () => applicationService.reject(n('applicationId')))} />
                    <Row id="application.withdraw" label={`withdraw(applicationId=${cfg.applicationId})`} results={results} destructive
                        onRun={() => run('application.withdraw', () => applicationService.withdraw(n('applicationId')))} />
                </Section>

                {/* SEARCH */}
                <Section title="SEARCH (Elasticsearch)">
                    <Row id="search.vacancies" label={`searchVacancies(query="${cfg.searchQuery}")`} results={results}
                        onRun={() => run('search.vacancies', () => searchService.searchVacancies({ query: cfg.searchQuery, size: 5 }))} />
                    <Row id="search.resumes" label={`searchResumes(query="${cfg.searchQuery}")`} results={results}
                        onRun={() => run('search.resumes', () => searchService.searchResumes({ query: cfg.searchQuery, size: 5 }))} />
                    <Row id="search.suggest" label={`suggest(q="${cfg.searchQuery}", type="vacancy")`} results={results}
                        onRun={() => run('search.suggest', () => suggestService.suggest(cfg.searchQuery, 'vacancy').then(r => r.data))} />
                    <Row id="search.suggestSkill" label={`suggest(q="${cfg.searchQuery}", type="skill")`} results={results}
                        onRun={() => run('search.suggestSkill', () => suggestService.suggest(cfg.searchQuery, 'skill').then(r => r.data))} />
                    <Row id="search.suggestLocation" label={`suggest(q="${cfg.searchQuery}", type="location")`} results={results}
                        onRun={() => run('search.suggestLocation', () => suggestService.suggest(cfg.searchQuery, 'location').then(r => r.data))} />
                    <Row id="search.suggestCompany" label={`suggest(q="${cfg.searchQuery}", type="company")`} results={results}
                        onRun={() => run('search.suggestCompany', () => suggestService.suggest(cfg.searchQuery, 'company').then(r => r.data))} />
                </Section>

                {/* WORK EXPERIENCE */}
                <Section title="WORK EXPERIENCE">
                    <Row id="workExp.getByResume" label={`getByResume(resumeId=${cfg.resumeId})`} results={results}
                        onRun={() => run('workExp.getByResume', () => workExperienceService.getByResume(n('resumeId')))} />
                    <Row id="workExp.create" label={`create({resumeId, companyName, position, ...})`} results={results} destructive
                        onRun={() => run('workExp.create', () => workExperienceService.create({
                            resumeId: n('resumeId'),
                            companyName: 'Test Corp',
                            position: 'Developer',
                            description: 'Worked on various projects',
                            startYear: 2020,
                            endYear: 2023,
                        }))} />
                    <Row id="workExp.update" label={`update(workExperienceId=${cfg.workExperienceId})`} results={results} destructive
                        onRun={() => run('workExp.update', () => workExperienceService.update(n('workExperienceId'), {
                            resumeId: n('resumeId'),
                            companyName: 'Test Corp',
                            position: 'Senior Developer',
                            description: 'Led projects',
                            startYear: 2020,
                            endYear: 2023,
                        }))} />
                    <Row id="workExp.delete" label={`delete(workExperienceId=${cfg.workExperienceId})`} results={results} destructive danger
                        onRun={() => run('workExp.delete', () => workExperienceService.delete(n('workExperienceId')))} />
                </Section>

                {/* STATS */}
                <Section title="STATS">
                    <Row id="stats.employerDashboard" label="getEmployerDashboard()" results={results}
                        onRun={() => run('stats.employerDashboard', () => statsService.getEmployerDashboard())} />
                    <Row id="stats.vacancyStats" label={`getVacancyStats(vacancyId=${cfg.vacancyId})`} results={results}
                        onRun={() => run('stats.vacancyStats', () => statsService.getVacancyStats(n('vacancyId')))} />
                    <Row id="stats.resumeStats" label={`getResumeStats(resumeId=${cfg.resumeId})`} results={results}
                        onRun={() => run('stats.resumeStats', () => statsService.getResumeStats(n('resumeId')))} />
                    <Row id="salary.getStats" label={`getSalaryStats(title="${cfg.salaryTitle}")`} results={results}
                        onRun={() => run('salary.getStats', () => salaryService.getStats({ title: cfg.salaryTitle }).then(r => r.data))} />
                </Section>

                {/* CHAT */}
                <Section title="CHAT">
                    <Row id="chat.getConversations" label="getConversations()" results={results}
                        onRun={() => run('chat.getConversations', () => chatService.getConversations())} />
                    <Row id="chat.getOrCreate" label={`getOrCreate(recipientId=${cfg.userId})`} results={results} destructive
                        onRun={() => run('chat.getOrCreate', () => chatService.getOrCreate(n('userId')))} />
                    <Row id="chat.getConversation" label={`getConversation(id=${cfg.conversationId})`} results={results}
                        onRun={() => run('chat.getConversation', () => chatService.getConversation(n('conversationId')))} />
                    <Row id="chat.getMessages" label={`getMessages(conversationId=${cfg.conversationId})`} results={results}
                        onRun={() => run('chat.getMessages', () => chatService.getMessages(n('conversationId')))} />
                    <Row id="chat.sendMessage" label={`sendMessage(conversationId=${cfg.conversationId}, "Hello!")`} results={results} destructive
                        onRun={() => run('chat.sendMessage', () => chatService.sendMessage(n('conversationId'), 'Hello from test panel!'))} />
                    <Row id="chat.markRead" label={`markRead(conversationId=${cfg.conversationId})`} results={results} destructive
                        onRun={() => run('chat.markRead', () => chatService.markRead(n('conversationId')))} />
                </Section>

                {/* FAVORITES */}
                <Section title="FAVORITES">
                    <Row id="favorites.getVacancies" label='getByType("VACANCY")' results={results}
                        onRun={() => run('favorites.getVacancies', () => favoriteService.getByType('VACANCY'))} />
                    <Row id="favorites.getResumes" label='getByType("RESUME")' results={results}
                        onRun={() => run('favorites.getResumes', () => favoriteService.getByType('RESUME'))} />
                    <Row id="favorites.checkVacancy" label={`isFavorite(vacancyId=${cfg.vacancyId}, "VACANCY")`} results={results}
                        onRun={() => run('favorites.checkVacancy', () => favoriteService.isFavorite(n('vacancyId'), 'VACANCY'))} />
                    <Row id="favorites.addVacancy" label={`add(vacancyId=${cfg.vacancyId}, "VACANCY")`} results={results} destructive
                        onRun={() => run('favorites.addVacancy', () => favoriteService.add(n('vacancyId'), 'VACANCY'))} />
                    <Row id="favorites.removeVacancy" label={`remove(vacancyId=${cfg.vacancyId}, "VACANCY")`} results={results} destructive danger
                        onRun={() => run('favorites.removeVacancy', () => favoriteService.remove(n('vacancyId'), 'VACANCY'))} />
                </Section>

                {/* ALERTS */}
                <Section title="JOB ALERTS">
                    <Row id="alerts.getMy" label="getMySubscriptions()" results={results}
                        onRun={() => run('alerts.getMy', () => alertService.getMySubscriptions().then(r => r.data))} />
                    <Row id="alerts.create" label='create({keywords:"developer", location:"Moscow", minSalary:100000})' results={results} destructive
                        onRun={() => run('alerts.create', () => alertService.create({
                            keywords: 'developer',
                            location: 'Moscow',
                            minSalary: 100000,
                            employmentType: 'FULL_TIME',
                        }).then(r => r.data))} />
                    <Row id="alerts.toggle" label={`toggle(alertId=${cfg.alertId})`} results={results} destructive
                        onRun={() => run('alerts.toggle', () => alertService.toggle(n('alertId')).then(r => r.data))} />
                    <Row id="alerts.delete" label={`delete(alertId=${cfg.alertId})`} results={results} destructive danger
                        onRun={() => run('alerts.delete', () => alertService.delete(n('alertId')).then(r => r.data))} />
                </Section>

                {/* REVIEWS */}
                <Section title="COMPANY REVIEWS">
                    <Row id="reviews.getByCompany" label={`getByCompany(companyId=${cfg.companyId})`} results={results}
                        onRun={() => run('reviews.getByCompany', () => reviewService.getByCompany(n('companyId')).then(r => r.data))} />
                    <Row id="reviews.getSummary" label={`getSummary(companyId=${cfg.companyId})`} results={results}
                        onRun={() => run('reviews.getSummary', () => reviewService.getSummary(n('companyId')).then(r => r.data))} />
                    <Row id="reviews.create" label={`create(companyId=${cfg.companyId}, {rating:5, title, text})`} results={results} destructive
                        onRun={() => run('reviews.create', () => reviewService.create(n('companyId'), {
                            rating: 5,
                            title: 'Great company',
                            text: 'Excellent work environment and culture',
                        }).then(r => r.data))} />
                    <Row id="reviews.update" label={`update(reviewId=${cfg.reviewId}, {rating:4, ...})`} results={results} destructive
                        onRun={() => run('reviews.update', () => reviewService.update(n('reviewId'), {
                            rating: 4,
                            title: 'Good company',
                            text: 'Good work environment',
                        }).then(r => r.data))} />
                    <Row id="reviews.delete" label={`delete(reviewId=${cfg.reviewId})`} results={results} destructive danger
                        onRun={() => run('reviews.delete', () => reviewService.delete(n('reviewId')).then(r => r.data))} />
                </Section>

                {/* BULK VACANCY */}
                <Section title="BULK VACANCY">
                    <Row id="bulk.publish" label={`bulkPublish([${cfg.vacancyId}])`} results={results} destructive
                        onRun={() => run('bulk.publish', () => vacancyBulkService.bulkPublish([n('vacancyId')]).then(r => r.data))} />
                    <Row id="bulk.unpublish" label={`bulkUnpublish([${cfg.vacancyId}])`} results={results} destructive
                        onRun={() => run('bulk.unpublish', () => vacancyBulkService.bulkUnpublish([n('vacancyId')]).then(r => r.data))} />
                </Section>

                {/* ADMIN */}
                <Section title="ADMIN">
                    <Row id="admin.getUsers" label="getUsers(page=0, size=20)" results={results}
                        onRun={() => run('admin.getUsers', () => adminService.getUsers())} />
                    <Row id="admin.deactivateUser" label={`deactivateUser(userId=${cfg.userId})`} results={results} destructive danger
                        onRun={() => run('admin.deactivateUser', () => adminService.deactivateUser(n('userId')))} />
                    <Row id="admin.activateUser" label={`activateUser(userId=${cfg.userId})`} results={results} destructive
                        onRun={() => run('admin.activateUser', () => adminService.activateUser(n('userId')))} />
                    <Row id="admin.deleteUser" label={`deleteUser(userId=${cfg.userId})`} results={results} destructive danger
                        onRun={() => run('admin.deleteUser', () => adminService.deleteUser(n('userId')))} />
                </Section>

                {/* Summary */}
                <Summary results={results} />
            </div>
        </div>
    );
}

// ─── Full Cycle Section ────────────────────────────────────────────────────

function CycleSection({ steps, running }: { steps: CycleStep[]; running: boolean }) {
    const [open, setOpen] = useState(true);
    const ok = steps.filter(s => s.status === 'ok').length;
    const err = steps.filter(s => s.status === 'error').length;
    const total = steps.length;

    return (
        <div className="border border-purple-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-purple-950 hover:bg-purple-900 text-left font-bold text-purple-300 text-xs uppercase tracking-wider"
            >
                <span className="text-purple-600">{open ? '▼' : '▶'}</span>
                ⚡ Full Cycle Test — JOBSEEKER + EMPLOYER
                <span className="ml-auto flex gap-3 font-normal normal-case tracking-normal">
                    {running && <span className="text-yellow-400 animate-pulse">● Running…</span>}
                    <span className="text-green-400">✓ {ok}</span>
                    <span className="text-red-400">✗ {err}</span>
                    <span className="text-gray-500">{total} steps</span>
                </span>
            </button>
            {open && (
                <div className="divide-y divide-purple-900/40 bg-gray-900">
                    {steps.map(s => <CycleRow key={s.step} step={s} />)}
                    {running && (
                        <div className="px-4 py-2 text-yellow-500 text-xs animate-pulse">
                            ● Executing next step…
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CycleRow({ step }: { step: CycleStep }) {
    const [open, setOpen] = useState(false);
    const icon = step.status === 'running' ? '●' : step.status === 'ok' ? '✓' : '✗';
    const color = step.status === 'running' ? 'text-yellow-400' :
        step.status === 'ok' ? 'text-green-400' : 'text-red-400';

    // colour-code the phase tag in the step name
    const phaseColor = step.step.includes('[AUTH]') ? 'text-blue-400' :
        step.step.includes('[EMPLOYER]') ? 'text-orange-400' :
            step.step.includes('[JOBSEEKER]') ? 'text-cyan-400' :
                step.step.includes('[SKILL]') ? 'text-yellow-300' :
                    step.step.includes('[SEARCH]') ? 'text-pink-400' :
                        step.step.includes('[ALL]') ? 'text-gray-300' : 'text-gray-300';

    const hasDetail = step.status === 'ok' || step.status === 'error';

    return (
        <div className="px-4 py-2 hover:bg-gray-800/50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => hasDetail && setOpen(o => !o)}>
                <span className={`text-xs w-4 text-center ${color} ${step.status === 'running' ? 'animate-pulse' : ''}`}>{icon}</span>
                <code className={`flex-1 text-xs ${phaseColor}`}>{step.step}</code>
                {step.ms != null && <span className="text-xs text-gray-600">{step.ms}ms</span>}
                {hasDetail && <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>}
            </div>
            {open && hasDetail && (
                <div className={`mt-2 ml-7 text-xs rounded p-2 max-h-48 overflow-auto
                    ${step.status === 'ok' ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'}`}>
                    <pre className="whitespace-pre-wrap break-all">
                        {step.status === 'ok'
                            ? JSON.stringify(step.data, null, 2)
                            : step.error}
                    </pre>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-left font-bold text-gray-300 text-xs uppercase tracking-wider"
            >
                <span className="text-gray-600">{open ? '▼' : '▶'}</span>
                {title}
            </button>
            {open && <div className="divide-y divide-gray-800/50">{children}</div>}
        </div>
    );
}

function Row({ id, label, results, onRun, destructive, danger }: {
    id: string; label: string; results: Results;
    onRun: () => void; destructive?: boolean; danger?: boolean;
}) {
    const r = results[id];
    const statusColor = !r || r.status === 'idle' ? 'text-gray-600' :
        r.status === 'running' ? 'text-yellow-400' :
            r.status === 'ok' ? 'text-green-400' : 'text-red-400';
    const statusIcon = !r || r.status === 'idle' ? '○' :
        r.status === 'running' ? '●' :
            r.status === 'ok' ? '✓' : '✗';

    return (
        <div className="px-4 py-3 hover:bg-gray-900/50">
            <div className="flex items-center gap-3">
                <span className={`text-xs w-4 text-center ${statusColor}`}>{statusIcon}</span>
                <code className="flex-1 text-gray-300 text-xs">{label}</code>
                {destructive && <span className="text-xs text-yellow-600 px-1.5 py-0.5 border border-yellow-800 rounded">{danger ? 'DELETE' : 'WRITE'}</span>}
                {r?.ms && <span className="text-xs text-gray-600">{r.ms}ms</span>}
                <button
                    onClick={onRun}
                    disabled={r?.status === 'running'}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors
                        ${r?.status === 'running' ? 'bg-gray-700 text-gray-500 cursor-wait' :
                            danger ? 'bg-red-900 hover:bg-red-800 text-red-200' :
                                destructive ? 'bg-yellow-900 hover:bg-yellow-800 text-yellow-200' :
                                    'bg-gray-700 hover:bg-gray-600 text-white'}`}
                >
                    {r?.status === 'running' ? '...' : 'Run'}
                </button>
            </div>
            {r && r.status !== 'idle' && r.status !== 'running' && (
                <div className={`mt-2 ml-7 text-xs rounded p-2 max-h-48 overflow-auto
                    ${r.status === 'ok' ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'}`}>
                    <pre className="whitespace-pre-wrap break-all">
                        {r.status === 'ok'
                            ? JSON.stringify(r.data, null, 2)
                            : r.error}
                    </pre>
                </div>
            )}
        </div>
    );
}

function Summary({ results }: { results: Results }) {
    const entries = Object.values(results).filter(r => r.status !== 'idle');
    if (entries.length === 0) return null;
    const ok = entries.filter(r => r.status === 'ok').length;
    const err = entries.filter(r => r.status === 'error').length;
    const running = entries.filter(r => r.status === 'running').length;
    return (
        <div className="flex gap-4 text-xs p-3 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500">Results:</span>
            <span className="text-green-400">✓ {ok} passed</span>
            <span className="text-red-400">✗ {err} failed</span>
            {running > 0 && <span className="text-yellow-400">● {running} running</span>}
            <span className="text-gray-600">Total: {entries.length}</span>
        </div>
    );
}
