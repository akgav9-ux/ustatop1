import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { regions } from '../data';
import { MapPin, Clock, ArrowLeft } from 'lucide-react';

export default function ProfileJobs() {
  const { t, language, user } = useApp();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMyJobs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMyJobs = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, title_uz, title_ru, description_uz, description_ru, budget, region, district, created_at, responses')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки заказов:', error);
        setLoadError(true);
      } else {
        setMyJobs(data || []);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (regionId?: string, districtId?: string) => {
    const region = regions.find(item => item.id === regionId);
    const district = region?.districts.find(item => item.id === districtId);
    const regionName = language === 'uz' ? region?.nameUz : region?.nameRu;
    const districtName = language === 'uz' ? district?.nameUz : district?.nameRu;
    return [regionName, districtName].filter(Boolean).join(', ') || (language === 'uz' ? 'Hudud ko‘rsatilmagan' : 'Регион не указан');
  };

  const formatBudget = (budget: number) => {
    return budget.toLocaleString('ru-RU') + ' ' + (t('sum') || 'сум');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'uz' ? 'Orqaga' : 'Назад'}
        </Link>

        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          {language === 'uz' ? 'Mening buyurtmalarim' : 'Мои заказы'}
        </h1>

        {!user ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-700">{language === 'uz' ? 'Buyurtmalaringizni ko‘rish uchun tizimga kiring.' : 'Войдите, чтобы просматривать свои заказы.'}</p>
            <Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">{language === 'uz' ? 'Kirish' : 'Войти'}</Link>
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{language === 'uz' ? 'Buyurtmalarni yuklab bo‘lmadi. Qayta urinib ko‘ring.' : 'Не удалось загрузить заказы. Попробуйте ещё раз.'}</div>
        ) : myJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">
              {language === 'uz' ? 'Siz hali hech qanday buyurtma yaratmadingiz' : 'Вы ещё не создали ни одного заказа'}
            </p>
            <Link
              to="/create-job"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {language === 'uz' ? 'Birinchi buyurtmani yaratish' : 'Создать первый заказ'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myJobs.map((job) => (
              <Link
                key={job.id}
                to={`/job/${job.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === 'uz' ? job.title_uz : job.title_ru}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {language === 'uz' ? job.description_uz : job.description_ru}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getLocationName(job.region, job.district)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 mb-2">
                      {formatBudget(job.budget)}
                    </p>
                    <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                      {t('responses')}: {job.responses || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}