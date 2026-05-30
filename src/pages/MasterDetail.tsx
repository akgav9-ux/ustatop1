import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { Star, MapPin, Crown, CheckCircle, Phone, MessageCircle, Briefcase, Clock, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MasterDetail() {
  const { t, language } = useApp();
  const { id } = useParams<{ id: string }>();
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaster = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Ошибка загрузки мастера:', error);
        setMaster(null);
      } else {
        setMaster(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchMaster();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('noData')}</h2>
          <Link to="/masters" className="text-blue-600 hover:text-blue-700">
            {t('masters')}
          </Link>
        </div>
      </div>
    );
  }

  const currentRegion = regions.find(r => r.id === master.region);
  const currentCategory = categories.find(c => c.id === master.category);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/masters" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          {t('masters')}
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl font-bold text-blue-600 border-4 border-white">
                  {master.name.charAt(0)}
                </div>
                {master.is_online && (
                  <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{master.name}</h1>
                  {master.is_verified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  {master.is_vip && <Crown className="w-6 h-6 text-yellow-500" />}
                </div>
                <p className="text-gray-500 mt-1">
                  {language === 'uz' ? currentCategory?.nameUz : currentCategory?.nameRu}
                </p>
                <div className="flex items-center gap-4 text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{master.rating}</span>
                    <span>({master.reviews} {t('review')})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={`tel:${master.phone}`} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                  <Phone className="w-5 h-5" />
                  {t('call')}
                </a>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  <MessageCircle className="w-5 h-5" />
                  {t('sendMessage')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('aboutMe')}</h2>
              <p className="text-gray-600">
                {language === 'uz' ? master.description_uz : master.description_ru}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('services')}</h2>
              <div className="space-y-3">
                {master.services?.map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-900">
                      {language === 'uz' ? service.nameUz : service.nameRu}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {service.price.toLocaleString('ru-RU')} {t('sum')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('reviews')}</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div>
                    <div>
                      <p className="font-medium">Ali R.</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {language === 'uz'
                      ? 'Juda yaxshi usta, ishni sifatli bajardi. Tavsiya qilaman!'
                      : 'Отличный мастер, выполнил работу качественно. Рекомендую!'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">B</div>
                    <div>
                      <p className="font-medium">Bobur K.</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {language === 'uz'
                      ? 'Yaxshi ish, lekin biroz kechiktirdi.'
                      : 'Хорошая работа, но немного задержался.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">{t('myProfile')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('experience')}</p>
                    <p className="font-semibold">{master.experience} {t('years')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('completedJobs')}</p>
                    <p className="font-semibold">{master.jobs_completed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{master.is_online ? t('online') : t('recently')}</p>
                    <p className="font-semibold">
                      {master.is_online
                        ? (language === 'uz' ? 'Hozir onlayn' : 'Сейчас онлайн')
                        : (language === 'uz' ? '2 soat oldin' : '2 часа назад')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">{t('contactMaster')}</h3>
              <a href={`tel:${master.phone}`} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium mb-3">
                <Phone className="w-5 h-5" />
                {master.phone}
              </a>
              <button className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                <MessageCircle className="w-5 h-5" />
                {t('sendMessage')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}