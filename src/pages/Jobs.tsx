import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { MapPin, Clock, Search, Filter } from 'lucide-react';

export default function Jobs() {
  const { t, language, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('all_jobs');
    console.log('Загруженные заказы из localStorage:', saved);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Убираем фильтр по дате для теста
        setAllJobs(parsed);
        console.log('Все заказы:', parsed);
      } catch (e) {
        console.error('Ошибка загрузки заказов', e);
      }
    }
    setLoading(false);
  }, []);

  let filteredJobs = allJobs.filter(job => {
    const matchesSearch = !searchQuery ||
      (language === 'uz' ? job.titleUz : job.titleRu).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'uz' ? job.descriptionUz : job.descriptionRu).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || job.category === categoryFilter;
    const matchesRegion = !regionFilter || job.region === regionFilter;
    const matchesDistrict = !districtFilter || job.district === districtFilter;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesDistrict;
  });

  filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
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
                      {language === 'uz' ? job.titleUz : job.titleRu}
                    </h3>
                    {job.authorId === user?.id && (
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
                      {getTimeAgo(job.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {language === 'uz' ? job.descriptionUz : job.descriptionRu}
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
          )) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-gray-500 text-lg">{t('noJobs')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}