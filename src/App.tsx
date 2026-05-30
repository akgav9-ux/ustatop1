import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

function App() {
  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) console.error('Ошибка:', error);
      else console.log('Supabase подключен успешно!', data);
    };
    testSupabase();
  }, []);

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
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;