import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { MapPin, Clock, Calendar, DollarSign, ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function JobDetail() {
  const { t, language, isLoggedIn, user } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ищем заказ в общем хранилище all_jobs
    const saved = localStorage.getItem('all_jobs');
    if (saved) {
      try {
        const allJobs = JSON.parse(saved);
        const foundJob = allJobs.find((j: any) => j.id === id);
        setJob(foundJob || null);
      } catch (e) {
        console.error('Ошибка загрузки заказов', e);
      }
    }
    setLoading(false);
  }, [id]);

  // Проверка, является ли текущий пользователь автором заказа
  const isAuthor = user?.id && job?.authorId === user.id;

  // Функция удаления заказа
  const handleDelete = () => {
    if (confirm(language === 'uz' ? 'Bu buyurtmani o\'chirmoqchimisiz?' : 'Удалить этот заказ?')) {
      const saved = localStorage.getItem('all_jobs');
      if (saved) {
        try {
          const allJobs = JSON.parse(saved);
          const filteredJobs = allJobs.filter((j: any) => j.id !== job.id);
          localStorage.setItem('all_jobs', JSON.stringify(filteredJobs));
          navigate('/jobs');
        } catch (e) {
          console.error('Ошибка удаления заказа', e);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Данные не найдены</h2>
          <p className="text-gray-500 mb-4">Заказ с ID: {id} не найден</p>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700">
            {t('jobs')}
          </Link>
        </div>
      </div>
    );
  }

  const currentRegion = regions.find(r => r.id === job.region);
  const currentCategory = categories.find(c => c.id === job.category);

  const formatBudget = (budget: number) => {
    return budget.toLocaleString('ru-RU') + ' ' + t('sum');
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return t('today') + ', ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (hours < 48) return t('yesterday') + ', ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ru-RU');
  };

  const getDistrictName = () => {
    if (!job.district) return '';
    const region = regions.find(r => r.id === job.region);
    const district = region?.districts.find(d => d.id === job.district);
    return language === 'uz' ? district?.nameUz : district?.nameRu;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/jobs"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('jobs')}
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentCategory?.color || 'bg-gray-500'
              } text-white`}>
                {language === 'uz' ? currentCategory?.nameUz : currentCategory?.nameRu}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {language === 'uz' ? job.titleUz : job.titleRu}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}
                {job.district && (
                  <span className="text-gray-400">({getDistrictName()})</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {getTimeAgo(job.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('responses')}: {job.responses}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div className="px-8 py-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">{t('budget')}</p>
                <p className="text-3xl font-bold text-green-600">{formatBudget(job.budget)}</p>
              </div>
              {job.area && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">{t('areaLabel')}</p>
                  <p className="text-xl font-semibold text-gray-900">{job.area} {t('sqm')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('description')}</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {language === 'uz' ? job.descriptionUz : job.descriptionRu}
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              {job.deadline && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('deadline')}</p>
                    <p className="font-medium">{job.deadline}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('published')}</p>
                  <p className="font-medium">{getTimeAgo(job.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 border-t border-gray-100">
            {isLoggedIn ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors">
                  {t('respondToJob')}
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  {t('writeCustomer')}
                </button>
                {/* Кнопка удаления — только для автора */}
                {isAuthor && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    {language === 'uz' ? 'O\'chirish' : 'Удалить'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  {language === 'uz'
                    ? 'Buyurtmaga javob berish uchun tizimga kiring'
                    : 'Войдите, чтобы откликнуться на заявку'}
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}