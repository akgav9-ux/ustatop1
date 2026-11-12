import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Bell, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const { user, language } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLoadError(false);
      setLoading(false);
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки уведомлений:', error);
        setLoadError(true);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Не удалось отметить уведомление:', error);
      return;
    }
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, is_read: true } : item));
    window.dispatchEvent(new Event('refreshCounters'));
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    if (error) {
      console.error('Не удалось отметить уведомления:', error);
      return;
    }
    setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
    window.dispatchEvent(new Event('refreshCounters'));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'uz' ? 'Bildirishnomalar' : 'Уведомления'}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-sm hover:text-blue-700"
            >
              {language === 'uz' ? 'Hammasini o\'qilgan deb belgilash' : 'Отметить все прочитанными'}
            </button>
          )}
        </div>

        {!user ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <Bell className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-700">{language === 'uz' ? 'Bildirishnomalarni ko‘rish uchun tizimga kiring.' : 'Войдите, чтобы просматривать уведомления.'}</p>
            <Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">{language === 'uz' ? 'Kirish' : 'Войти'}</Link>
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{language === 'uz' ? 'Bildirishnomalarni yuklab bo‘lmadi. Qayta urinib ko‘ring.' : 'Не удалось загрузить уведомления. Попробуйте ещё раз.'}</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {language === 'uz' ? 'Bildirishnomalar yo\'q' : 'Нет уведомлений'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const Content = (
                <div
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition-all cursor-pointer ${
                    !notif.is_read ? 'border-blue-300 shadow-sm' : 'border-gray-100'
                  }`}
                  onClick={() => {
                    markAsRead(notif.id);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${!notif.is_read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              );

              if (notif.link) {
                return (
                  <Link key={notif.id} to={notif.link}>
                    {Content}
                  </Link>
                );
              }
              return <div key={notif.id}>{Content}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}