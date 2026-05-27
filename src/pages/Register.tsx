import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Phone, ArrowLeft, Send, Briefcase, UserCheck } from 'lucide-react';

export default function Register() {
  const { t, setUser, setIsLoggedIn, language, isLoggedIn } = useApp();
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'master'>('customer');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const isValidUzbekPhone = (phoneNumber: string) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length < 2) {
      setError(t('nameRequired'));
      return;
    }

    if (!phone || phone.length < 9) {
      setError(t('phoneRequired'));
      return;
    }

    if (!isValidUzbekPhone(phone)) {
      setError(t('invalidPhone'));
      return;
    }

    setLoading(true);
    setError('');

    // Генерация кода
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);

    // Сохранение в localStorage
    localStorage.setItem('reg_name', name);
    localStorage.setItem('reg_phone', phone);
    localStorage.setItem('reg_role', role);
    localStorage.setItem('reg_code', randomCode);
    localStorage.setItem('reg_code_expires', (Date.now() + 5 * 60 * 1000).toString());

    // Тестовый вывод (потом заменим на реальную SMS)
    alert(`Ваш код подтверждения: ${randomCode}`);

    setStep('code');
    setLoading(false);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    const savedCode = localStorage.getItem('reg_code');
    const expires = localStorage.getItem('reg_code_expires');
    const savedName = localStorage.getItem('reg_name');
    const savedPhone = localStorage.getItem('reg_phone');
    const savedRole = localStorage.getItem('reg_role') as 'customer' | 'master';

    if (!savedCode) {
      setError(t('codeNotFound'));
      return;
    }

    if (Date.now() > parseInt(expires || '0')) {
      setError(t('codeExpired'));
      localStorage.removeItem('reg_code');
      localStorage.removeItem('reg_code_expires');
      return;
    }

    if (code === savedCode) {
      setUser({
        id: 'user_' + Date.now(),
        name: savedName || name,
        phone: savedPhone || phone,
        role: savedRole || role,
        avatar: '',
        region: 'tashkent-city',
        district: 'chilonzor',
        isVerified: false,
        isVIP: false,
        balance: 0,
        ...(savedRole === 'master' && {
          aboutUz: '',
          aboutRu: '',
          experience: 0,
          jobsCompleted: 0,
          rating: 0,
          reviews: 0,
          services: [],
        }),
      });
      setIsLoggedIn(true);

      // Очистка после успешной регистрации
      localStorage.removeItem('reg_name');
      localStorage.removeItem('reg_phone');
      localStorage.removeItem('reg_role');
      localStorage.removeItem('reg_code');
      localStorage.removeItem('reg_code_expires');

      navigate('/');
    } else {
      setError(t('wrongCode'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('register')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('onlyUzbekPhone')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('name')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('onlyUzbekPhone')}</p>
              </div>

              {/* Выбор роли */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uz' ? 'Kim siz?' : 'Кто вы?'} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'customer'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <UserCheck className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t('asCustomer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('master')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'master'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Briefcase className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t('asMaster')}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 9 || name.length < 2}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? t('loading') : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('sendCode')}
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('verifyCode')}
                </label>
                <input
                  type="text"
                  placeholder={t('codePlaceholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Код отправлен на номер {phone}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? t('loading') : t('continue')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setCode('');
                  setError('');
                }}
                className="w-full text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}