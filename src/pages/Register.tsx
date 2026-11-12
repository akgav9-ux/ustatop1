import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Eye, EyeOff, Phone, User, Lock } from 'lucide-react';

export default function Register() {
  const { t, language, setUser, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(language === 'uz' ? 'Ismni kiriting' : 'Введите имя');
      return;
    }

    if (!validatePhone(phone)) {
      setError(language === 'uz' ? 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' : 'Телефон должен быть в формате +998XXXXXXXXX');
      return;
    }

    if (password.length < 4) {
      setError(language === 'uz' ? 'Parol kamida 4 belgi bo\'lishi kerak' : 'Пароль должен быть не менее 4 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'uz' ? 'Parollar mos kelmadi' : 'Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      // Проверяем, существует ли пользователь с таким телефоном
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();

      if (existingUser) {
        setError(language === 'uz' ? 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' : 'Этот номер телефона уже зарегистрирован');
        setLoading(false);
        return;
      }

      // Генерируем случайный ID
      const userId = Date.now().toString();

      // Создаём пользователя в Supabase (с возвратом данных)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: name,
          phone: phone,
          password: password,
          role: role,
          created_at: new Date().toISOString()
        }])
        .select('id, name, phone, role')
        .single();

      if (insertError) {
        console.error('Ошибка регистрации:', insertError);
        if (insertError.code === '23505') {
          setError(language === 'uz' ? 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' : 'Этот номер телефона уже зарегистрирован');
        } else {
          setError(language === 'uz' ? 'Ro\'yxatdan o\'tishda xatolik' : 'Ошибка регистрации');
        }
      } else {
        // Сохраняем в localStorage сессию
        const session = {
          id: newUser.id,
          userId: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          role: newUser.role
        };
        localStorage.setItem('user_session', JSON.stringify(session));
        
        // Обновляем AppContext
        setUser({
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          role: newUser.role
        });
        setIsLoggedIn(true);
        
        navigate('/');
      }
    } catch (err) {
      console.error('Ошибка:', err);
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
            {language === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}
          </h1>
          <p className="text-gray-500 mt-2">
            {language === 'uz' ? 'Yangi akkaunt yaratish' : 'Создайте новый аккаунт'}
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
              {language === 'uz' ? 'Ismingiz' : 'Ваше имя'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder={language === 'uz' ? 'Ismingizni kiriting' : 'Введите ваше имя'}
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Parolni tasdiqlang' : 'Подтвердите пароль'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={language === 'uz' ? 'Parolni qayta kiriting' : 'Повторите пароль'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Siz kimsiz?' : 'Кто вы?'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-3 rounded-xl font-semibold transition-colors ${
                  role === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'uz' ? 'Buyurtmachi' : 'Заказчик'}
              </button>
              <button
                type="button"
                onClick={() => setRole('master')}
                className={`py-3 rounded-xl font-semibold transition-colors ${
                  role === 'master'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'uz' ? 'Usta' : 'Мастер'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (language === 'uz' ? 'Ro\'yxatdan o\'tish...' : 'Регистрация...') : (language === 'uz' ? "Ro'yxatdan o'tish" : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {language === 'uz' ? 'Akkauntingiz bormi?' : 'Уже есть аккаунт?'}
            {' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {language === 'uz' ? 'Kiring' : 'Войдите'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}