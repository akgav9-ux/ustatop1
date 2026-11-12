import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t, language, setUser, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError(language === 'uz' ? 'Telefon va parolni kiriting' : 'Введите телефон и пароль');
      return;
    }

    setLoading(true);

    try {
      // Ищем пользователя по телефону
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (findError || !user) {
        setError(language === 'uz' ? 'Telefon raqam topilmadi' : 'Номер телефона не найден');
        setLoading(false);
        return;
      }

      // Проверяем пароль
      if (user.password !== password) {
        setError(language === 'uz' ? 'Parol noto\'g\'ri' : 'Неверный пароль');
        setLoading(false);
        return;
      }

      // Сохраняем сессию
      const session = {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      };
      localStorage.setItem('user_session', JSON.stringify(session));
      
      // Обновляем AppContext
      setUser(session);
      setIsLoggedIn(true);
      
      navigate('/');
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(language === 'uz' ? 'Ulanish xatoligi' : 'Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'uz' ? 'Kirish' : 'Вход'}
          </h1>
          <p className="text-gray-500 mt-2">
            {language === 'uz' ? 'Akkauntingizga kiring' : 'Войдите в свой аккаунт'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Telefon raqam' : 'Номер телефона'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="+998 __ ___ __ __"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Parol' : 'Пароль'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder={language === 'uz' ? 'Parolni kiriting' : 'Введите пароль'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (language === 'uz' ? 'Kirish...' : 'Вход...') : (language === 'uz' ? 'Kirish' : 'Войти')}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {language === 'uz' ? 'Akkauntingiz yo\'qmi?' : 'Нет аккаунта?'}
            {' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              {language === 'uz' ? "Ro'yxatdan o'tish" : 'Зарегистрироваться'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}