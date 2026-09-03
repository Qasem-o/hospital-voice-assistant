import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

const QUICK_REPLIES = {
  en: ['Book an appointment', 'Available doctors', 'My appointments', 'Cancel booking'],
  ar: ['احجز موعداً', 'الأطباء المتاحون', 'مواعيدي', 'إلغاء حجز'],
};

const BotAvatar = () => (
  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.613-1.323 2.613H4.32c-1.354 0-2.324-1.612-1.324-2.613L4.15 15.3" />
    </svg>
  </div>
);

export default function ChatBot({ language, userId }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  const isRtl = language === 'ar';

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeChat();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await apiClient.initChat();
      setSessionId(response.sessionId);
      const greeting = isRtl
        ? 'مرحباً! أنا مساعدك لحجز مواعيد المستشفى. كيف يمكنني مساعدتك؟'
        : "Hello! I'm your hospital appointment assistant. How can I help you?";
      setMessages([{ type: 'bot', text: greeting, time: new Date() }]);
    } catch {}
  };

  const bookAppointmentFromAI = async (bookingAction) => {
    try {
      const doctorsData = await apiClient.getDoctorsForAI();
      const doctor = doctorsData.doctors.find(d =>
        d.name?.toLowerCase() === bookingAction.doctor?.toLowerCase() ||
        bookingAction.doctor?.toLowerCase().includes(d.name?.split(' ').slice(-1)[0]?.toLowerCase())
      );
      if (!doctor) return;

      if (bookingAction.reschedule && userId) {
        const userAppts = await apiClient.getUserAppointments(userId);
        const existing = Array.isArray(userAppts) && userAppts.find(a =>
          (a.doctorId?._id === doctor.id || a.doctorId === doctor.id) && a.status !== 'cancelled'
        );
        if (existing) await apiClient.cancelAppointment(existing._id);
      }

      const apptDate = new Date(bookingAction.date || new Date());
      apptDate.setHours(bookingAction.hour, bookingAction.minute || 0, 0, 0);
      if (apptDate < new Date()) apptDate.setDate(apptDate.getDate() + 1);

      const result = await apiClient.createAppointment({
        userId,
        doctorId: doctor.id,
        startTime: apptDate.toISOString(),
        bookedVia: 'ai-chat',
      });

      const timeStr = `${String(bookingAction.hour).padStart(2, '0')}:${String(bookingAction.minute || 0).padStart(2, '0')}`;
      const confirmMsg = result.success
        ? (isRtl
          ? `✅ تم تأكيد موعدك مع ${doctor.nameAr || doctor.name} في الساعة ${timeStr}. يمكنك مراجعته في صفحة المواعيد.`
          : `✅ Your appointment with ${doctor.name} at ${timeStr} is confirmed. View it in your appointments page.`)
        : (isRtl
          ? `⚠️ الوقت ${timeStr} محجوز مسبقاً. يرجى اختيار وقت آخر.`
          : `⚠️ The ${timeStr} slot is already taken. Please choose a different time.`);

      setMessages(prev => [...prev, { type: 'bot', text: confirmMsg, time: new Date() }]);
    } catch {
      const errMsg = isRtl ? 'تعذّر إتمام الحجز، يرجى المحاولة مجدداً.' : 'Booking failed, please try again.';
      setMessages(prev => [...prev, { type: 'bot', text: errMsg, time: new Date() }]);
    }
  };

  const sendMessage = async (text) => {
    const msg = (text ?? inputValue).trim();
    if (!msg || !sessionId || loading) return;

    setInputValue('');
    setShowQuick(false);
    setMessages(prev => [...prev, { type: 'user', text: msg, time: new Date() }]);
    setLoading(true);

    try {
      const response = await apiClient.sendMessage(sessionId, msg, language);
      setMessages(prev => [...prev, { type: 'bot', text: response.reply, time: new Date() }]);
      if (response.bookingAction && userId) {
        await bookAppointmentFromAI(response.bookingAction);
      }
    } catch {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: isRtl ? 'عذراً، حدث خطأ. يرجى المحاولة مجدداً.' : 'Sorry, an error occurred. Please try again.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  const fmtTime = (d) =>
    d?.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
        style={{ height: '75vh' }}
      >

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 text-white flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white/15 rounded-xl border border-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.613-1.323 2.613H4.32c-1.354 0-2.324-1.612-1.324-2.613L4.15 15.3" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm">{t('chats', language)}</h2>
            <p className="text-blue-200 text-xs">{isRtl ? 'مساعد حجز المواعيد' : 'Appointment Booking Assistant'}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-blue-100 font-medium">{isRtl ? 'متصل' : 'Online'}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 animate-fade-in-up ${
                msg.type === 'user'
                  ? (isRtl ? 'justify-start' : 'justify-end')
                  : (isRtl ? 'justify-end' : 'justify-start')
              }`}
            >
              {msg.type === 'bot' && <BotAvatar />}

              <div className={`max-w-[75%] ${msg.type === 'user' ? '' : ''}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.time && (
                  <p className={`text-[10px] text-slate-400 mt-1 ${msg.type === 'user' ? 'text-end' : 'text-start'}`}>
                    {fmtTime(msg.time)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className={`flex gap-2.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <BotAvatar />
              <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                {[0, 150, 300].map(d => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {showQuick && messages.length <= 1 && (
          <div className="px-4 pb-3 bg-slate-50/70 flex flex-wrap gap-2">
            {(isRtl ? QUICK_REPLIES.ar : QUICK_REPLIES.en).map((r, i) => (
              <button
                key={i}
                onClick={() => sendMessage(r)}
                className="text-xs bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-slate-100 p-3 shrink-0">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRtl ? 'اكتب رسالتك...' : 'Type your message...'}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`}>
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
