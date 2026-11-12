import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { regions, categories } from '../data';
import { 
  ArrowLeft, MapPin, Clock, DollarSign, 
  Briefcase, Ruler, Calendar, User, Phone,
  Trash2, MessageCircle, CheckCircle, Crown, X
} from 'lucide-react';

export default function Job() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, user, isLoggedIn } = useApp();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [myResponse, setMyResponse] = useState<any>(null);
  const [responseError, setResponseError] = useState('');
  const [updatingResponse, setUpdatingResponse] = useState(false);
  
  // Состояния для модального окна отклика
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedDeadline, setProposedDeadline] = useState('');
  const [proposedComment, setProposedComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) {
        console.error('Ошибка загрузки заказа:', jobError);
        alert('Заказ не найден');
        navigate('/jobs');
        return;
      }

      setJob(jobData);
      setProposedPrice(jobData.budget?.toString() || '');

      if (jobData.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('users')
          .select('*')
          .eq('id', jobData.author_id)
          .single();

        if (!authorError && authorData) {
          setAuthor(authorData);
        }
      }

      if (user?.id && user.id !== jobData.author_id && user.role === 'master') {
        const { data: ownResponse } = await supabase.from('responses').select('id, status').eq('order_id', id).eq('master_id', user.id).maybeSingle();
        setMyResponse(ownResponse || null);
      } else {
        setMyResponse(null);
      }

      // Загружаем отклики, если текущий пользователь - автор
      if (user?.id === jobData.author_id) {
        const { data: responsesData } = await supabase
          .from('responses')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: false });
        setResponses(responsesData || []);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === 'uz' ? 'Bu buyurtmani o\'chirmoqchimisiz?' : 'Удалить этот заказ?')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('author_id', user?.id);

      if (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении заказа');
      } else {
        alert(language === 'uz' ? 'Buyurtma o\'chirildi' : 'Заказ удалён');
        navigate('/jobs');
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleRespond = async () => {
    if (!proposedPrice || parseInt(proposedPrice) <= 0) {
      alert(language === 'uz' ? 'Iltimos, narxni kiriting' : 'Пожалуйста, укажите цену');
      return;
    }

    setResponseError('');
    if (!user?.id || user.id === job?.author_id || user.role !== 'master') return;
    if (myResponse) {
      setResponseError(language === 'uz' ? 'Siz bu buyurtmaga allaqachon javob yuborgansiz.' : 'Вы уже откликались на эту заявку.');
      setShowResponseModal(false);
      return;
    }
    setSending(true);
    try {
      // 1. Сохраняем отклик
      const { error: responseError } = await supabase
        .from('responses')
        .insert([{
          order_id: id,
          master_id: user?.id,
          master_name: user?.name,
          master_avatar: user?.avatar,
          proposed_price: parseInt(proposedPrice),
          proposed_deadline: proposedDeadline || null,
          comment: proposedComment || null,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (responseError) {
        console.error('Ошибка отправки отклика:', responseError);
        setResponseError(language === 'uz' ? 'Javob yuborilmadi. Qayta urinib ko‘ring.' : 'Не удалось отправить отклик. Попробуйте ещё раз.');
        setSending(false);
        return;
      }

      // 2. Увеличиваем счётчик откликов
      const { error: updateError } = await supabase
        .from('orders')
        .update({ responses: (job.responses || 0) + 1 })
        .eq('id', id);

      if (updateError) {
        console.error('Ошибка обновления счетчика:', updateError);
      }

      // 3. Создаём уведомление для автора заказа
      await supabase.from('notifications').insert([{
        user_id: job.author_id,
        title: language === 'uz' ? 'Yangi javob' : 'Новый отклик',
        message: language === 'uz' 
          ? `${user?.name} sizning buyurtmangizga javob berdi`
          : `${user?.name} откликнулся на ваш заказ`,
        link: `/job/${id}`,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

      setResponseError('');
      setMyResponse({ status: 'pending' });
      alert(language === 'uz' ? 'Javobingiz yuborildi!' : 'Ваш отклик отправлен!');
      setShowResponseModal(false);
      setProposedPrice('');
      setProposedDeadline('');
      setProposedComment('');
      
      loadJob();
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Произошла ошибка');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptResponse = async (responseId: string, masterId: string) => {
    if (!isAuthor || !user?.id || !confirm(language === 'uz' ? 'Ushbu ustani tanlaysizmi?' : 'Принять этого мастера?')) return;
    setUpdatingResponse(true);
    const { error } = await supabase.from('responses').update({ status: 'accepted' }).eq('id', responseId).eq('order_id', id);
    if (error) {
      alert(language === 'uz' ? 'Javobni qabul qilib bo‘lmadi.' : 'Не удалось принять отклик.');
      setUpdatingResponse(false);
      return;
    }
    const { error: rejectError } = await supabase.from('responses').update({ status: 'rejected' }).eq('order_id', id).neq('id', responseId).eq('status', 'pending');
    if (rejectError) console.error('Не удалось отклонить остальные отклики:', rejectError);
    await supabase.from('notifications').insert([{
      user_id: masterId,
      title: language === 'uz' ? 'Buyurtma sizga berildi' : 'Ваш отклик принят',
      message: language === 'uz' ? 'Buyurtmachi sizning taklifingizni qabul qildi.' : 'Заказчик принял ваше предложение.',
      link: '/job/' + id,
      is_read: false,
      created_at: new Date().toISOString(),
    }]);
    setUpdatingResponse(false);
    loadJob();
  };

  const handleRejectResponse = async (responseId: string) => {
    if (!isAuthor || !user?.id) return;
    setUpdatingResponse(true);
    const { error } = await supabase.from('responses').update({ status: 'rejected' }).eq('id', responseId).eq('order_id', id);
    if (error) alert(language === 'uz' ? 'Javobni rad etib bo‘lmadi.' : 'Не удалось отклонить отклик.');
    setUpdatingResponse(false);
    loadJob();
  };

  const formatBudget = (budget: number) => {
    return budget.toLocaleString('ru-RU') + ' ' + t('sum');
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return t('today') + ', ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (hours < 48) return t('yesterday') + ', ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ru-RU');
  };

  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return language === 'uz' ? region?.nameUz : region?.nameRu;
  };

  const getDistrictName = (regionId: string, districtId: string) => {
    const region = regions.find(r => r.id === regionId);
    const district = region?.districts.find(d => d.id === districtId);
    return language === 'uz' ? district?.nameUz : district?.nameRu;
  };

  const getCategoryName = (categoryName: string) => {
    const category = categories.find(c => c.nameUz === categoryName || c.nameRu === categoryName);
    if (!category) return categoryName;
    return language === 'uz' ? category.nameUz : category.nameRu;
  };

  const isAuthor = user?.id === job?.author_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Заказ не найден</p>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700">
            Вернуться к списку заказов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('back')}
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Заголовок */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'uz' ? job.title_uz : job.title_ru}
              </h1>
              {isAuthor && (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {getRegionName(job.region)}
                {job.district && ` (${getDistrictName(job.region, job.district)})`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getTimeAgo(job.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {getCategoryName(job.category)}
              </span>
            </div>
          </div>

          {/* Описание */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'uz' ? 'Ish tavsifi' : 'Описание работы'}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {language === 'uz' ? job.description_uz : job.description_ru}
            </p>
          </div>

          {/* Детали */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'uz' ? 'Buyurtma tafsilotlari' : 'Детали заказа'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">{t('budget')}</p>
                  <p className="font-semibold text-gray-900">{formatBudget(job.budget)}</p>
                </div>
              </div>
              {job.area && (
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('areaLabel')}</p>
                    <p className="font-semibold text-gray-900">{job.area} м²</p>
                  </div>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('deadline')}</p>
                    <p className="font-semibold text-gray-900">{job.deadline}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">{t('responses')}</p>
                  <p className="font-semibold text-gray-900">{job.responses || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Информация об авторе */}
          {author && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'uz' ? 'Buyurtmachi haqida' : 'О заказчике'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    author.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{author.name}</p>
                    {author.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    {author.is_vip && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                  {author.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {author.phone}
                    </p>
                  )}
                </div>
                {!isAuthor && isLoggedIn && (
                  <Link
                    to={`/chat/${author.id}`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('write')}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Список откликов (только для автора) */}
          {isAuthor && responses.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Отклики мастеров ({responses.length})
              </h3>
              <div className="space-y-3">
                {responses.map(res => (
                  <div key={res.id} className={`bg-gray-50 rounded-xl p-4 ${res.status === 'accepted' ? 'border-2 border-green-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{res.master_name}</p>
                        <p className="text-green-600 font-bold">{res.proposed_price?.toLocaleString()} сум</p>
                        {res.proposed_deadline && <p className="text-sm text-gray-500">Срок: {res.proposed_deadline}</p>}
                        {res.comment && <p className="text-gray-600 mt-1">{res.comment}</p>}
                        {res.status === 'accepted' && (
                          <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Принят</span>
                        )}
                        {res.status === 'rejected' && (
                          <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Отклонён</span>
                        )}
                      </div>
                      {res.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptResponse(res.id, res.master_id)}
                            disabled={updatingResponse}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            Принять
                          </button>
                          <button
                            onClick={() => handleRejectResponse(res.id)}
                            disabled={updatingResponse}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка отклика */}
          {!isAuthor && isLoggedIn && user?.role === 'master' && !myResponse && (
            <div className="p-6 bg-gray-50">
              {responseError && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{responseError}</p>}
              <button
                onClick={() => setShowResponseModal(true)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {t('respondToJob')}
              </button>
            </div>
          )}

          {!isAuthor && isLoggedIn && user?.role === 'master' && myResponse && <div className="p-6 bg-blue-50 text-center text-sm font-medium text-blue-800">{language === 'uz' ? 'Siz bu buyurtmaga javob yuborgansiz.' : 'Вы уже отправили отклик на эту заявку.'}</div>}

          {!isLoggedIn && (
            <div className="p-6 bg-gray-50 text-center">
              <p className="text-gray-600 mb-3">
                {language === 'uz' ? 'Buyurtmaga javob berish uchun tizimga kiring' : 'Войдите, чтобы откликнуться на заказ'}
              </p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                {t('login')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для отклика */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'uz' ? 'Taklifingizni yuboring' : 'Отправить предложение'}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm text-gray-500">
                  {language === 'uz' ? 'Buyurtma byudjeti' : 'Бюджет заказа'}
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatBudget(job.budget)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Taklif qilayotgan narxingiz' : 'Ваша цена'} *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Bajarish muddati' : 'Срок выполнения'}
                </label>
                <input
                  type="text"
                  value={proposedDeadline}
                  onChange={(e) => setProposedDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={language === 'uz' ? 'Masalan: 1-2 kun' : 'Например: 1-2 дня'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Izoh' : 'Комментарий'}
                </label>
                <textarea
                  value={proposedComment}
                  onChange={(e) => setProposedComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={language === 'uz' ? 'Taklifingiz haqida qisqacha...' : 'Коротко о вашем предложении...'}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRespond}
                disabled={sending || !proposedPrice || Number(proposedPrice) <= 0}
                className="flex-1 bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {sending ? (language === 'uz' ? 'Yuborilmoqda...' : 'Отправка...') : (language === 'uz' ? 'Yuborish' : 'Отправить')}
              </button>
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}