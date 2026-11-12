import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sampleMasters, categories, regions } from '../data';
import { Star, MapPin, Crown, CheckCircle, Search, Filter } from 'lucide-react';
import RegionFilter from '../components/RegionFilter';

export default function Masters() {
  const { t, language, selectedRegion, selectedDistrict } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Фильтрация
  const filteredMasters = sampleMasters.filter(master => {
    // Поиск
    const matchesSearch = !searchQuery ||
      master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'uz' ? master.descriptionUz : master.descriptionRu).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Категория
    const matchesCategory = !categoryFilter || master.category === categoryFilter;
    
    // Регион (область И район)
    const matchesRegion = !selectedRegion || master.region === selectedRegion;
    const matchesDistrict = !selectedDistrict || master.district === selectedDistrict;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesDistrict;
  });

  // Сортировка
  const sortedMasters = [...filteredMasters];
  if (sortBy === 'rating') {
    sortedMasters.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'reviews') {
    sortedMasters.sort((a, b) => b.reviews - a.reviews);
  } else if (sortBy === 'jobs') {
    sortedMasters.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
  }

  // Получить название района
  const getDistrictName = (regionId: string, districtId: string) => {
    const region = regions.find(r => r.id === regionId);
    const district = region?.districts.find(d => d.id === districtId);
    return language === 'uz' ? district?.nameUz : district?.nameRu;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('masters')}</h1>

        {/* Поиск */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Кнопка фильтров */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <Filter className="w-5 h-5" />
          {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
        </button>

        {/* Фильтры */}
        {showFilters && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Категория */}
              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'uz' ? cat.nameUz : cat.nameRu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Регион (двухуровневый) */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2">Регион</label>
                <RegionFilter />
              </div>

              {/* Сортировка */}
              <div>
                <label className="block text-sm font-medium mb-2">Сортировка</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="rating">По рейтингу</option>
                  <option value="reviews">По отзывам</option>
                  <option value="jobs">По количеству работ</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Результатов */}
        <div className="mb-4 text-gray-500 text-sm">
          Найдено: {sortedMasters.length} мастеров
        </div>

        {/* Список мастеров */}
        <div className="space-y-4">
          {sortedMasters.length > 0 ? sortedMasters.map(master => {
            const regionName = language === 'uz' 
              ? regions.find(r => r.id === master.region)?.nameUz 
              : regions.find(r => r.id === master.region)?.nameRu;
            const districtName = getDistrictName(master.region, master.district);
            
            return (
              <div key={master.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Аватар и ссылка на профиль */}
                  <Link to={`/master/${master.id}`} className="relative block">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white shadow-sm sm:h-24 sm:w-24">
                      {master.name.charAt(0)}
                    </div>
                    {master.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </Link>

                  {/* Информация - ссылка на профиль */}
                  <div className="flex-1">
                    <Link to={`/master/${master.id}`} className="block">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{master.name}</h3>
                        {master.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                        {master.isVIP && <Crown className="w-5 h-5 text-yellow-500" />}
                      </div>
                      <p className="text-gray-500 mb-2">
                        {language === 'uz'
                          ? categories.find(c => c.id === master.category)?.nameUz
                          : categories.find(c => c.id === master.category)?.nameRu}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{master.rating}</span>
                          <span className="text-gray-400">({master.reviews})</span>
                        </div>
                        <span className="text-gray-400">|</span>
                        <span>{master.experience} лет</span>
                        <span className="text-gray-400">|</span>
                        <span>{master.jobsCompleted} работ</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{regionName}, {districtName}</span>
                      </div>
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {language === 'uz' ? master.descriptionUz : master.descriptionRu}
                      </p>
                    </Link>
                  </div>

                  {/* Статус и кнопка Написать */}
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm text-center ${
                      master.isOnline ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {master.isOnline ? t('online') : t('recently')}
                    </span>
                    <Link
                      to={`/chat/${master.id}`}
                      className="block rounded-xl bg-blue-700 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('write')}
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-2xl p-12 text-center border">
              <p className="text-gray-500">Мастеров не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}