import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, ArrowLeft } from 'lucide-react';

export default function ProfileJobs() {
  const { t, language, user } = useApp();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем заказы из общего хранилища all_jobs
    const saved = localStorage.getItem('all_jobs');
    if (saved) {
      try {
        const allJobs = JSON.parse(saved);
        // Фильтруем только заказы текущего пользователя
        const userJobs = allJobs.filter((job: any) => job.authorId === user?.id);
        setMyJobs(userJobs);
      } catch (e) {
        console.error('Ошибка загрузки заказов', e);
      }
    }
    setLoading(false);
  }, [user]);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'uz' ? 'Orqaga' : 'Назад'}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'uz' ? 'Mening buyurtmalarim' : 'Мои заказы'}
        </h1>

        {myJobs.length === 0 ? (
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
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100 block"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === 'uz' ? job.titleUz : job.titleRu}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {language === 'uz' ? job.descriptionUz : job.descriptionRu}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {language === 'uz'
                          ? job.region
                          : job.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
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