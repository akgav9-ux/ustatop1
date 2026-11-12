import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { ArrowRight, MapPin, Clock, Search, ShieldCheck, Wrench, ClipboardList, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cache } from '../lib/cache';

export default function Home() {
  const { t, language, isLoggedIn } = useApp();
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const cached = cache.getOrders();
        if (cached) {
          if (active) setRecentJobs(cached.slice(0, 4));
          return;
        }
        const { data, error } = await supabase
          .from('orders')
          .select('id, title_uz, title_ru, description_uz, description_ru, budget, region, district, created_at, responses')
          .order('created_at', { ascending: false })
          .limit(4);
        if (!error && active) {
          setRecentJobs(data || []);
          cache.setOrders(data || []);
        }
      } catch (error) {
        console.error('Не удалось загрузить свежие заказы:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const formatBudget = (budget: number) =>
    Number(budget || 0).toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU') + ' ' + t('sum');

  const getRegion = (id: string) => {
    const region = regions.find(item => item.id === id);
    return language === 'uz' ? region?.nameUz : region?.nameRu;
  };

  const getDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' });
  };

  const copy = language === 'uz'
    ? {
        eyebrow: 'O‘zbekiston bo‘ylab xizmatlar platformasi',
        title: 'Yaxshi usta topish endi oson',
        subtitle: 'Usta qidiring yoki buyurtma joylashtiring. UstaTop’da hammasi bepul.',
        find: 'Usta topish',
        post: 'Buyurtma berish',
        search: 'Qanday xizmat kerak?',
        categories: 'Xizmat yo‘nalishlari',
        categoriesHint: 'Kerakli xizmat turini tanlang',
        all: 'Barcha ustalar',
        fresh: 'Yangi buyurtmalar',
        view: 'Barchasini ko‘rish',
        how: 'UstaTop qanday ishlaydi?',
        steps: ['Xizmatni tanlang', 'Buyurtma joylashtiring', 'Ustalar bilan bog‘laning'],
        stepText: ['Kerakli mutaxassislikni toping', 'Ish tafsilotlarini bepul yozing', 'Takliflarni ko‘rib, ustani tanlang'],
        freeTitle: 'Hamma uchun bepul',
        freeText: 'Ro‘yxatdan o‘tish, buyurtma joylashtirish va ustalarga murojaat qilish uchun to‘lov yo‘q.',
        noJobs: 'Hozircha yangi buyurtmalar yo‘q',
        responses: 'Takliflar',
        today: 'Bugun',
      }
    : {
        eyebrow: 'Площадка услуг по всему Узбекистану',
        title: 'Найти хорошего мастера — просто',
        subtitle: 'Ищите специалиста или размещайте заказ. На UstaTop всё бесплатно.',
        find: 'Найти мастера',
        post: 'Разместить заказ',
        search: 'Какая услуга вам нужна?',
        categories: 'Популярные услуги',
        categoriesHint: 'Выберите, какая помощь вам нужна',
        all: 'Все мастера',
        fresh: 'Свежие заказы',
        view: 'Смотреть все',
        how: 'Как работает UstaTop?',
        steps: ['Выберите услугу', 'Разместите заказ', 'Свяжитесь с мастером'],
        stepText: ['Найдите нужную категорию', 'Бесплатно опишите свою задачу', 'Сравните предложения и выберите мастера'],
        freeTitle: 'Бесплатно для всех',
        freeText: 'Без оплаты за регистрацию, публикацию заказов и отклики. Без комиссии с вашей работы.',
        noJobs: 'Пока нет новых заказов',
        responses: 'Откликов',
        today: 'Сегодня',
      };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-9 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              {copy.eyebrow}
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">{copy.subtitle}</p>
            <div className="mt-7 grid grid-cols-1 gap-3 sm:flex">
              <Link to="/masters" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 py-3 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800">
                <Search className="h-5 w-5" /> {copy.find} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/create-job" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-6 py-3 font-bold text-orange-800 transition hover:bg-orange-100">
                <ClipboardList className="h-5 w-5" /> {copy.post}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {language === 'uz' ? 'To‘lovsiz foydalanish' : 'Без оплаты и комиссий'}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {language === 'uz' ? 'Barcha hududlar' : 'Все регионы Узбекистана'}</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-100 shadow-2xl shadow-blue-900/10">
              <img src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1100&q=85" alt={language === 'uz' ? 'Uyda ishlayotgan usta' : 'Мастер за работой'} className="h-64 w-full object-cover sm:h-80 lg:h-[420px]" />
            </div>
            <div className="absolute -bottom-5 left-3 right-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:left-8 sm:right-auto sm:min-w-72">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Wrench className="h-6 w-6" /></div>
                <div><p className="font-bold text-slate-900">{language === 'uz' ? 'Oson va qulay' : 'Просто и удобно'}</p><p className="text-sm text-slate-500">{language === 'uz' ? 'Usta va mijoz bir joyda' : 'Мастера и заказчики в одном месте'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">{language === 'uz' ? 'Yo‘nalishni tanlang' : 'Выберите направление'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.categories}</h2><p className="mt-2 text-sm text-slate-500 sm:text-base">{copy.categoriesHint}</p></div>
          <Link to="/masters" className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900">{copy.all}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((cat, index) => (
            <Link key={cat.id} to={`/jobs?category=${cat.id}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[1.18] overflow-hidden bg-slate-100">
                <img src={cat.icon} alt={language === 'uz' ? cat.nameUz : cat.nameRu} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-tight text-white">{language === 'uz' ? cat.nameUz : cat.nameRu}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-blue-700"><span>{language === 'uz' ? 'Buyurtmalar' : 'Заказы'}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">{language === 'uz' ? 'Yangi e’lonlar' : 'Новые заявки'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.fresh}</h2></div>
            <Link to="/jobs" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-700">{copy.view}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          {loading ? <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-500">{t('loading')}</div> : recentJobs.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {recentJobs.map(job => (
                <Link key={job.id} to={`/job/${job.id}`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-lg sm:p-5">
                  <div className="flex items-start justify-between gap-3"><h3 className="font-bold leading-snug text-slate-900 group-hover:text-blue-700">{language === 'uz' ? job.title_uz : job.title_ru}</h3><span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">{formatBudget(job.budget)}</span></div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{language === 'uz' ? job.description_uz : job.description_ru}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{getRegion(job.region) || (language === 'uz' ? 'O‘zbekiston' : 'Узбекистан')}</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{getDate(job.created_at)}</span><span>{copy.responses}: {job.responses || 0}</span></div>
                </Link>
              ))}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><p className="font-semibold text-slate-700">{copy.noJobs}</p><Link to="/create-job" className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white">{copy.post}</Link></div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 text-center"><p className="text-sm font-bold uppercase tracking-wider text-orange-600">{language === 'uz' ? 'Uchta oddiy qadam' : 'Всего три шага'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.how}</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.steps.map((step, index) => {
            const Icon = [Search, ClipboardList, CheckCircle2][index];
            return <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-7 w-7" /></div><div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-orange-600">{language === 'uz' ? `QADAM ${index + 1}` : `ШАГ ${index + 1}`}</div><h3 className="mt-2 font-bold text-slate-900">{step}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy.stepText[index]}</p></div>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><ShieldCheck className="h-4 w-4" /> {copy.freeTitle}</div><h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">{copy.freeTitle}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">{copy.freeText}</p></div>
            <Link to={isLoggedIn ? '/create-job' : '/register'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-orange-600">{isLoggedIn ? copy.post : t('register')}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
