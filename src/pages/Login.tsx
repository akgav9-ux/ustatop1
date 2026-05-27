import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { t, setUser, setIsLoggedIn } = useApp();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [generatedCode, setGeneratedCode] = useState('');
  const navigate = useNavigate();

  const sendCode = () => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    
    if (!phoneRegex.test(phone)) {
      alert(t('invalidPhone'));
      return;
    }
    
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(randomCode);
    alert(`${t('yourCode')}: ${randomCode}`);
    setStep('code');
  };

  const verifyCode = () => {
    if (code === generatedCode) {
      setUser({
        id: Date.now().toString(),
        name: `User_${phone.slice(-4)}`,
        phone: phone,
        role: 'customer',
        avatar: '',
        region: 'tashkent-city',
        district: 'chilonzor',
        isVerified: false,
        isVIP: false,
        balance: 0,
      });
      setIsLoggedIn(true);
      navigate('/');
    } else {
      alert(t('wrongCode'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <h1 className="text-2xl font-bold">{t('login')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('onlyUzbekPhone')}</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="+998 99 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-center text-lg"
            />
            <button
              onClick={sendCode}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {t('sendCode')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="0000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-center text-lg text-2xl tracking-widest"
              maxLength={4}
            />
            <button
              onClick={verifyCode}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {t('continue')}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
            >
              ← {t('back')}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {t('haveAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('register')}
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          {t('testModeHint') || 'Код приходит в всплывающем окне (тестовый режим)'}
        </div>
      </div>
    </div>
  );
}