'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VacancyToCompare {
  id: number;
  title: string;
  companyName?: string;
  salary?: number;
  location?: string;
  workFormat?: string;
  employmentType?: string;
  skills?: string[];
}

interface CompareContextType {
  items: VacancyToCompare[];
  addToCompare: (vacancy: VacancyToCompare) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<VacancyToCompare[]>([]);

  const addToCompare = useCallback((vacancy: VacancyToCompare) => {
    setItems(prev => {
      if (prev.find(v => v.id === vacancy.id)) return prev;
      if (prev.length >= 3) {
        // Replace the oldest
        return [...prev.slice(1), vacancy];
      }
      return [...prev, vacancy];
    });
  }, []);

  const removeFromCompare = useCallback((id: number) => {
    setItems(prev => prev.filter(v => v.id !== id));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);
  const isInCompare = useCallback((id: number) => items.some(v => v.id === id), [items]);

  return (
    <CompareContext.Provider value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
