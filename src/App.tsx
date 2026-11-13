import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
const Home = lazy(() => import('./pages/Home'));
const Masters = lazy(() => import('./pages/Masters'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileJobs = lazy(() => import('./pages/ProfileJobs'));
const CreateJob = lazy(() => import('./pages/CreateJob'));
const MasterDetail = lazy(() => import('./pages/MasterDetail'));
const Job = lazy(() => import('./pages/Job'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ProfileResponses = lazy(() => import('./pages/ProfileResponses'));
const Chat = lazy(() => import('./pages/Chat'));
import { supabase } from './lib/supabaseClient';
import { cache } from './lib/cache';
import { lazy, Suspense, useEffect } from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isChatPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isChatPage && <Footer />}
      {!isChatPage && <BottomNav />}
    </div>
  );
}


function NotFound() {
  const { language } = useApp();
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">UstaTop</p>
        <h1 className="mt-3 text-6xl font-extrabold tracking-tight text-slate-900">404</h1>
        <p className="mt-4 text-lg font-semibold text-slate-800">{language === 'uz' ? 'Sahifa topilmadi' : 'Страница не найдена'}</p>
        <p className="mt-2 text-sm text-slate-500">{language === 'uz' ? 'Manzilni tekshiring yoki bosh sahifaga qayting.' : 'Проверьте адрес или вернитесь на главную страницу.'}</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800">{language === 'uz' ? 'Bosh sahifa' : 'На главную'}</Link>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const preload = async () => {
      const cached = cache.getOrders();
      if (!cached) {
        console.log('🔄 Предзагрузка заказов...');
        const { data } = await supabase
          .from('orders')
          .select('id, title_uz, title_ru, description_uz, description_ru, budget, category, region, district, created_at, responses, author_id')
          .limit(10)
          .order('created_at', { ascending: false });
        if (data) cache.setOrders(data);
      }
    };
    preload();
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 text-sm font-medium text-slate-500" role="status">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/master/:id" element={<MasterDetail />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job/:id" element={<Job />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/jobs" element={<ProfileJobs />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/responses" element={<ProfileResponses />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;