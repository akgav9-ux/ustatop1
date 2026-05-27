import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Masters from './pages/Masters';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProfileJobs from './pages/ProfileJobs';  // ← добавить
import CreateJob from './pages/CreateJob';
import MasterDetail from './pages/MasterDetail';
import JobDetail from './pages/JobDetail';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ProfileResponses from './pages/ProfileResponses';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-16 sm:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/masters" element={<Masters />} />
              <Route path="/master/:id" element={<MasterDetail />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/jobs" element={<ProfileJobs />} />  {/* ← добавить */}
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/responses" element={<ProfileResponses />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;