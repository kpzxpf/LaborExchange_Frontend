'use client';

import { useState, useEffect } from 'react';
import { alertService } from '@/services/api';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: number;
  keywords: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  employmentType: string;
  workFormat: string;
  skillIds: number[];
  active: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    employmentType: '',
    workFormat: '',
  });

  useEffect(() => {
    alertService.getMySubscriptions()
      .then(res => setSubscriptions(res.data))
      .catch(() => toast.error('Не удалось загрузить подписки'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await alertService.create({
        keywords: formData.keywords || undefined,
        location: formData.location || undefined,
        minSalary: formData.minSalary ? Number(formData.minSalary) : undefined,
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : undefined,
        employmentType: formData.employmentType || undefined,
        workFormat: formData.workFormat || undefined,
      });
      setSubscriptions(prev => [...prev, res.data]);
      setShowForm(false);
      setFormData({ keywords: '', location: '', minSalary: '', maxSalary: '', employmentType: '', workFormat: '' });
      toast.success('Подписка создана! Вы получите email при появлении подходящих вакансий.');
    } catch {
      toast.error('Не удалось создать подписку');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await alertService.toggle(id);
      setSubscriptions(prev => prev.map(s => s.id === id ? res.data : s));
    } catch {
      toast.error('Не удалось изменить статус');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить подписку?')) return;
    try {
      await alertService.delete(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      toast.success('Подписка удалена');
    } catch {
      toast.error('Не удалось удалить подписку');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Подписки на вакансии</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Получайте email при появлении новых подходящих вакансий</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Создать подписку
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Новая подписка</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Все поля необязательны. Пустые = любое значение.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ключевые слова</label>
                <input type="text" value={formData.keywords} onChange={e => setFormData(p => ({...p, keywords: e.target.value}))}
                  placeholder="Java, Spring, Backend" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Город</label>
                <input type="text" value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                  placeholder="Москва" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Мин. зарплата</label>
                <input type="number" value={formData.minSalary} onChange={e => setFormData(p => ({...p, minSalary: e.target.value}))}
                  placeholder="80000" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Макс. зарплата</label>
                <input type="number" value={formData.maxSalary} onChange={e => setFormData(p => ({...p, maxSalary: e.target.value}))}
                  placeholder="300000" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип занятости</label>
                <select value={formData.employmentType} onChange={e => setFormData(p => ({...p, employmentType: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Любой</option>
                  <option value="FULL_TIME">Полная занятость</option>
                  <option value="PART_TIME">Частичная занятость</option>
                  <option value="CONTRACT">Контракт</option>
                  <option value="INTERNSHIP">Стажировка</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Формат работы</label>
                <select value={formData.workFormat} onChange={e => setFormData(p => ({...p, workFormat: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Любой</option>
                  <option value="REMOTE">Удалённо</option>
                  <option value="OFFICE">В офисе</option>
                  <option value="HYBRID">Гибрид</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Создать
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                Отмена
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Нет активных подписок</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Создайте подписку, чтобы получать уведомления о новых вакансиях</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map(sub => (
              <div key={sub.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 border shadow-sm ${sub.active ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {sub.keywords && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">🔍 {sub.keywords}</span>}
                      {sub.location && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">📍 {sub.location}</span>}
                      {sub.minSalary > 0 && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">💰 от {sub.minSalary.toLocaleString('ru-RU')} ₽</span>}
                      {sub.maxSalary > 0 && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">до {sub.maxSalary.toLocaleString('ru-RU')} ₽</span>}
                      {sub.employmentType && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">{sub.employmentType}</span>}
                      {sub.workFormat && <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">{sub.workFormat}</span>}
                      {!sub.keywords && !sub.location && !sub.minSalary && !sub.employmentType && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">Все вакансии</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${sub.active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {sub.active ? '● Активна' : '○ Приостановлена'}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(sub.id)} title={sub.active ? 'Приостановить' : 'Активировать'}
                      className="text-gray-400 hover:text-blue-500 transition-colors">
                      {sub.active ? <ToggleRight size={20} className="text-blue-500" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => handleDelete(sub.id)} title="Удалить"
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
