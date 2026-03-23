'use client';

import { useCompare } from '@/contexts/CompareContext';
import { Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function formatSalary(salary?: number) {
  if (!salary) return 'Не указана';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(salary);
}

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Сравнение вакансий</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          Добавьте до 3 вакансий для сравнения.<br/>
          Нажмите кнопку «Сравнить» на карточке вакансии.
        </p>
        <Link href="/jobseeker/vacancies" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Перейти к вакансиям
        </Link>
      </div>
    );
  }

  const rows: { label: string; key: keyof typeof items[0]; render?: (v: any) => string }[] = [
    { label: 'Компания', key: 'companyName' },
    { label: 'Зарплата', key: 'salary', render: formatSalary },
    { label: 'Местоположение', key: 'location', render: v => v || 'Не указано' },
    { label: 'Формат работы', key: 'workFormat', render: v => v || 'Не указан' },
    { label: 'Тип занятости', key: 'employmentType', render: v => v || 'Не указан' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/jobseeker/vacancies" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Сравнение вакансий ({items.length}/3)
            </h1>
          </div>
          <button
            onClick={clearCompare}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Очистить все
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <thead>
              <tr>
                <th className="w-40 p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Параметр
                </th>
                {items.map(v => (
                  <th key={v.id} className="p-4 text-left border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/jobseeker/vacancies/${v.id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm">
                          {v.title}
                        </Link>
                        {v.companyName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{v.companyName}</p>
                        )}
                      </div>
                      <button onClick={() => removeFromCompare(v.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80">
                    {row.label}
                  </td>
                  {items.map(v => {
                    const raw = v[row.key];
                    const displayed = row.render ? row.render(raw) : (raw as string) || 'Не указано';
                    return (
                      <td key={v.id} className="p-4 text-sm text-gray-900 dark:text-white">
                        {displayed}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Skills comparison row */}
              <tr>
                <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 align-top">
                  Навыки
                </td>
                {items.map(v => {
                  // Find all unique skills across all compared vacancies
                  const allSkills = [...new Set(items.flatMap(i => i.skills || []))].sort();
                  return (
                    <td key={v.id} className="p-4 align-top">
                      <div className="space-y-1">
                        {allSkills.map(skill => {
                          const has = v.skills?.includes(skill);
                          return (
                            <div key={skill} className={`flex items-center gap-1.5 text-xs ${has ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>
                              {has ? <Check size={12} /> : <X size={12} />}
                              <span>{skill}</span>
                            </div>
                          );
                        })}
                        {(v.skills?.length || 0) === 0 && (
                          <span className="text-xs text-gray-400">Не указаны</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-400 dark:text-gray-500 text-center">
          Добавляйте вакансии к сравнению из списка вакансий. Максимум 3 вакансии.
        </div>
      </div>
    </div>
  );
}
