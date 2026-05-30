import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Send } from 'lucide-react';

export default function Chat() {
  const { user, language, isLoggedIn } = useApp();
  const { userId } = useParams<{ userId: string }>();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = user?.id && userId ? [user.id, userId].sort().join('-') : null;

  useEffect(() => {
    if (!userId) return;
    supabase.from('users').select('name, id').eq('id', userId).single()
      .then(({ data }) => data && setReceiver(data));
  }, [userId]);

  const loadMessages = async () => {
    if (!chatId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
  };

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Помечаем сообщения как прочитанные
  useEffect(() => {
    if (!chatId || !user?.id) return;

    const markAsRead = async () => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (!error) {
        window.dispatchEvent(new Event('messageRead'));
        window.dispatchEvent(new Event('refreshCounters'));
      }
    };

    markAsRead();
  }, [chatId, user?.id]);

  // Realtime подписка
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel('chat_realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          if (payload.new.receiver_id === user?.id) {
            window.dispatchEvent(new Event('messageRead'));
            window.dispatchEvent(new Event('refreshCounters'));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, user?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !userId || !chatId) return;

    const message = {
      chat_id: chatId,
      sender_id: user.id,
      sender_name: user.name || 'Пользователь',
      receiver_id: userId,
      text: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setNewMessage('');
    const { error } = await supabase.from('messages').insert([message]);
    if (!error) {
      window.dispatchEvent(new Event('messageSent'));
      window.dispatchEvent(new Event('refreshCounters'));
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{language === 'uz' ? 'Tizimga kiring' : 'Войдите в аккаунт'}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/messages" className="p-1 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 text-lg">{receiver?.name || 'Пользователь'}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">
              {language === 'uz' ? 'Hozircha xabarlar yo‘q' : 'Пока нет сообщений'}<br/>
              {language === 'uz' ? 'Birinchi xabarni yozing' : 'Напишите первое сообщение'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                msg.sender_id === user.id 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
              }`}>
                <p className="text-sm break-words">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-3 safe-bottom">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language === 'uz' ? 'Xabar yozing...' : 'Напишите сообщение...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}