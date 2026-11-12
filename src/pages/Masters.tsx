import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { Star, MapPin, CheckCircle, Search, Filter, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type MasterRecord = {
  id: string;
  name?: string;
  avatar_url?: string | null;
  category?: string | null;
  rating?: number | null;
  reviews?: number | null;
  region?: string | null;
  district?: string | null;
  is_online?: boolean | null;
  is_verified?: boolean | null;
  about_uz?: string | null;
  about_ru?: string | null;
  services?: Array<{name_uz?: string; name_ru?: string; nameUz?: string; nameRu?: string}> | null;
  experience?: number | null;
  jobs_completed?: number | null;
};

export default function Masters() {
  const { t, language } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [regionFilter, setRegionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [masters, setMasters] = useState<MasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMasters = async () => {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, category, rating, reviews, region, district, is_online, is_verified, about_uz, about_ru, services, experience, jobs_completed, created_at')
        .eq('role', 'master')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Ошибка загрузки мастеров:', error);
        setMasters([]);
        setLoadError(true);
      } else {
        setMasters((data || []) as MasterRecord[]);
      }
      setLoading(false);
    };

    loadMasters();
    return () => { active = false; };
  }, []);

  const filteredMasters = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const filtered = masters.filter(master => {
      const description = language === 'uz' ? master.about_uz : master.about_ru;
      const matchesSearch = !query ||
        (master.name || '').toLocaleLowerCase().includes(query) ||
        (description || '').toLocaleLowerCase().includes(query) || (master.services || []).some(service => ((language === 'uz' ? service.nameUz || service.name_uz : service.nameRu || service.name_ru) || '').toLocaleLowerCase().includes(query));
      const selectedCategory = categories.find(item => item.id === categoryFilter);
      const matchesCategory = !categoryFilter || master.category === categoryFilter || master.category === selectedCategory?.nameUz || master.category === selectedCategory?.nameRu;
      const matchesRegion = !regionFilter || master.region === regionFilter;
      const matchesDistrict = !districtFilter || master.district === districtFilter;
      return matchesSearch && matchesCategory && matchesRegion && matchesDistrict;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0);
      if (sortBy === 'jobs') return (b.jobs_completed || 0) - (a.jobs_completed || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [masters, searchQuery, categoryFilter, regionFilter, districtFilter, sortBy, language]);

  const getDistrictName = (regionId?: string | null, districtId?: string | null) => {
    const region = regions.find(item => item.id === regionId);
    const district = region?.districts.find(item => item.id === districtId);
    return language === 'uz' ? district?.nameUz : district?.nameRu;
  };

  const getRegionName = (regionId?: string | null) => {
    const region = regions.find(item => item.id === regionId);
    return language === 'uz' ? region?.nameUz : region?.nameRu;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            {language === 'uz' ? 'UstaTop mutaxassislari' : 'Специалисты UstaTop'}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t('masters')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {language === 'uz'
              ? 'Hududingizdagi xizmat ustalarini toping va ular bilan bevosita bogʻlaning.'
              : 'Найдите исполнителя в своём районе и свяжитесь с ним напрямую.'}
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder={t('search')}
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(value => !value)}
            aria-expanded={showFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <Filter className="h-4 w-4" />
            {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
          </button>
          <span className="text-sm text-slate-500">
            {language === 'uz' ? 'Topildi:' : 'Найдено:'} {filteredMasters.length}
          </span>
        </div>

        {showFilters && (
          <div className="mb-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {language === 'uz' ? 'Kategoriya' : 'Категория'}
              </label>
              <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option value="">{language === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</option>
                {categories.map(category => <option key={category.id} value={category.id}>{language === 'uz' ? category.nameUz : category.nameRu}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{language === 'uz' ? 'Hudud' : 'Регион'}</label>
              <select value={regionFilter} onChange={event => { setRegionFilter(event.target.value); setDistrictFilter(''); }} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option value="">{language === 'uz' ? 'Barcha hududlar' : 'Все регионы'}</option>
                {regions.map(region => <option key={region.id} value={region.id}>{language === 'uz' ? region.nameUz : region.nameRu}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{language === 'uz' ? 'Tuman' : 'Район'}</label>
              <select value={districtFilter} onChange={event => setDistrictFilter(event.target.value)} disabled={!regionFilter} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">{language === 'uz' ? 'Barcha tumanlar' : 'Все районы'}</option>
                {regions.find(region => region.id === regionFilter)?.districts.map(district => <option key={district.id} value={district.id}>{language === 'uz' ? district.nameUz : district.nameRu}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{language === 'uz' ? 'Saralash' : 'Сортировка'}</label>
              <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option value="rating">{language === 'uz' ? 'Reyting bo‘yicha' : 'По рейтингу'}</option>
                <option value="reviews">{language === 'uz' ? 'Sharhlar bo‘yicha' : 'По отзывам'}</option>
                <option value="jobs">{language === 'uz' ? 'Ishlar soni bo‘yicha' : 'По числу работ'}</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
            {language === 'uz' ? 'Ustalarni yuklab bo‘lmadi. Keyinroq qayta urinib ko‘ring.' : 'Не удалось загрузить мастеров. Попробуйте обновить страницу позже.'}
          </div>
        ) : filteredMasters.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredMasters.map(master => {
              const category = categories.find(item => item.id === master.category || item.nameUz === master.category || item.nameRu === master.category);
              const description = language === 'uz' ? master.about_uz : master.about_ru;
              return (
                <article key={master.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
                  <div className="flex gap-4">
                    <Link to={`/master/${master.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blue-50 sm:h-24 sm:w-24">
                      {master.avatar_url
                        ? <img src={master.avatar_url} alt={master.name || 'Master'} className="h-full w-full object-cover" />
                        : <span className="flex h-full w-full items-center justify-center text-blue-700"><UserRound className="h-9 w-9" /></span>}
                      {master.is_online && <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/master/${master.id}`} className="group">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="truncate text-lg font-bold text-slate-900 group-hover:text-blue-700">{master.name || (language === 'uz' ? 'Usta' : 'Мастер')}</h2>
                          {master.is_verified && <CheckCircle className="h-4 w-4 shrink-0 text-blue-600" />}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{(language === 'uz' ? category?.nameUz : category?.nameRu) || (master.services?.length ? (language === 'uz' ? 'Xizmatlar' : 'Услуги') : (language === 'uz' ? 'Mutaxassis' : 'Специалист'))}</p>
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {(Number(master.rating) > 0 || Number(master.reviews) > 0) && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(master.rating || 0).toFixed(1)} ({master.reviews || 0})</span>}
                        {master.experience != null && <span>{master.experience} {language === 'uz' ? 'yil tajriba' : 'лет опыта'}</span>}
                        {master.jobs_completed != null && <span>{master.jobs_completed} {language === 'uz' ? 'ish' : 'работ'}</span>}
                        {!master.rating && !master.reviews && master.experience == null && master.jobs_completed == null && <span>{language === 'uz' ? 'Yangi profil' : 'Новый профиль'}</span>}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{[getRegionName(master.region), getDistrictName(master.region, master.district)].filter(Boolean).join(', ') || (language === 'uz' ? 'Hudud ko‘rsatilmagan' : 'Регион не указан')}</p>
                    </div>
                  </div>
                  {description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${master.is_online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {master.is_online ? t('online') : (language === 'uz' ? 'Oflayn' : 'Не в сети')}
                    </span>
                    <Link to={`/chat/${master.id}`} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
                      {t('write')}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><UserRound className="h-7 w-7" /></div>
            <h2 className="text-lg font-bold text-slate-900">{language === 'uz' ? 'Ustalar hozircha topilmadi' : 'Пока нет мастеров по выбранным условиям'}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {language === 'uz' ? 'Boshqa hudud yoki kategoriya tanlang. Yangi ustalar ro‘yxatdan o‘tgan sari shu yerda ko‘rinadi.' : 'Попробуйте выбрать другой регион или категорию. Новые специалисты появятся здесь после регистрации.'}
            </p>
            <button type="button" onClick={() => { setSearchQuery(''); setCategoryFilter(''); setRegionFilter(''); setDistrictFilter(''); }} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {language === 'uz' ? 'Filtrlarni tozalash' : 'Сбросить поиск и категорию'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
