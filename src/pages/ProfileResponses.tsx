import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function ProfileResponses() {
  const { t, language, user } = useApp();
  const [myResponses, setMyResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем отклики из localStorage (если есть)
    const saved = localStorage.getItem('user_responses');
    if (saved) {
      try {
        const allResponses = JSON.parse(saved);
        const userResponses = allResponses.filter((resp: any) => resp.userId === user?.id);
        setMyResponses(userResponses);
      } catch (e) {
        console.error('Ошибка загрузки откликов', e);
      }
    }
    setLoading(false);
  }, [user]);

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
          {language === 'uz' ? 'Mening javoblarim' : 'Мои отклики'}
        </h1>

        {myResponses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">
              {language === 'uz' 
                ? 'Siz hali hech qanday buyurtmaga javob bermadingiz' 
                : 'Вы ещё не откликнулись ни на одну заявку'}
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {language === 'uz' ? 'Buyurtmalarni ko\'rish' : 'Смотреть заявки'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myResponses.map((response) => (
              <div
                key={response.id}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {language === 'uz' ? response.jobTitleUz : response.jobTitleRu}
                      </h3>
                      {response.status === 'pending' && (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                          {language === 'uz' ? 'Kutilmoqda' : 'Ожидает'}
                        </span>
                      )}
                      {response.status === 'accepted' && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          {language === 'uz' ? 'Qabul qilingan' : 'Принят'}
                        </span>
                      )}
                      {response.status === 'rejected' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          {language === 'uz' ? 'Rad etilgan' : 'Отклонён'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {response.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {response.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(response.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      to={`/job/${response.jobId}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      {language === 'uz' ? 'Buyurtmani ko\'rish' : 'Смотреть заявку'}
                    </Link>
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