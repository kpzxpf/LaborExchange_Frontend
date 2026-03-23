"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, User, Briefcase, GraduationCap, Building2,
    Plus, ArrowLeft, ArrowRight, Save, Trash2, Check, Sparkles, X, Wand2,
    ChevronLeft, Mail, Phone, MapPin,
} from "lucide-react";
import { resumeService, educationService, workExperienceService, skillService } from "@/services/api";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
}

interface WorkExp {
    companyName: string;
    position: string;
    description: string;
    startYear: string;
    startMonth: string;
    endYear: string;
    endMonth: string;
    isCurrent: boolean;
}

const MONTHS = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

const inputCls = "w-full px-4 py-3 rounded-xl outline-none transition-all text-sm";
const inputStyle = {
    background: "rgb(var(--card-bg))",
    border: "1px solid var(--card-border)",
    color: "rgb(var(--text-1))",
} as const;

const STEPS = [
    { label: "Основное",     icon: User },
    { label: "Навыки",       icon: Briefcase },
    { label: "Опыт",         icon: Building2 },
    { label: "Образование",  icon: GraduationCap },
];

const SPECIALIZATIONS = [
    "Frontend разработчик",
    "Backend разработчик",
    "Fullstack разработчик",
    "Мобильный разработчик (iOS/Android)",
    "Data Scientist / ML Engineer",
    "DevOps / SRE инженер",
    "QA Engineer / Тестировщик",
    "Product Manager",
    "UX/UI Дизайнер",
    "Аналитик данных",
    "Системный аналитик",
    "Другое",
];

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const emptyWorkExp: WorkExp = {
    companyName: "", position: "", description: "",
    startYear: "", startMonth: "", endYear: "", endMonth: "", isCurrent: false,
};
const emptyEdu: Education = { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" };

export default function CreateResumePage() {
    const router = useRouter();
    const { userId } = useAuth();

    // Wizard state
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", title: "", summary: "",
        location: "", experienceYears: "", contactEmail: "", contactPhone: "",
    });
    const [workExps, setWorkExps] = useState<WorkExp[]>([{ ...emptyWorkExp }]);
    const [educations, setEducations] = useState<Education[]>([{ ...emptyEdu }]);

    // AI modal state
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiScreen, setAiScreen] = useState<"form" | "contacts">("form");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiGeneratedStats, setAiGeneratedStats] = useState({ workCount: 0, skillCount: 0, eduCount: 0 });
    const [aiForm, setAiForm] = useState({
        jobTitle: "",
        specialization: "",
        yearsOfExperience: "",
        location: "",
        technologies: "",
        description: "",
        achievements: "",
    });
    const [contactForm, setContactForm] = useState({
        firstName: "", lastName: "", contactEmail: "", contactPhone: "",
    });

    const goTo = (next: number) => { setDir(next > step ? 1 : -1); setStep(next); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateWorkExp = (idx: number, field: keyof WorkExp, value: string | boolean) =>
        setWorkExps(prev => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
    const addWorkExp = () => setWorkExps(prev => [...prev, { ...emptyWorkExp }]);
    const removeWorkExp = (idx: number) => setWorkExps(prev => prev.filter((_, i) => i !== idx));

    const updateEdu = (idx: number, field: keyof Education, value: string) =>
        setEducations(prev => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
    const addEdu = () => setEducations(prev => [...prev, { ...emptyEdu }]);
    const removeEdu = (idx: number) => setEducations(prev => prev.filter((_, i) => i !== idx));

    const doCreate = async (overrideData?: Partial<typeof formData>) => {
        if (!userId) { toast.error("Необходимо войти в систему"); return; }
        setIsLoading(true);
        const data = { ...formData, ...overrideData };
        try {
            const resume = await resumeService.create({
                userId,
                firstName:       data.firstName       || undefined,
                lastName:        data.lastName        || undefined,
                title:           data.title,
                summary:         data.summary         || undefined,
                location:        data.location        || undefined,
                experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
                contactEmail:    data.contactEmail    || undefined,
                contactPhone:    data.contactPhone    || undefined,
            });
            await Promise.all([
                ...selectedSkills.map(id => resumeService.addSkill(resume.id, id)),
                ...workExps
                    .filter(w => w.companyName.trim() && w.position.trim() && w.startYear)
                    .map(w => workExperienceService.create({
                        resumeId: resume.id,
                        companyName: w.companyName,
                        position: w.position,
                        description: w.description || undefined,
                        startYear: parseInt(w.startYear),
                        startMonth: w.startMonth ? parseInt(w.startMonth) : undefined,
                        endYear: w.isCurrent ? undefined : (w.endYear ? parseInt(w.endYear) : undefined),
                        endMonth: w.isCurrent ? undefined : (w.endMonth ? parseInt(w.endMonth) : undefined),
                        isCurrent: w.isCurrent,
                    })),
                ...educations
                    .filter(e => e.institution.trim() && e.degree.trim() && e.fieldOfStudy.trim())
                    .map(e => educationService.create(resume.id, {
                        institution: e.institution,
                        degree: e.degree,
                        fieldOfStudy: e.fieldOfStudy,
                        startYear: e.startYear ? parseInt(e.startYear) : undefined,
                        endYear: e.endYear ? parseInt(e.endYear) : undefined,
                    })),
            ]);
            toast.success("Резюме создано!");
            router.push("/jobseeker/resumes");
        } catch {
            toast.error("Не удалось создать резюме. Попробуйте снова.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => doCreate();

    const handleAiGenerate = async () => {
        if (!aiForm.jobTitle.trim()) { toast.error("Укажите желаемую должность"); return; }
        if (!aiForm.description.trim() && !aiForm.technologies.trim()) {
            toast.error("Заполните опыт или технологии");
            return;
        }
        setAiLoading(true);
        try {
            // Build rich description combining all AI form fields
            const richDescription = [
                aiForm.specialization && `Специализация: ${aiForm.specialization}`,
                aiForm.technologies   && `Стек технологий: ${aiForm.technologies}`,
                aiForm.description    && `Опыт и проекты:\n${aiForm.description}`,
                aiForm.achievements   && `Ключевые достижения:\n${aiForm.achievements}`,
            ].filter(Boolean).join("\n\n");

            const result = await resumeService.generateWithAi({
                jobTitle: aiForm.jobTitle,
                description: richDescription || aiForm.description,
                yearsOfExperience: aiForm.yearsOfExperience ? parseInt(aiForm.yearsOfExperience) : undefined,
                location: aiForm.location || undefined,
            });

            // Populate wizard form
            setFormData(prev => ({
                ...prev,
                title:           result.title           ?? prev.title,
                summary:         result.summary         ?? prev.summary,
                location:        result.location        ?? prev.location,
                experienceYears: result.experienceYears != null ? String(result.experienceYears) : prev.experienceYears,
            }));

            if (result.workExperiences?.length) {
                setWorkExps(result.workExperiences.map(w => ({
                    companyName: w.companyName ?? "",
                    position:    w.position    ?? "",
                    description: w.description ?? "",
                    startYear:   w.startYear   != null ? String(w.startYear)  : "",
                    startMonth:  w.startMonth  != null ? String(w.startMonth) : "",
                    endYear:     w.endYear     != null ? String(w.endYear)    : "",
                    endMonth:    w.endMonth    != null ? String(w.endMonth)   : "",
                    isCurrent:   w.isCurrent   ?? false,
                })));
            }

            if (result.educations?.length) {
                setEducations(result.educations.map(e => ({
                    institution:  e.institution  ?? "",
                    degree:       e.degree       ?? "",
                    fieldOfStudy: e.fieldOfStudy ?? "",
                    startYear:    e.startYear    != null ? String(e.startYear) : "",
                    endYear:      e.endYear      != null ? String(e.endYear)   : "",
                })));
            }

            if (result.suggestedSkillNames?.length) {
                const ids: number[] = [];
                for (const name of result.suggestedSkillNames) {
                    try { ids.push((await skillService.findOrCreate(name)).id); } catch { /* skip */ }
                }
                setSelectedSkills(ids);
            }

            setAiGeneratedStats({
                workCount:  result.workExperiences?.length  ?? 0,
                skillCount: result.suggestedSkillNames?.length ?? 0,
                eduCount:   result.educations?.length       ?? 0,
            });

            // Pre-fill location in contacts if AI returned it
            if (result.location) {
                setContactForm(prev => ({ ...prev }));
            }

            setAiScreen("contacts");
        } catch {
            toast.error("Не удалось сгенерировать резюме. Попробуйте снова.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAiSave = async () => {
        if (!contactForm.firstName.trim() || !contactForm.lastName.trim()) {
            toast.error("Введите имя и фамилию");
            return;
        }
        setFormData(prev => ({ ...prev, ...contactForm }));
        setAiModalOpen(false);
        await doCreate(contactForm);
    };

    const openAiModal = () => {
        setAiScreen("form");
        setAiModalOpen(true);
    };

    const step0Valid = formData.title.trim().length > 0;
    const iconStyle = { color: "rgb(99,102,241)" };

    return (
        <div className="min-h-screen py-8" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-1))" }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                    <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Назад
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <FileText className="w-5 h-5" style={iconStyle} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Новое резюме</h1>
                                <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>Шаг {step + 1} из {STEPS.length}</p>
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={openAiModal}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))", border: "1px solid rgba(99,102,241,0.35)", color: "rgb(99,102,241)" }}>
                            <Sparkles className="w-4 h-4" /> Создать с ИИ
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stepper */}
                <div className="flex items-center gap-1 mb-8">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const done = i < step, active = i === step;
                        return (
                            <div key={i} className="flex items-center gap-1 flex-1">
                                <button onClick={() => i < step && goTo(i)} disabled={i > step}
                                    className="flex items-center gap-1.5 transition-all"
                                    style={{ cursor: i < step ? "pointer" : "default" }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all text-xs"
                                        style={done ? { background: "rgb(99,102,241)", color: "#fff" }
                                            : active ? { background: "rgba(99,102,241,0.15)", border: "2px solid rgb(99,102,241)", color: "rgb(99,102,241)" }
                                            : { background: "rgba(255,255,255,0.04)", border: "1px solid var(--card-border)", color: "rgb(var(--text-3))" }}>
                                        {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:block"
                                        style={{ color: active ? "rgb(99,102,241)" : done ? "rgb(var(--text-2))" : "rgb(var(--text-3))" }}>
                                        {s.label}
                                    </span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 h-px mx-1"
                                        style={{ background: i < step ? "rgb(99,102,241)" : "var(--card-border)" }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step content */}
                <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait" custom={dir}>

                        {/* STEP 0 — Basic */}
                        {step === 0 && (
                            <motion.div key="s0" custom={dir} variants={slideVariants}
                                initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="card p-8 space-y-5">
                                <h2 className="text-base font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4" style={iconStyle} /> Основная информация
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Имя</label>
                                        <input type="text" name="firstName" value={formData.firstName}
                                            onChange={handleChange} placeholder="Иван" className={inputCls} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Фамилия</label>
                                        <input type="text" name="lastName" value={formData.lastName}
                                            onChange={handleChange} placeholder="Иванов" className={inputCls} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Название резюме *</label>
                                    <input type="text" name="title" value={formData.title}
                                        onChange={handleChange} placeholder="Senior Frontend Developer"
                                        className={inputCls} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>О себе</label>
                                    <textarea name="summary" value={formData.summary} onChange={handleChange}
                                        placeholder="Расскажите о своём опыте, навыках и достижениях..."
                                        rows={5} className={`${inputCls} resize-none`} style={inputStyle} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Email</label>
                                        <input type="email" name="contactEmail" value={formData.contactEmail}
                                            onChange={handleChange} placeholder="ivan@example.com"
                                            className={inputCls} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Телефон</label>
                                        <input type="tel" name="contactPhone" value={formData.contactPhone}
                                            onChange={handleChange} placeholder="+7 900 000-00-00"
                                            className={inputCls} style={inputStyle} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Город</label>
                                        <input type="text" name="location" value={formData.location}
                                            onChange={handleChange} placeholder="Москва"
                                            className={inputCls} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>Опыт (лет)</label>
                                        <input type="number" name="experienceYears" value={formData.experienceYears}
                                            onChange={handleChange} placeholder="5" min={0} max={60}
                                            className={inputCls} style={inputStyle} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1 — Skills */}
                        {step === 1 && (
                            <motion.div key="s1" custom={dir} variants={slideVariants}
                                initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="card p-8">
                                <h2 className="text-base font-semibold flex items-center gap-2 mb-5">
                                    <Briefcase className="w-4 h-4" style={iconStyle} /> Навыки
                                </h2>
                                <SkillSelector selected={selectedSkills} onChange={setSelectedSkills}
                                    placeholder="Начните вводить навык..." maxSkills={20} />
                            </motion.div>
                        )}

                        {/* STEP 2 — Work Experience */}
                        {step === 2 && (
                            <motion.div key="s2" custom={dir} variants={slideVariants}
                                initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="card p-8 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4" style={iconStyle} /> Опыт работы
                                    </h2>
                                    <button type="button" onClick={addWorkExp}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                                        style={{ background: "rgba(99,102,241,0.1)", color: "rgb(99,102,241)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                        <Plus className="w-3.5 h-3.5" /> Добавить
                                    </button>
                                </div>
                                <AnimatePresence mode="popLayout">
                                    {workExps.map((w, idx) => (
                                        <motion.div key={idx}
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="p-5 rounded-xl space-y-3"
                                            style={{ border: "1px solid var(--card-border)", background: "rgb(var(--card-bg))" }}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                                    Место работы #{idx + 1}
                                                </span>
                                                {workExps.length > 1 && (
                                                    <button type="button" onClick={() => removeWorkExp(idx)}
                                                        className="p-1.5 rounded-lg transition-all hover:text-red-400"
                                                        style={{ color: "rgb(var(--text-3))" }}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" placeholder="Компания *"
                                                    value={w.companyName} onChange={e => updateWorkExp(idx, "companyName", e.target.value)}
                                                    className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                <input type="text" placeholder="Должность *"
                                                    value={w.position} onChange={e => updateWorkExp(idx, "position", e.target.value)}
                                                    className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                            </div>
                                            <textarea placeholder="Обязанности и достижения..."
                                                value={w.description} onChange={e => updateWorkExp(idx, "description", e.target.value)}
                                                rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs mb-1.5" style={{ color: "rgb(var(--text-3))" }}>Начало</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={w.startMonth} onChange={e => updateWorkExp(idx, "startMonth", e.target.value)}
                                                            className="px-2 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                                                            <option value="">Месяц</option>
                                                            {MONTHS.map((m, mi) => <option key={mi} value={mi + 1}>{m}</option>)}
                                                        </select>
                                                        <input type="number" placeholder="Год" min={1950} max={2030}
                                                            value={w.startYear} onChange={e => updateWorkExp(idx, "startYear", e.target.value)}
                                                            className="px-2 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1.5" style={{ color: "rgb(var(--text-3))" }}>Конец</p>
                                                    {w.isCurrent ? (
                                                        <div className="px-3 py-2 rounded-xl text-sm" style={{ ...inputStyle, color: "rgb(99,102,241)" }}>
                                                            По настоящее время
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <select value={w.endMonth} onChange={e => updateWorkExp(idx, "endMonth", e.target.value)}
                                                                className="px-2 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                                                                <option value="">Месяц</option>
                                                                {MONTHS.map((m, mi) => <option key={mi} value={mi + 1}>{m}</option>)}
                                                            </select>
                                                            <input type="number" placeholder="Год" min={1950} max={2030}
                                                                value={w.endYear} onChange={e => updateWorkExp(idx, "endYear", e.target.value)}
                                                                className="px-2 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "rgb(var(--text-2))" }}>
                                                <input type="checkbox" checked={w.isCurrent}
                                                    onChange={e => updateWorkExp(idx, "isCurrent", e.target.checked)}
                                                    className="rounded" />
                                                Работаю здесь сейчас
                                            </label>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    Опыт работы не обязателен — можно добавить позже
                                </p>
                            </motion.div>
                        )}

                        {/* STEP 3 — Education */}
                        {step === 3 && (
                            <motion.div key="s3" custom={dir} variants={slideVariants}
                                initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="card p-8 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" style={iconStyle} /> Образование
                                    </h2>
                                    <button type="button" onClick={addEdu}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                                        style={{ background: "rgba(99,102,241,0.1)", color: "rgb(99,102,241)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                        <Plus className="w-3.5 h-3.5" /> Добавить
                                    </button>
                                </div>
                                <AnimatePresence mode="popLayout">
                                    {educations.map((edu, idx) => (
                                        <motion.div key={idx}
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="p-5 rounded-xl space-y-3"
                                            style={{ border: "1px solid var(--card-border)", background: "rgb(var(--card-bg))" }}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-2))" }}>
                                                    Учебное заведение #{idx + 1}
                                                </span>
                                                {educations.length > 1 && (
                                                    <button type="button" onClick={() => removeEdu(idx)}
                                                        className="p-1.5 rounded-lg transition-all hover:text-red-400"
                                                        style={{ color: "rgb(var(--text-3))" }}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" placeholder="Учебное заведение *"
                                                    value={edu.institution} onChange={e => updateEdu(idx, "institution", e.target.value)}
                                                    className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                <input type="text" placeholder="Степень *"
                                                    value={edu.degree} onChange={e => updateEdu(idx, "degree", e.target.value)}
                                                    className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                <input type="text" placeholder="Специальность *"
                                                    value={edu.fieldOfStudy} onChange={e => updateEdu(idx, "fieldOfStudy", e.target.value)}
                                                    className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" placeholder="Год начала" min={1950} max={2030}
                                                        value={edu.startYear} onChange={e => updateEdu(idx, "startYear", e.target.value)}
                                                        className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                    <input type="number" placeholder="Год конца" min={1950} max={2030}
                                                        value={edu.endYear} onChange={e => updateEdu(idx, "endYear", e.target.value)}
                                                        className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <p className="text-sm" style={{ color: "rgb(var(--text-3))" }}>
                                    Образование не обязательно — поля можно оставить пустыми
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-3 mt-6 pb-8">
                    <button type="button" onClick={() => step === 0 ? router.back() : goTo(step - 1)}
                        className="btn-ghost flex items-center gap-2 px-6">
                        <ArrowLeft className="w-4 h-4" />
                        {step === 0 ? "Отмена" : "Назад"}
                    </button>
                    {step < STEPS.length - 1 ? (
                        <button type="button"
                            onClick={() => { if (step === 0 && !step0Valid) { toast.error("Укажите название резюме"); return; } goTo(step + 1); }}
                            className="btn-primary flex items-center gap-2 px-8">
                            Далее <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={isLoading}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm ${!isLoading ? "btn-primary" : "opacity-50 cursor-not-allowed"}`}>
                            {isLoading ? (
                                <><span className="loading-dot" style={{ animationDelay: "0ms", background: "currentColor" }} />
                                <span className="loading-dot" style={{ animationDelay: "160ms", background: "currentColor" }} />
                                <span className="loading-dot" style={{ animationDelay: "320ms", background: "currentColor" }} /></>
                            ) : <><Save className="w-4 h-4" /> Создать резюме</>}
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ AI MODAL ═══ */}
            <AnimatePresence>
                {aiModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
                        onClick={e => { if (e.target === e.currentTarget && !aiLoading) setAiModalOpen(false); }}>

                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 24 }} transition={{ duration: 0.22 }}
                            className="w-full max-w-xl rounded-2xl my-4"
                            style={{ background: "rgb(var(--bg))", border: "1px solid var(--card-border)" }}>

                            {/* Modal header */}
                            <div className="flex items-center justify-between px-7 pt-7 pb-5"
                                style={{ borderBottom: "1px solid var(--card-border)" }}>
                                <div className="flex items-center gap-3">
                                    {aiScreen === "contacts" && (
                                        <button onClick={() => setAiScreen("form")} disabled={aiLoading}
                                            className="p-1.5 rounded-lg mr-1 transition-all"
                                            style={{ color: "rgb(var(--text-3))" }}>
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.3)" }}>
                                        {aiScreen === "contacts"
                                            ? <Check className="w-5 h-5" style={{ color: "rgb(99,102,241)" }} />
                                            : <Wand2 className="w-5 h-5" style={{ color: "rgb(99,102,241)" }} />}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            {aiScreen === "form" ? "Создать резюме с ИИ" : "Почти готово!"}
                                        </h2>
                                        <p className="text-xs" style={{ color: "rgb(var(--text-3))" }}>
                                            {aiScreen === "form"
                                                ? "Заполните — ИИ сгенерирует полное резюме"
                                                : "Осталось добавить контактные данные"}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { if (!aiLoading) setAiModalOpen(false); }}
                                    className="p-2 rounded-xl transition-all"
                                    style={{ color: "rgb(var(--text-3))" }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Progress indicator */}
                            <div className="flex px-7 pt-4 gap-2">
                                {["form", "contacts"].map((s, i) => (
                                    <div key={s} className="flex-1 h-1 rounded-full transition-all"
                                        style={{ background: (aiScreen === "contacts" ? i <= 1 : i === 0) ? "rgb(99,102,241)" : "var(--card-border)" }} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {/* ── SCREEN 1: AI FORM ── */}
                                {aiScreen === "form" && (
                                    <motion.div key="ai-form"
                                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-7 py-5 space-y-5">

                                        {/* Section: О должности */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-3))" }}>
                                                О должности
                                            </p>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Желаемая должность *
                                                </label>
                                                <input type="text" value={aiForm.jobTitle}
                                                    onChange={e => setAiForm(p => ({ ...p, jobTitle: e.target.value }))}
                                                    placeholder="Senior Java Backend Developer"
                                                    className={inputCls} style={inputStyle} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                        Специализация
                                                    </label>
                                                    <select value={aiForm.specialization}
                                                        onChange={e => setAiForm(p => ({ ...p, specialization: e.target.value }))}
                                                        className={inputCls} style={inputStyle}>
                                                        <option value="">Выберите...</option>
                                                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                        Опыт (лет)
                                                    </label>
                                                    <input type="number" min={0} max={60} value={aiForm.yearsOfExperience}
                                                        onChange={e => setAiForm(p => ({ ...p, yearsOfExperience: e.target.value }))}
                                                        placeholder="5" className={inputCls} style={inputStyle} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Город
                                                </label>
                                                <input type="text" value={aiForm.location}
                                                    onChange={e => setAiForm(p => ({ ...p, location: e.target.value }))}
                                                    placeholder="Москва" className={inputCls} style={inputStyle} />
                                            </div>
                                        </div>

                                        <div className="border-t" style={{ borderColor: "var(--card-border)" }} />

                                        {/* Section: Опыт */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-3))" }}>
                                                Ваш опыт
                                            </p>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Технологии и инструменты *
                                                </label>
                                                <input type="text" value={aiForm.technologies}
                                                    onChange={e => setAiForm(p => ({ ...p, technologies: e.target.value }))}
                                                    placeholder="Java, Spring Boot, PostgreSQL, Docker, Kafka, Redis"
                                                    className={inputCls} style={inputStyle} />
                                                <p className="text-xs mt-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                    Перечислите через запятую технологии, которые вы используете
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Опыт работы и проекты
                                                </label>
                                                <textarea value={aiForm.description}
                                                    onChange={e => setAiForm(p => ({ ...p, description: e.target.value }))}
                                                    placeholder={"Расскажите о своих проектах и местах работы:\n— В каких компаниях работали\n— Над чем работали (проекты, задачи)\n— Какие технологии применяли\n— Размер команды"}
                                                    rows={4} className={`${inputCls} resize-none`} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Ключевые достижения
                                                </label>
                                                <textarea value={aiForm.achievements}
                                                    onChange={e => setAiForm(p => ({ ...p, achievements: e.target.value }))}
                                                    placeholder={"Конкретные результаты с цифрами:\n— Ускорил загрузку страниц на 40%\n— Внедрил CI/CD, сократив деплой с 2 часов до 15 минут\n— Руководил командой из 5 разработчиков"}
                                                    rows={4} className={`${inputCls} resize-none`} style={inputStyle} />
                                                <p className="text-xs mt-1.5" style={{ color: "rgb(var(--text-3))" }}>
                                                    Чем конкретнее — тем лучше резюме
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-1">
                                            <button type="button" onClick={() => setAiModalOpen(false)}
                                                className="btn-ghost flex-1 px-4 py-2.5" disabled={aiLoading}>
                                                Отмена
                                            </button>
                                            <motion.button type="button" onClick={handleAiGenerate} disabled={aiLoading}
                                                whileHover={!aiLoading ? { scale: 1.02 } : {}} whileTap={!aiLoading ? { scale: 0.98 } : {}}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                                                style={{ background: aiLoading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,rgb(99,102,241),rgb(168,85,247))", color: "#fff", cursor: aiLoading ? "not-allowed" : "pointer" }}>
                                                {aiLoading ? (
                                                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                        <Sparkles className="w-4 h-4" />
                                                    </motion.div> Генерирую...</>
                                                ) : <><Wand2 className="w-4 h-4" /> Сгенерировать резюме</>}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SCREEN 2: CONTACTS ── */}
                                {aiScreen === "contacts" && (
                                    <motion.div key="ai-contacts"
                                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-7 py-5 space-y-5">

                                        {/* Generated summary */}
                                        <div className="p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}>
                                            <p className="text-sm font-semibold mb-3" style={{ color: "rgb(99,102,241)" }}>
                                                ИИ успешно создал ваше резюме
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.title && (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                        style={{ background: "rgba(99,102,241,0.15)", color: "rgb(99,102,241)" }}>
                                                        {formData.title}
                                                    </span>
                                                )}
                                                {aiGeneratedStats.workCount > 0 && (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                        style={{ background: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)" }}>
                                                        {aiGeneratedStats.workCount} {aiGeneratedStats.workCount === 1 ? "место работы" : aiGeneratedStats.workCount < 5 ? "места работы" : "мест работы"}
                                                    </span>
                                                )}
                                                {aiGeneratedStats.skillCount > 0 && (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                        style={{ background: "rgba(245,158,11,0.1)", color: "rgb(245,158,11)" }}>
                                                        {aiGeneratedStats.skillCount} навыков
                                                    </span>
                                                )}
                                                {aiGeneratedStats.eduCount > 0 && (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                        style={{ background: "rgba(139,92,246,0.12)", color: "rgb(139,92,246)" }}>
                                                        {aiGeneratedStats.eduCount} {aiGeneratedStats.eduCount === 1 ? "образование" : "образования"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs mt-2" style={{ color: "rgb(var(--text-3))" }}>
                                                Вы сможете отредактировать всё содержимое после сохранения
                                            </p>
                                        </div>

                                        {/* Contact form */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-3))" }}>
                                                Ваши контактные данные
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                        Имя *
                                                    </label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                        <input type="text" value={contactForm.firstName}
                                                            onChange={e => setContactForm(p => ({ ...p, firstName: e.target.value }))}
                                                            placeholder="Иван"
                                                            className="w-full pl-9 pr-4 py-3 rounded-xl outline-none text-sm" style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                        Фамилия *
                                                    </label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                        <input type="text" value={contactForm.lastName}
                                                            onChange={e => setContactForm(p => ({ ...p, lastName: e.target.value }))}
                                                            placeholder="Иванов"
                                                            className="w-full pl-9 pr-4 py-3 rounded-xl outline-none text-sm" style={inputStyle} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                    <input type="email" value={contactForm.contactEmail}
                                                        onChange={e => setContactForm(p => ({ ...p, contactEmail: e.target.value }))}
                                                        placeholder="ivan@example.com"
                                                        className="w-full pl-9 pr-4 py-3 rounded-xl outline-none text-sm" style={inputStyle} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-2))" }}>
                                                    Телефон
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(99,102,241)" }} />
                                                    <input type="tel" value={contactForm.contactPhone}
                                                        onChange={e => setContactForm(p => ({ ...p, contactPhone: e.target.value }))}
                                                        placeholder="+7 900 000-00-00"
                                                        className="w-full pl-9 pr-4 py-3 rounded-xl outline-none text-sm" style={inputStyle} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-1">
                                            <button type="button" onClick={() => setAiScreen("form")}
                                                className="btn-ghost flex items-center gap-2 px-4 py-2.5" disabled={isLoading}>
                                                <ChevronLeft className="w-4 h-4" /> Изменить
                                            </button>
                                            <motion.button type="button" onClick={handleAiSave} disabled={isLoading}
                                                whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                                                style={{ background: isLoading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,rgb(99,102,241),rgb(168,85,247))", color: "#fff", cursor: isLoading ? "not-allowed" : "pointer" }}>
                                                {isLoading ? (
                                                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                        <Sparkles className="w-4 h-4" />
                                                    </motion.div> Сохраняю...</>
                                                ) : <><Save className="w-4 h-4" /> Создать резюме</>}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
