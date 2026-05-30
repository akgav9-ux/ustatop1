import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { MapPin, Clock, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cache } from '../lib/cache';

export default function Jobs() {
  const { t, language, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setAllJobs([]);
      setPage(0);
      setHasMore(true);
    }

    try {
      if (reset) {
        const cachedOrders = cache.getOrders();
        if (cachedOrders && cachedOrders.length <= pageSize) {
          setAllJobs(cachedOrders);
          setLoading(false);
          return;
        }
      }

      const from = reset ? 0 : page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('orders')
        .select('id, title_uz, title_ru, description_uz, description_ru, budget, category, region, district, created_at, responses, author_id')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Ошибка загрузки заказов:', error);
        setAllJobs([]);
      } else {
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
      (language === 'uz' ? job.title_uz : job.title_ru).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'uz' ? job.description_uz : job.description_ru)?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || job.category === categoryFilter;
    const matchesRegion = !regionFilter || job.region === regionFilter;
    const matchesDistrict = !districtFilter || job.district === districtFilter;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesDistrict;
  });

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

  if (loading && allJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('jobs')}</h1>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'uz' ? 'Buyurtma qidirish...' : 'Поиск заявки...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Filter className="w-5 h-5" />
            {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterByCategory')}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.nameUz}>
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
          {filteredJobs.length > 0 ? (
            <>
              {filteredJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/job/${job.id}`}
                  className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100 block"
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
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-gray-500 text-lg">{t('noJobs')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}