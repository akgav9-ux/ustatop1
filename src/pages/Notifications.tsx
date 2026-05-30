import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Bell, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const { t, user, language } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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

        {notifications.length === 0 ? (
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
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                    !notif.is_read ? 'border-blue-300 shadow-sm' : 'border-gray-100'
                  }`}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
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
                  <Link key={notif.id} to={notif.link} onClick={() => markAsRead(notif.id)}>
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