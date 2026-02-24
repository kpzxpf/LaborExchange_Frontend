'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeService, skillService, educationService } from '@/services/api';
import { EducationDto } from '@/types';

interface EducationForm {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
}

export default function CreateResumePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Basic info
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [experienceYears, setExperienceYears] = useState(0);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // Step 2: Skills
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<string[]>([]);

    // Step 3: Education
    const [educations, setEducations] = useState<EducationForm[]>([]);
    const [eduForm, setEduForm] = useState<EducationForm>({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: new Date().getFullYear(),
    });

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
        }
        setSkillInput('');
    };

    const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

    const addEducation = () => {
        if (eduForm.institution && eduForm.degree) {
            setEducations([...educations, { ...eduForm }]);
            setEduForm({ institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear() });
        }
    };

    const handleSubmit = async () => {
        if (!title) return setError('Введите название резюме');
        setLoading(true);
        setError('');

        try {
            // 1. Create resume
            const resume = await resumeService.create({
                userId: 0, // will be set by backend from JWT
                title,
                summary,
                experienceYears,
                contactEmail,
                contactPhone,
                isPublished: false,
            });

            // 2. Add skills via find-or-create pattern, then link to resume
            for (const name of skills) {
                const skill = await skillService.findOrCreate(name);
                await resumeService.addSkill(resume.id, skill.id);
            }

            // 3. Add education records
            for (const edu of educations) {
                await educationService.create(resume.id, {
                    ...edu,
                    resumeId: resume.id,
                });
            }

            router.push('/jobseeker/resumes');
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка при создании резюме');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Основная информация', 'Навыки', 'Образование'];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');`}</style>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl font-bold text-white mb-2">
                        Создать резюме
                    </h1>
                    <p className="text-white/50">Заполните информацию о себе</p>
                </motion.div>

                {/* Steps indicator */}
                <div className="flex gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={i} className="flex-1">
                            <div className={`h-1 rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-violet-500' : 'bg-white/10'}`} />
                            <span className={`text-xs mt-1 block ${i + 1 === step ? 'text-violet-400' : 'text-white/30'}`}>{s}</span>
                        </div>
                    ))}
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -40 }} className="space-y-5">
                            <Field label="Название резюме *" value={title} onChange={setTitle}
                                   placeholder="Например: Senior Frontend Developer" />
                            <Field label="О себе" value={summary} onChange={setSummary}
                                   placeholder="Краткое описание вашего опыта и целей" multiline />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-white/50 mb-1 block">Опыт работы (лет)</label>
                                    <input type="number" min={0} max={50} value={experienceYears}
                                           onChange={e => setExperienceYears(Number(e.target.value))}
                                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                                </div>
                                <Field label="Email для связи" value={contactEmail} onChange={setContactEmail}
                                       placeholder="your@email.com" />
                            </div>
                            <Field label="Телефон для связи" value={contactPhone} onChange={setContactPhone}
                                   placeholder="+7 900 000 00 00" />
                        </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -40 }} className="space-y-5">
                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Добавить навык</label>
                                <div className="flex gap-2">
                                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                           onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                           placeholder="Введите название навыка..."
                                           className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                                    <button onClick={addSkill}
                                            className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium text-sm transition-colors">
                                        + Добавить
                                    </button>
                                </div>
                            </div>

                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {skills.map(s => (
                                            <motion.span key={s} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                         exit={{ scale: 0, opacity: 0 }}
                                                         className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 rounded-full text-sm text-violet-300">
                                                {s}
                                                <button onClick={() => removeSkill(s)} className="text-violet-400/60 hover:text-red-400 transition-colors">×</button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {skills.length === 0 && (
                                <p className="text-white/30 text-sm py-6 text-center border border-dashed border-white/10 rounded-xl">
                                    Навыки не добавлены. Нажмите Enter или кнопку для добавления.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -40 }} className="space-y-5">
                            <div className="p-4 bg-white/3 border border-white/10 rounded-xl space-y-4">
                                <h3 className="text-sm font-medium text-white/70">Добавить место учёбы</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Учебное заведение" value={eduForm.institution}
                                           onChange={v => setEduForm({ ...eduForm, institution: v })}
                                           placeholder="МГУ, МФТИ..." />
                                    <Field label="Степень/Уровень" value={eduForm.degree}
                                           onChange={v => setEduForm({ ...eduForm, degree: v })}
                                           placeholder="Бакалавр, Магистр..." />
                                    <Field label="Специальность" value={eduForm.fieldOfStudy}
                                           onChange={v => setEduForm({ ...eduForm, fieldOfStudy: v })}
                                           placeholder="Информатика..." />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-white/50 mb-1 block">С года</label>
                                            <input type="number" value={eduForm.startYear}
                                                   onChange={e => setEduForm({ ...eduForm, startYear: Number(e.target.value) })}
                                                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/50 mb-1 block">По год</label>
                                            <input type="number" value={eduForm.endYear || ''}
                                                   onChange={e => setEduForm({ ...eduForm, endYear: Number(e.target.value) || undefined })}
                                                   placeholder="—"
                                                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={addEducation}
                                        className="w-full py-2 border border-dashed border-violet-500/40 rounded-lg text-violet-400 text-sm hover:bg-violet-500/10 transition-colors">
                                    + Добавить
                                </button>
                            </div>

                            <div className="space-y-2">
                                <AnimatePresence>
                                    {educations.map((edu, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex items-start justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="font-medium text-sm text-white">{edu.institution}</p>
                                                <p className="text-xs text-white/50">{edu.degree}, {edu.fieldOfStudy}</p>
                                                <p className="text-xs text-white/30">{edu.startYear} — {edu.endYear || 'наст. время'}</p>
                                            </div>
                                            <button onClick={() => setEducations(educations.filter((_, j) => j !== i))}
                                                    className="text-white/30 hover:text-red-400 transition-colors text-lg ml-4">×</button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)}
                                className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:border-white/20 transition-colors">
                            Назад
                        </button>
                    )}
                    {step < 3 ? (
                        <button onClick={() => { if (step === 1 && !title) { setError('Введите название резюме'); return; } setError(''); setStep(step + 1); }}
                                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors">
                            Далее
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-medium transition-all disabled:opacity-50">
                            {loading ? 'Создание...' : 'Создать резюме'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, multiline }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; multiline?: boolean;
}) {
    const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors resize-none";
    return (
        <div>
            <label className="text-sm text-white/50 mb-1 block">{label}</label>
            {multiline ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
            ) : (
                <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
            )}
        </div>
    );
}