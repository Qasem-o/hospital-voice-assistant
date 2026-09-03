import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BrowseDoctorsPage from './pages/BrowseDoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ChatBot from './components/ChatBot';
import VoiceChatBot from './components/VoiceChatBot';
import { t } from './utils/translations';
import './app.css';

const DoctorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
  </svg>
);

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState('ar');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) setUserId(savedUserId);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const handleLoginSuccess = (user) => {
    setUserId(user.userId);
    setUserName(user.name || '');
    setLanguage(user.language || 'ar');
    localStorage.setItem('userId', user.userId);
    navigate('/doctors');
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName('');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'ar' : 'en');

  const navLinks = [
    { to: '/doctors',      icon: <DoctorsIcon />,  label: t('browseDoctors', language) },
    { to: '/appointments', icon: <CalendarIcon />, label: t('myAppointments', language) },
    { to: '/chat',         icon: <ChatIcon />,     label: t('aiChat', language) },
    { to: '/voice',        icon: <MicIcon />,      label: t('voiceChat', language) },
  ];

  const initials = getInitials(userName);

  return (
    <div className={`min-h-screen bg-slate-50 ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {userId && (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-[62px]">

              {/* Logo */}
              <Link to="/doctors" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth={1.5}/>
                    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="font-bold text-slate-900 text-sm">{t('appTitle', language)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t('appSubtitle', language)}</p>
                </div>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      location.pathname === link.to
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleLanguage}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  {language === 'en' ? 'ع' : 'EN'}
                </button>

                {userName && (
                  <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-xl">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm text-slate-700 font-medium max-w-[100px] truncate">{userName}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-xl hover:bg-red-50 transition-all"
                >
                  <LogoutIcon />
                  <span className="hidden sm:block">{t('logout', language)}</span>
                </button>
              </div>
            </div>

            {/* Mobile nav strip */}
            <div className="md:hidden flex gap-0.5 pb-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className={`${userId ? 'p-4 md:p-6 max-w-7xl mx-auto' : ''}`}>
        <Routes>
          <Route path="/auth"         element={<AuthPage onLoginSuccess={handleLoginSuccess} language={language} toggleLanguage={toggleLanguage} />} />
          <Route path="/doctors"      element={userId ? <BrowseDoctorsPage userId={userId} language={language} /> : <Navigate to="/auth" />} />
          <Route path="/appointments" element={userId ? <AppointmentsPage userId={userId} language={language} /> : <Navigate to="/auth" />} />
          <Route path="/chat"         element={userId ? <ChatBot userId={userId} language={language} /> : <Navigate to="/auth" />} />
          <Route path="/voice"        element={userId ? <VoiceChatBot userId={userId} language={language} /> : <Navigate to="/auth" />} />
          <Route path="*"             element={<Navigate to={userId ? '/doctors' : '/auth'} />} />
        </Routes>
      </main>
    </div>
  );
}
