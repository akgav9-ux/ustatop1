import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Clock, ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

type ResponseRecord = {
  id: string;
  order_id: string;
  proposed_price?: number | null;
  proposed_deadline?: string | null;
  comment?: string | null;
  status?: string | null;
  created_at: string;
  order?: {
    title_uz?: string;
    title_ru?: string;
    region?: string;
  };
};

export default function ProfileResponses() {
  const { t, language, user } = useApp();
  const [myResponses, setMyResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadResponses = async () => {
      if (!user?.id) {
        setMyResponses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, order_id, proposed_price, proposed_deadline, comment, status, created_at')
        .eq('master_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (responseError) {
        console.error('Ошибка загрузки откликов:', responseError);
        setLoadError(true);
        setMyResponses([]);
        setLoading(false);
        return;
      }

      const orderIds = [...new Set((responseData || []).map(item => item.order_id).filter(Boolean))];
      let ordersById = new Map<string, any>();

      if (orderIds.length) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, title_uz, title_ru, region')
          .in('id', orderIds);

        if (orderError) {
          console.error('Ошибка загрузки заказов для откликов:', orderError);
        } else {
          ordersById = new Map((orderData || []).map(order => [order.id, order]));
        }
      }

      if (active) {
        setMyResponses((responseData || []).map(response => ({
          ...response,
          order: ordersById.get(response.order_id),
        })));
        setLoading(false);
      }
    };

    loadResponses();
    return () => { active = false; };
  }, [user?.id]);

  const formatPrice = (price?: number | null) =>
    price ? `${Number(price).toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU')} ${t('sum')}` : '—';

  const getStatus = (status?: string | null) => {
    if (status === 'accepted') return language === 'uz' ? 'Qabul qilingan' : 'Принят';
    if (status === 'rejected') return language === 'uz' ? 'Rad etilgan' : 'Отклонён';
    return language === 'uz' ? 'Kutilmoqda' : 'Ожидает ответа';
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link to="/profile" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700">
          <ArrowLeft className="h-5 w-5" />
          {language === 'uz' ? 'Orqaga' : 'Назад'}
        </Link>

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{language === 'uz' ? 'Siz yuborgan takliflar' : 'Ваши предложения'}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {language === 'uz' ? 'Mening javoblarim' : 'Мои отклики'}
          </h1>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            {language === 'uz' ? 'Javoblarni yuklab bo‘lmadi. Keyinroq qayta urinib ko‘ring.' : 'Не удалось загрузить отклики. Попробуйте позже.'}
          </div>
        ) : myResponses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><MessageSquare className="h-7 w-7" /></div>
            <p className="text-lg font-semibold text-slate-900">{language === 'uz' ? 'Hozircha javoblaringiz yo‘q' : 'Пока нет откликов'}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {language === 'uz' ? 'Buyurtmalarni ko‘rib chiqing va mos kelganlariga taklif yuboring.' : 'Посмотрите открытые заявки и отправьте предложение по подходящим заказам.'}
            </p>
            <Link to="/jobs" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800">
              {language === 'uz' ? 'Buyurtmalarni ko‘rish' : 'Смотреть заявки'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myResponses.map(response => (
              <article key={response.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                      {(language === 'uz' ? response.order?.title_uz : response.order?.title_ru) || (language === 'uz' ? 'Buyurtma mavjud emas' : 'Заявка недоступна')}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(response.created_at).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU')}</span>
                      {response.order?.region && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{response.order.region}</span>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${response.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : response.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {response.status === 'accepted' ? <CheckCircle className="h-3.5 w-3.5" /> : response.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {getStatus(response.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">{language === 'uz' ? 'Taklif qilingan narx' : 'Ваша цена'}</p>
                    <p className="mt-1 font-bold text-slate-900">{formatPrice(response.proposed_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{language === 'uz' ? 'Bajarish muddati' : 'Срок выполнения'}</p>
                    <p className="mt-1 font-semibold text-slate-900">{response.proposed_deadline || '—'}</p>
                  </div>
                </div>

                {response.comment && <p className="mt-4 text-sm leading-6 text-slate-600">{response.comment}</p>}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Link to={`/job/${response.order_id}`} className="inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                    {language === 'uz' ? 'Buyurtmani ko‘rish' : 'Открыть заявку'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
