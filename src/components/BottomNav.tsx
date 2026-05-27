import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const location = useLocation();
  const { user, isLoggedIn } = useApp();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <div className="h-16 sm:hidden"></div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg sm:hidden z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {/* Главная */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-medium">Главная</span>
          </Link>

          {/* Мастера */}
          <Link
            to="/masters"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive('/masters') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px] font-medium">Мастера</span>
          </Link>

          {/* Создать заказ */}
          <Link
            to="/create-job"
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
              <PlusCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-medium text-blue-600 mt-1">Создать</span>
          </Link>

          {/* Заказы */}
          <Link
            to="/jobs"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive('/jobs') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[11px] font-medium">Заказы</span>
          </Link>

          {/* Профиль - с фото или иконкой */}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isLoggedIn && user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-[11px] font-medium">Профиль</span>
          </Link>
        </div>
      </div>
    </>
  );
}