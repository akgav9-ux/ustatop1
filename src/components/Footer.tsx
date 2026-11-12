import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t, language } = useApp();

  return (
    <footer className="mt-12 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-xl font-extrabold text-white">U</span>
              <span className="text-2xl font-extrabold tracking-tight text-white">UstaTop</span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              {language === 'uz'
                ? 'Ustalar va buyurtmachilarni bir joyda bog‘laydigan bepul platforma.'
                : 'Бесплатная площадка, которая помогает заказчикам находить мастеров, а специалистам — новые заказы.'}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-blue-200">
              {language === 'uz' ? 'Barcha uchun bepul' : 'Бесплатно для всех'}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">{language === 'uz' ? 'Bo‘limlar' : 'Разделы'}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="transition hover:text-white">{t('home')}</Link></li>
              <li><Link to="/masters" className="transition hover:text-white">{t('masters')}</Link></li>
              <li><Link to="/jobs" className="transition hover:text-white">{t('jobs')}</Link></li>
              <li><Link to="/create-job" className="transition hover:text-white">{t('createJob')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">{language === 'uz' ? 'Qanday ishlaydi?' : 'Как это работает?'}</h3>
            <p className="text-sm leading-6 text-slate-400">
              {language === 'uz'
                ? 'Buyurtmani joylashtiring yoki kerakli ustani qidiring. Narx va ish shartlarini bevosita kelishib oling.'
                : 'Разместите заявку или найдите подходящего мастера. Обсудите стоимость и условия напрямую — без комиссии платформы.'}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 UstaTop. {t('allRights')}.
        </div>
      </div>
    </footer>
  );
}
