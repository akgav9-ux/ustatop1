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
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'master')
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
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link to="/masters" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          {t('masters')}
        </Link>

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-5xl font-bold text-blue-700 shadow-lg">
                  {master.avatar_url
                    ? <img src={master.avatar_url} alt={master.name || 'Master'} className="h-full w-full object-cover" />
                    : (master.name || 'U').charAt(0).toUpperCase()}
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
                  {(language === 'uz' ? currentCategory?.nameUz : currentCategory?.nameRu) || (master.services?.length ? (language === 'uz' ? 'Xizmatlar' : 'Услуги') : (language === 'uz' ? 'Mutaxassis' : 'Специалист'))}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  {(Number(master.reviews) > 0 || Number(master.rating) > 0) && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-900">{Number(master.rating || 0).toFixed(1)}</span>
                      <span>({master.reviews || 0} {t('review')})</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {master.phone && <a href={`tel:${master.phone}`} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700">
                  <Phone className="h-5 w-5" />
                  {t('call')}
                </a>}
                <Link to={`/chat/${master.id}`} className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-800">
                  <MessageCircle className="w-5 h-5" />
                  {t('sendMessage')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('aboutMe')}</h2>
              <p className="whitespace-pre-line text-gray-600">
                {(language === 'uz' ? master.about_uz : master.about_ru) || (language === 'uz' ? 'Usta hali o‘zi haqida ma’lumot qo‘shmagan.' : 'Мастер пока не добавил описание о себе.')}
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 text-xl font-bold text-slate-900">{t('reviews')}</h2>
              <p className="text-sm leading-6 text-slate-500">
                {language === 'uz'
                  ? 'Haqiqiy mijozlar sharhlari ishlar bajarilgandan so‘ng shu yerda ko‘rinadi.'
                  : 'Здесь будут отображаться отзывы реальных заказчиков после завершённых работ.'}
              </p>
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
                        : (language === 'uz' ? 'Hozir oflayn' : 'Сейчас не в сети')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">{t('contactMaster')}</h3>
              {master.phone ? <a href={`tel:${master.phone}`} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700">
                <Phone className="h-5 w-5" />
                {master.phone}
              </a> : <p className="mb-3 text-center text-sm text-slate-500">{language === 'uz' ? 'Telefon raqam ko‘rsatilmagan' : 'Номер телефона не указан'}</p>}
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