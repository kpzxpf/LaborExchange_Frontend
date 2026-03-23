'use client';

import { useState, useEffect } from 'react';
import { reviewService } from '@/services/api';
import { Star, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: number;
  authorId: number;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
}

interface ReviewSummary {
  companyId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

interface CompanyReviewsProps {
  companyId: number;
  companyName: string;
}

function StarRating({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={interactive ? 24 : 16}
          className={`${
            star <= (interactive ? (hovered || rating) : rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          } ${interactive ? 'cursor-pointer transition-colors' : ''}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export function CompanyReviews({ companyId, companyName }: CompanyReviewsProps) {
  const { userId, userRole } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 0, title: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, summaryRes] = await Promise.all([
          reviewService.getByCompany(companyId, 0, 5),
          reviewService.getSummary(companyId),
        ]);
        setReviews(reviewsRes.data.content || []);
        setSummary(summaryRes.data);
      } catch {
        // silently fail - reviews are non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) { toast.error('Выберите рейтинг'); return; }
    if (!formData.title.trim()) { toast.error('Введите заголовок'); return; }
    if (formData.text.trim().length < 10) { toast.error('Текст слишком короткий (мин. 10 символов)'); return; }
    setSubmitting(true);
    try {
      const res = await reviewService.create(companyId, formData);
      setReviews(prev => [res.data, ...prev]);
      setShowForm(false);
      setFormData({ rating: 0, title: '', text: '' });
      toast.success('Отзыв опубликован!');
      // Refresh summary
      const summaryRes = await reviewService.getSummary(companyId);
      setSummary(summaryRes.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Не удалось опубликовать отзыв';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Удалить отзыв?')) return;
    try {
      await reviewService.delete(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Отзыв удалён');
    } catch {
      toast.error('Не удалось удалить отзыв');
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Отзывы о компании {companyName}
          </h2>
        </div>
        {summary && summary.totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(summary.averageRating)} />
            <span className="font-bold text-gray-900 dark:text-white">
              {summary.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">({summary.totalReviews})</span>
          </div>
        )}
      </div>

      {/* Rating distribution */}
      {summary && summary.totalReviews > 0 && (
        <div className="mb-4 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = summary.ratingDistribution[star] || 0;
            const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-gray-600 dark:text-gray-400">{star}</span>
                <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Write review button (JOB_SEEKER only) */}
      {userId && userRole === 'JOB_SEEKER' && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Отмена' : '✏️ Написать отзыв'}
        </button>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Рейтинг *</label>
            <StarRating
              rating={formData.rating}
              interactive
              onRate={r => setFormData(p => ({ ...p, rating: r }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Кратко о компании"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Отзыв *</label>
            <textarea
              value={formData.text}
              onChange={e => setFormData(p => ({ ...p, text: e.target.value }))}
              placeholder="Расскажите о своём опыте работы в компании..."
              rows={4}
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Публикация...' : 'Опубликовать'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          Отзывов пока нет. Будьте первым!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, expanded ? undefined : 3).map(review => (
            <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <StarRating rating={review.rating} />
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mt-1">{review.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  {(userId === review.authorId || userRole === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
          {reviews.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? <><ChevronUp size={14} /> Скрыть</> : <><ChevronDown size={14} /> Показать все ({reviews.length})</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
