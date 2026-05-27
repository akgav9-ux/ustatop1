import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, MessageCircle, Globe, MapPin, ChevronDown, Search, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { regions } from '../data';

export default function Header() {
  const { t, language, setLanguage, isLoggedIn, selectedRegion, setSelectedRegion, selectedDistrict, setSelectedDistrict } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const currentRegion = regions.find(r => r.id === selectedRegion);
  const currentDistrict = currentRegion?.districts.find(d => d.id === selectedDistrict);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/masters?search=${searchQuery}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {currentDistrict && (
              <span className="text-blue-200">
                {language === 'uz' ? currentDistrict.nameUz : currentDistrict.nameRu}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'uz' ? "O'zbek" : 'Русский'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        {regionOpen && (
          <div className="absolute top-10 left-0 bg-white text-gray-800 shadow-xl rounded-b-lg z-50 max-h-64 overflow-y-auto border border-gray-200">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedRegion(region.id);
                  setSelectedDistrict(region.districts[0].id);
                  setRegionOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${selectedRegion === region.id ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {language === 'uz' ? region.nameUz : region.nameRu}
              </button>
            ))}
          </div>
        )}
        {langOpen && (
          <div className="absolute top-10 right-4 bg-white text-gray-800 shadow-xl rounded-b-lg z-50 border border-gray-200">
            <button
              onClick={() => { setLanguage('uz'); setLangOpen(false); }}
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${language === 'uz' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              O'zbek
            </button>
            <button
              onClick={() => { setLanguage('ru'); setLangOpen(false); }}
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${language === 'ru' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              Русский
            </button>
          </div>
        )}
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-0.9">
        <div className="flex items-center justify-between gap-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {/* Логотип вместо буквы U */}
            <img 
              src="/logo.png" 
              alt="UstaTop" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent hidden sm:block">
              UstaTop
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-0.7 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Actions - с уведомлениями и сообщениями, без профиля */}
          <div className="flex items-center gap-3">
            <Link
              to="/create-job"
              className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>{t('createJob')}</span>
            </Link>

            {isLoggedIn && (
              <>
                <Link to="/messages" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </Link>
                <Link to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('home')}
            </Link>
            <Link to="/jobs" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('jobs')}
            </Link>
            <Link to="/masters" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('masters')}
            </Link>
            <Link to="/favorites" className="block py-2 px-3 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('favorites')}
            </Link>
            <Link to="/create-job" className="block py-2 px-3 bg-blue-600 text-white rounded-lg text-center mt-3" onClick={() => setMenuOpen(false)}>
              {t('createJob')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}