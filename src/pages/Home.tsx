import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { ChevronRight, Star, Clock, MapPin, Crown, Trophy, ArrowUpRight } from 'lucide-react';

export default function Home() {
  const { t, language } = useApp();
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('all_jobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sorted = [...parsed].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentJobs(sorted.slice(0, 10));
      } catch (e) {
        console.error('Ошибка загрузки заказов', e);
      }
    }
  }, []);

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

  const getDistrictName = (regionId: string, districtId: string) => {
    const region = regions.find(r => r.id === regionId);
    const district = region?.districts.find(d => d.id === districtId);
    return language === 'uz' ? district?.nameUz : district?.nameRu;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div>
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 lg:mb-6 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-gray-300 mb-3 sm:mb-6 lg:mb-8">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <Link to="/create-job" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl font-semibold text-xs sm:text-sm lg:text-lg transition-colors flex items-center gap-1 sm:gap-2">
                  {t('createJobBtn')}
                  <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5" />
                </Link>
                <Link to="/masters" className="bg-white/10 hover:bg-white/20 text-white px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl font-semibold text-xs sm:text-sm lg:text-lg transition-colors border border-white/20">
                  {t('masters')}
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🔧</div>
                    <p className="text-gray-400">{language === 'uz' ? 'Minglab ustalar' : 'Тысячи мастеров'}</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white text-gray-900 p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">500+</p>
                      <p className="text-sm text-gray-500">{language === 'uz' ? 'Tasdiqlangan ustalar' : 'Проверенных мастеров'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - теперь ведут на заказы по категории */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-6 lg:mb-8">
          {language === 'uz' ? 'Kategoriyalar' : 'Категории'}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/jobs?category=${cat.id}`} className="group relative rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden aspect-square block shadow-sm hover:shadow-md transition-all">
              <img src={cat.icon} alt={language === 'uz' ? cat.nameUz : cat.nameRu} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
              <div className="absolute bottom-1 left-2 right-2 text-left">
                <span className="text-white font-medium text-xs leading-tight block truncate">
                  {language === 'uz' ? cat.nameUz : cat.nameRu}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fresh Jobs */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{t('freshJobs')}</h2>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-xs sm:text-base">
            {t('viewAll')}
            <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5" />
          </Link>
        </div>
        <div className="space-y-2 sm:space-y-4">
          {recentJobs.length > 0 ? recentJobs.map(job => (
            <Link key={job.id} to={`/job/${job.id}`} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 hover:shadow-lg transition-shadow border border-gray-100 block">
              <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-4">
                <div className="w-full md:w-24 lg:w-32 h-16 sm:h-24 bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                  <img src="/images/job-icon.png" alt="job" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-2">
                    {language === 'uz' ? job.titleUz : job.titleRu}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-xs text-gray-500 mb-0.5 sm:mb-2">
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      {language === 'uz' ? regions.find(r => r.id === job.region)?.nameUz : regions.find(r => r.id === job.region)?.nameRu}
                      {job.district && <span className="text-gray-400 ml-1">({getDistrictName(job.region, job.district)})</span>}
                    </span>
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {getTimeAgo(job.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 hidden sm:block">
                    {language === 'uz' ? job.descriptionUz : job.descriptionRu}
                  </p>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                  <p className="text-base sm:text-xl font-bold text-green-600 mb-0.5 sm:mb-2">
                    {formatBudget(job.budget)}
                  </p>
                  <span className="inline-block bg-blue-50 text-blue-600 px-1.5 sm:px-3 py-0.5 rounded-full text-xs sm:text-sm">
                    {t('responses')}: {job.responses || 0}
                  </span>
                </div>
              </div>
            </Link>
          )) : (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100">
              <p className="text-gray-500 text-sm sm:text-base">Пока нет активных заказов</p>
              <Link to="/create-job" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
                Создать первый заказ
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-6 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-8 lg:mb-12">{t('howItWorks')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8">
            {[
              { num: 1, title: t('step1Title'), desc: t('step1Desc'), icon: '📝' },
              { num: 2, title: t('step2Title'), desc: t('step2Desc'), icon: '📩' },
              { num: 3, title: t('step3Title'), desc: t('step3Desc'), icon: '⭐' },
              { num: 4, title: t('step4Title'), desc: t('step4Desc'), icon: '✅' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl sm:text-3xl mx-auto mb-2 sm:mb-4">
                  {step.icon}
                </div>
                <div className="w-5 h-5 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-1 sm:mb-3 text-xs sm:text-base">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-2 text-xs sm:text-base">{step.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-yellow-400" />
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold">{t('topProfile')}</h2>
              </div>
              <p className="text-purple-200 mb-3 sm:mb-6 text-xs sm:text-base">{t('vipDesc')}</p>
              <Link to="/register" className="inline-block bg-white text-purple-700 px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-50 transition-colors text-xs sm:text-base">
                {t('promoteProfile')}
              </Link>
            </div>
            <div className="text-4xl sm:text-6xl lg:text-8xl opacity-50">🏆</div>
          </div>
        </div>
      </section>
    </div>
  );
}