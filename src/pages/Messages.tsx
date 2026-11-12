import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const { user, language } = useApp();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка:', error);
      } else {
        const uniqueChats = new Map();
        data?.forEach(msg => {
          if (!msg.chat_id) return;
          const chatKey = msg.chat_id;
          if (!uniqueChats.has(chatKey)) {
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            const otherName = msg.sender_id === user.id ? msg.receiver_name : msg.sender_name;
            uniqueChats.set(chatKey, {
              chat_id: chatKey,
              other_id: otherId,
              other_name: otherName || 'Пользователь',
              last_message: msg.text,
              last_message_time: msg.created_at,
              is_read: msg.receiver_id === user.id ? msg.is_read : true,
              unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
            });
          } else {
            const existing = uniqueChats.get(chatKey);
            if (msg.receiver_id === user.id && !msg.is_read) {
              existing.unread_count += 1;
              existing.is_read = false;
            }
          }
        });
        setChats(Array.from(uniqueChats.values()));
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setChats([]);
      return;
    }
    loadChats();

    const handleUpdate = () => loadChats();
    window.addEventListener('messageRead', handleUpdate);
    window.addEventListener('refreshCounters', handleUpdate);
    window.addEventListener('messageSent', handleUpdate);

    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`,
      }, () => loadChats())
      .subscribe();

    return () => {
      window.removeEventListener('messageRead', handleUpdate);
      window.removeEventListener('refreshCounters', handleUpdate);
      window.removeEventListener('messageSent', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'uz' ? 'Xabarlar' : 'Сообщения'}
          </h1>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-700">{language === 'uz' ? 'Xabarlarni ko‘rish uchun tizimga kiring.' : 'Войдите, чтобы просматривать сообщения.'}</p>
            <Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">{language === 'uz' ? 'Kirish' : 'Войти'}</Link>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'uz' ? 'Hozircha xabarlar yo\'q' : 'Пока нет сообщений'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map(chat => (
              <Link
                key={chat.chat_id}
                to={`/chat/${chat.other_id}`}
                className={`block rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  !chat.is_read ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {chat.other_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900 truncate">{chat.other_name}</p>
                      <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {new Date(chat.last_message_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate flex-1">{chat.last_message}</p>
                      {chat.unread_count > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                          {chat.unread_count > 99 ? '99+' : chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}