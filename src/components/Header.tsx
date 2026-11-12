import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, MessageCircle, Globe, MapPin, ChevronDown, Search, Plus, Users, Briefcase, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { regions } from '../data';
import { supabase } from '../lib/supabaseClient';

export default function Header() {
  const { t, language, setLanguage, isLoggedIn, user, selectedRegion, setSelectedRegion, selectedDistrict, setSelectedDistrict } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  const currentRegion = regions.find(r => r.id === selectedRegion);
  const currentDistrict = currentRegion?.districts.find(d => d.id === selectedDistrict);

  const loadCounts = async () => {
    if (!isLoggedIn || !user?.id) return;

    try {
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadNotifications(notifCount || 0);

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      setUnreadMessages(msgCount || 0);
    } catch (err) {
      console.error('Ошибка загрузки счётчиков:', err);
    }
  };

  useEffect(() => {
    loadCounts();

    const handleRefresh = () => loadCounts();
    window.addEventListener('refreshCounters', handleRefresh);
    window.addEventListener('messageRead', handleRefresh);
    window.addEventListener('messageSent', handleRefresh);

    const channel = supabase
      .channel('header-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`,
      }, () => loadCounts())
      .subscribe();

    return () => {
      window.removeEventListener('refreshCounters', handleRefresh);
      window.removeEventListener('messageRead', handleRefresh);
      window.removeEventListener('messageSent', handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/masters?search=${searchQuery}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="bg-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setRegionOpen(!regionOpen)} className="flex items-center gap-1 hover:text-blue-200">
              <MapPin className="w-4 h-4" />
              <span>{language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {currentDistrict && <span className="text-blue-200">{language === 'uz' ? currentDistrict.nameUz : currentDistrict.nameRu}</span>}
          </div>
          <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 hover:text-blue-200">
            <Globe className="w-4 h-4" />
            <span>{language === 'uz' ? "O'zbek" : 'Русский'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        {regionOpen && (
          <div className="absolute top-10 left-0 bg-white text-gray-800 shadow-xl rounded-b-lg z-50 max-h-64 overflow-y-auto border">
            {regions.map(region => (
              <button key={region.id} onClick={() => {
                setSelectedRegion(region.id);
                setSelectedDistrict(region.districts[0].id);
                setRegionOpen(false);
              }} className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${selectedRegion === region.id ? 'bg-blue-50 text-blue-600' : ''}`}>
                {language === 'uz' ? region.nameUz : region.nameRu}
              </button>
            ))}
          </div>
        )}
        {langOpen && (
          <div className="absolute top-10 right-4 bg-white text-gray-800 shadow-xl rounded-b-lg z-50 border">
            <button onClick={() => { setLanguage('uz'); setLangOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-50">O'zbek</button>
            <button onClick={() => { setLanguage('ru'); setLangOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-50">Русский</button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="UstaTop" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-2xl font-extrabold tracking-tight text-blue-800 hidden sm:block">UstaTop</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"><Home className="w-5 h-5" /><span>{t('home')}</span></Link>
            <Link to="/jobs" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"><Briefcase className="w-5 h-5" /><span>{t('jobs')}</span></Link>
            <Link to="/masters" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"><Users className="w-5 h-5" /><span>{t('masters')}</span></Link>
          </nav>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={t('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link to="/create-job" className="hidden sm:flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-800"><Plus className="w-5 h-5" /><span>{t('createJob')}</span></Link>

            {isLoggedIn && (
              <>
                <Link to="/messages" className="relative p-2 hover:bg-gray-100 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-xl">
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>
              </>
            )}

            {!isLoggedIn && <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">{t('login')}</Link>}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>{t('home')}</Link>
            <Link to="/jobs" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>{t('jobs')}</Link>
            <Link to="/masters" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>{t('masters')}</Link>
            <Link to="/favorites" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>{t('favorites')}</Link>
            <Link to="/create-job" className="block py-2 px-3 bg-blue-600 text-white rounded-lg text-center mt-3" onClick={() => setMenuOpen(false)}>{t('createJob')}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}