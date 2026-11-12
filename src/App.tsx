import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Masters from './pages/Masters';
import Jobs from './pages/Jobs';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProfileJobs from './pages/ProfileJobs';
import CreateJob from './pages/CreateJob';
import MasterDetail from './pages/MasterDetail';
import Job from './pages/Job';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ProfileResponses from './pages/ProfileResponses';
import Chat from './pages/Chat';
import { supabase } from './lib/supabaseClient';
import { cache } from './lib/cache';
import { useEffect } from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
          .select('*')
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
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;