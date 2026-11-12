import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, Plus, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const location = useLocation();
  const { user, isLoggedIn, language } = useApp();
  const labels = language === 'uz'
    ? { home: 'Bosh sahifa', masters: 'Ustalar', create: 'Buyurtma', jobs: 'Buyurtmalar', profile: 'Profil' }
    : { home: 'Главная', masters: 'Мастера', create: 'Заказ', jobs: 'Заказы', profile: 'Профиль' };

  const isActive = (path: string) => path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path);

  const items = [
    { to: '/', label: labels.home, Icon: Home },
    { to: '/masters', label: labels.masters, Icon: Users },
    { to: '/jobs', label: labels.jobs, Icon: Briefcase },
    { to: '/profile', label: labels.profile, Icon: UserRound },
  ];

  return (
    <>
      <div className="h-20 sm:hidden" />
      <nav aria-label={language === 'uz' ? 'Pastki navigatsiya' : 'Нижняя навигация'} className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-8px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 pb-1 pt-2">
          {items.slice(0, 2).map(({ to, label, Icon }) => (
            <Link key={to} to={to} aria-current={isActive(to) ? 'page' : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${isActive(to) ? 'text-blue-700' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5" strokeWidth={isActive(to) ? 2.6 : 2} />
              <span>{label}</span>
            </Link>
          ))}
          <Link to="/create-job" className="flex min-w-0 flex-1 -translate-y-3 flex-col items-center gap-1 text-[10px] font-bold text-orange-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-white"><Plus className="h-6 w-6" strokeWidth={2.8} /></span>
            <span>{labels.create}</span>
          </Link>
          {items.slice(2).map(({ to, label, Icon }) => (
            <Link key={to} to={to} aria-current={isActive(to) ? 'page' : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${isActive(to) ? 'text-blue-700' : 'text-slate-500'}`}>
              {to === '/profile' && isLoggedIn && user?.avatar
                ? <img src={user.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                : <Icon className="h-5 w-5" strokeWidth={isActive(to) ? 2.6 : 2} />}
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
