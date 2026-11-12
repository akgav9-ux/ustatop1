import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { MapPin, Clock, Search, Filter, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cache } from '../lib/cache';

export default function Jobs() {
  const { t, language, user } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [regionFilter, setRegionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (reset = true) => {
    setLoading(true);
    setLoadError(false);
    if (reset) {
      setAllJobs([]);
      setPage(0);
      setHasMore(true);
    }

    try {
      const from = reset ? 0 : page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('orders')
        .select('id, title_uz, title_ru, description_uz, description_ru, budget, category, region, district, created_at, responses, author_id')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Ошибка загрузки заказов:', error);
        setLoadError(true);
        if (reset) setAllJobs([]);
      } else {
        setLoadError(false);
        if (reset) {
          setAllJobs(data || []);
          cache.setOrders(data || []);
        } else {
          setAllJobs(prev => [...prev, ...(data || [])]);
        }
        setHasMore((data || []).length === pageSize);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadJobs(false);
    }
  };

  let filteredJobs = allJobs.filter(job => {
    const matchesSearch = !searchQuery ||
      ((language === 'uz' ? job.title_uz : job.title_ru) || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((language === 'uz' ? job.description_uz : job.description_ru) || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const selectedCategory = categories.find(category => category.id === categoryFilter);
    const matchesCategory = !categoryFilter || job.category === categoryFilter || job.category === selectedCategory?.nameUz || job.category === selectedCategory?.nameRu;
    const matchesRegion = !regionFilter || job.region === regionFilter;
    const matchesDistrict = !districtFilter || job.district === districtFilter;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesDistrict;
  });

  const formatBudget = (budget: number) => {
    return budget.toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU') + ' ' + t('sum');
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

  if (loading && allJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{language === 'uz' ? 'Yangi imkoniyatlar' : 'Новые возможности'}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t('jobs')}</h1>
          <p className="mt-2 mb-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{language === 'uz' ? 'Hududingizdagi buyurtmalarni toping va mijozlarga taklif yuboring.' : 'Находите заявки в своём регионе и предлагайте заказчикам свои услуги.'}</p>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'uz' ? 'Buyurtma qidirish...' : 'Поиск заявки...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            aria-expanded={showFilters}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            <Filter className="w-5 h-5" />
            {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterByCategory')}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'uz' ? cat.nameUz : cat.nameRu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterByRegion')}
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('allRegions')}</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {language === 'uz' ? region.nameUz : region.nameRu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uz' ? 'Tuman' : 'Район'}
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!regionFilter}
                >
                  <option value="">{language === 'uz' ? 'Barcha tumanlar' : 'Все районы'}</option>
                  {regions.find(r => r.id === regionFilter)?.districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {language === 'uz' ? district.nameUz : district.nameRu}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loadError && allJobs.length === 0 ? (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
              <p>{language === 'uz' ? 'Buyurtmalarni yuklab bo‘lmadi.' : 'Не удалось загрузить заявки.'}</p>
              <button type="button" onClick={() => loadJobs(true)} className="mt-3 rounded-xl bg-white px-4 py-2 font-semibold text-amber-800 shadow-sm">{language === 'uz' ? 'Qayta urinish' : 'Повторить'}</button>
            </div>
          ) : filteredJobs.length > 0 ? (
            <>
              {filteredJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/job/${job.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src="/images/job-icon.png" 
                        alt="job" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'uz' ? job.title_uz : job.title_ru}
                        </h3>
                        {job.author_id === user?.id && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            {language === 'uz' ? 'Sizning' : 'Ваш'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {language === 'uz'
                            ? regions.find(r => r.id === job.region)?.nameUz
                            : regions.find(r => r.id === job.region)?.nameRu}
                          {job.district && (
                            <span className="text-gray-400 ml-1">
                              ({getDistrictName(job.region, job.district)})
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeAgo(job.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {language === 'uz' ? job.description_uz : job.description_ru}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
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
              
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mx-auto"></div>
                    ) : (
                      language === 'uz' ? 'Ko\'proq yuklash' : 'Загрузить ещё'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Briefcase className="h-7 w-7" /></div>
              <h2 className="text-lg font-bold text-slate-900">{t('noJobs')}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{language === 'uz' ? 'Boshqa so‘z yoki hudud bilan qidirib ko‘ring. Yangi buyurtmalar shu yerda paydo bo‘ladi.' : 'Попробуйте изменить запрос или выбрать другой регион. Новые заявки будут появляться здесь.'}</p>
              <button type="button" onClick={() => { setSearchQuery(''); setCategoryFilter(''); setRegionFilter(''); setDistrictFilter(''); }} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{language === 'uz' ? 'Filtrlarni tozalash' : 'Сбросить фильтры'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}