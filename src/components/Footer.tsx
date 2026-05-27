import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t, language } = useApp();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-2xl font-bold text-white">UstaTop</span>
            </div>
            <p className="text-gray-400 mb-4">
              {language === 'uz'
                ? "Istalgan ish uchun ishonchli usta toping. Minglab mutaxassislar yoningizda."
                : 'Найдите проверенного мастера для любой работы. Тысячи специалистов рядом с вами.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm font-bold">
                f
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors text-sm font-bold">
                Ig
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors text-sm font-bold">
                Tg
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('about')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link></li>
              <li><Link to="/masters" className="hover:text-white transition-colors">{t('masters')}</Link></li>
              <li><Link to="/jobs" className="hover:text-white transition-colors">{t('jobs')}</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">{t('reviews')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+998 71 200-00-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>info@ustatop.uz</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{language === 'uz' ? 'Asaka, O\'zbekiston' : 'Асака, Узбекистан'}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{language === 'uz' ? 'Huquqiy' : 'Правовая информация'}</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-white transition-colors">{t('terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2026 UstaTop. {t('allRights')}.</p>
        </div>
      </div>
    </footer>
  );
}
