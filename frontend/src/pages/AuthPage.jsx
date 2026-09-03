import React, { useState } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

const CheckCircleIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const FEATURES = [
  { en: 'Book appointments with top-rated specialists', ar: 'احجز مواعيد مع أفضل المتخصصين' },
  { en: 'AI-powered scheduling — available 24/7',      ar: 'جدولة ذكية مدعومة بالذكاء الاصطناعي' },
  { en: 'Voice booking in Arabic & English',           ar: 'حجز صوتي باللغتين العربية والإنجليزية' },
  { en: 'Instant confirmation & smart reminders',      ar: 'تأكيد فوري وتذكيرات ذكية' },
];

export default function AuthPage({ onLoginSuccess, language, toggleLanguage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', language });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isRtl = language === 'ar';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await apiClient.loginUser(formData.email, formData.password);
      } else {
        response = await apiClient.registerUser({ ...formData, language });
      }
      if (response.success || response.userId) {
        onLoginSuccess?.(response);
      } else {
        setError(response.error || response.message || (isRtl ? 'حدث خطأ' : 'Something went wrong'));
      }
    } catch {
      setError(isRtl ? 'تعذر الاتصال بالخادم' : 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Brand Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[50%] relative flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-600/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-52 h-52 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top: Logo + features */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth={1.5}/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{isRtl ? 'مستشفى الصحة' : 'Health Hospital'}</p>
              <p className="text-blue-200 text-xs mt-0.5">{isRtl ? 'نظام حجز ذكي' : 'Smart Booking System'}</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            {isRtl ? (
              <><span className="text-blue-200">رعاية صحية</span><br />في متناول يدك</>
            ) : (
              <>Healthcare<br /><span className="text-blue-200">at your fingertips</span></>
            )}
          </h1>
          <p className="text-blue-100/80 text-base leading-relaxed mb-12 max-w-xs">
            {isRtl
              ? 'احجز مواعيدك الطبية بسهولة مع مساعد ذكي يتحدث لغتك'
              : 'Book your medical appointments easily with an AI assistant that speaks your language'}
          </p>

          <div className="space-y-3.5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-50">
                <div className="text-emerald-300"><CheckCircleIcon /></div>
                <span className="text-sm font-medium">{isRtl ? f.ar : f.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Stats */}
        <div className="relative flex items-center gap-8">
          {[
            { val: '1,200+', label: isRtl ? 'مريض سعيد' : 'Happy Patients' },
            { val: '4.9★',   label: isRtl ? 'تقييم المرضى' : 'Patient Rating' },
            { val: '24/7',   label: isRtl ? 'دعم ذكي' : 'AI Support' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px h-10 bg-white/20" />}
              <div>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200/60">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth={1.5}/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{isRtl ? 'مستشفى الصحة' : 'Health Hospital'}</h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {isLogin
                  ? (isRtl ? 'أهلاً بعودتك' : 'Welcome back')
                  : (isRtl ? 'إنشاء حساب جديد' : 'Create your account')}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {isLogin
                  ? (isRtl ? 'سجّل دخولك للمتابعة' : 'Sign in to continue')
                  : (isRtl ? 'انضم إلينا مجاناً' : 'Join us — it\'s free')}
              </p>
            </div>

            {/* Login / Register tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
              {[true, false].map((isL) => (
                <button
                  key={String(isL)}
                  onClick={() => setIsLogin(isL)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isLogin === isL
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {isL ? t('login', language) : t('register', language)}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('name', language)}</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      placeholder={isRtl ? 'الاسم الكامل' : 'Your full name'}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone', language)}</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                      placeholder="+966 5x xxx xxxx"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email', language)}</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('password', language)}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isRtl ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRtl ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-rotating w-4 h-4 opacity-75" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
                    </svg>
                    {isRtl ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : (
                  isLogin ? t('login', language) : t('register', language)
                )}
              </button>
            </form>
          </div>

          {/* Language toggle */}
          <div className="text-center mt-4">
            <button
              onClick={toggleLanguage}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
            >
              {language === 'en' ? '🌐 العربية' : '🌐 English'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
