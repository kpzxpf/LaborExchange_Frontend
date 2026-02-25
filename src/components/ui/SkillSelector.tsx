"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { skillService } from "@/services/api";

interface Skill {
    id: number;
    name: string;
}

interface SkillSelectorProps {
    selected: number[];
    onChange: (skillIds: number[]) => void;
    placeholder?: string;
    maxSkills?: number;
    className?: string;
}

export function SkillSelector({
                                  selected,
                                  onChange,
                                  placeholder = "Добавьте навыки...",
                                  maxSkills = 20,
                                  className,
                              }: SkillSelectorProps) {
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load all skills on mount
    useEffect(() => {
        loadSkills();
    }, []);

    // Load selected skills details
    useEffect(() => {
        if (selected.length > 0 && allSkills.length > 0) {
            const skills = allSkills.filter((s) => selected.includes(s.id));
            setSelectedSkills(skills);
        } else {
            setSelectedSkills([]);
        }
    }, [selected, allSkills]);

    // Filter skills based on input
    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = allSkills.filter(
                (skill) =>
                    skill.name.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !selected.includes(skill.id)
            );
            setFilteredSkills(filtered);
            setHighlightedIndex(0);
        } else {
            setFilteredSkills([]);
        }
    }, [inputValue, allSkills, selected]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadSkills = async () => {
        try {
            setIsLoading(true);
            const skills = await skillService.getAll();
            setAllSkills(skills);
        } catch (error) {
            console.error("Failed to load skills:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSkill = async (skill: Skill) => {
        if (selected.length >= maxSkills) {
            alert(`Максимум ${maxSkills} навыков`);
            return;
        }

        onChange([...selected, skill.id]);
        setInputValue("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleCreateNewSkill = async () => {
        if (!inputValue.trim()) return;

        if (selected.length >= maxSkills) {
            alert(`Максимум ${maxSkills} навыков`);
            return;
        }

        try {
            setIsLoading(true);
            const newSkill = await skillService.findOrCreate(inputValue.trim());
            setAllSkills((prev) => [...prev, newSkill]);
            onChange([...selected, newSkill.id]);
            setInputValue("");
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create skill:", error);
            alert("Не удалось создать навык");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSkill = (skillId: number) => {
        onChange(selected.filter((id) => id !== skillId));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === "ArrowDown") {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredSkills.length ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex === filteredSkills.length) {
                    handleCreateNewSkill();
                } else if (filteredSkills[highlightedIndex]) {
                    handleAddSkill(filteredSkills[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setInputValue("");
                break;
        }
    };

    const showCreateOption =
        inputValue.trim() &&
        !allSkills.some(
            (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
        );

    return (
        <div className={cn("w-full", className)}>
            {/* Label */}
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Навыки и технологии
                <span className="text-xs text-gray-500">
          ({selectedSkills.length}/{maxSkills})
        </span>
            </label>

            {/* Selected Skills */}
            <AnimatePresence mode="popLayout">
                {selectedSkills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-3"
                    >
                        {selectedSkills.map((skill) => (
                            <motion.div
                                key={skill.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative"
                            >
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">
                                    <span>{skill.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill.id)}
                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Field */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={selected.length >= maxSkills}
                        className={cn(
                            "w-full pl-10 pr-10 py-3 border-2 rounded-xl",
                            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                            "transition-all duration-200",
                            "bg-white dark:bg-gray-800",
                            "border-gray-200 dark:border-gray-700",
                            "text-gray-900 dark:text-gray-100",
                            "placeholder:text-gray-400",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            isOpen && "ring-2 ring-indigo-500 border-transparent"
                        )}
                    />
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {isOpen && (inputValue || filteredSkills.length > 0) && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto">
                                {isLoading ? (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="inline-block"
                                        >
                                            <Sparkles className="w-6 h-6" />
                                        </motion.div>
                                        <p className="mt-2">Загрузка...</p>
                                    </div>
                                ) : filteredSkills.length === 0 && !showCreateOption ? (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        {inputValue ? "Ничего не найдено" : "Начните вводить..."}
                                    </div>
                                ) : (
                                    <>
                                        {filteredSkills.map((skill, index) => (
                                            <motion.button
                                                key={skill.id}
                                                type="button"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => handleAddSkill(skill)}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors",
                                                    "flex items-center gap-3",
                                                    highlightedIndex === index && "bg-indigo-50 dark:bg-indigo-900/20"
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                                                    {skill.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">
                          {skill.name}
                        </span>
                                            </motion.button>
                                        ))}

                                        {showCreateOption && (
                                            <motion.button
                                                type="button"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: filteredSkills.length * 0.05 }}
                                                onClick={handleCreateNewSkill}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
                                                    "flex items-center gap-3 border-t border-gray-200 dark:border-gray-700",
                                                    highlightedIndex === filteredSkills.length &&
                                                    "bg-green-50 dark:bg-green-900/20"
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                                                    <Plus className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                        Создать "{inputValue}"
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Добавить новый навык
                                                    </p>
                                                </div>
                                            </motion.button>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Helper Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
                💡 Начните вводить название навыка. Нажмите Enter для создания нового.
            </motion.p>
        </div>
    );
}