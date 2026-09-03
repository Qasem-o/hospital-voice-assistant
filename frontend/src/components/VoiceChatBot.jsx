import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

const BotAvatar = () => (
  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.613-1.323 2.613H4.32c-1.354 0-2.324-1.612-1.324-2.613L4.15 15.3" />
    </svg>
  </div>
);

const Waveform = ({ color = 'text-blue-300' }) => (
  <div className={`voice-waveform ${color}`}>
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="voice-waveform-bar" />)}
  </div>
);

export default function VoiceChatBot({ language, userId }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const speakingRef = useRef(false);
  const speakResolveRef = useRef(null);
  const initializedRef = useRef(false);

  const isRtl = language === 'ar';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = isRtl ? 'ar-SA' : 'en-US';
      recognitionRef.current.onstart  = () => { setIsListening(true); setTranscript(''); };
      recognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) setTranscript(event.results[i][0].transcript);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend   = () => setIsListening(false);
    }
    return () => recognitionRef.current?.abort();
  }, [language]);

  useEffect(() => {
    if (!initializedRef.current) { initializedRef.current = true; initializeChat(); }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await apiClient.initChat();
      setSessionId(response.sessionId);
      const greeting = isRtl
        ? 'مرحباً! كيف يمكنني مساعدتك في حجز موعد؟'
        : 'Hello! How can I help you book an appointment?';
      setMessages([{ type: 'bot', text: greeting, isVoice: true }]);
      speakMessage(greeting);
    } catch {}
  };

  const stopAllAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    setIsSpeaking(false);
    speakResolveRef.current?.();
    speakResolveRef.current = null;
  };

  const speakMessage = (text) => {
    if (!text) return Promise.resolve();
    speakResolveRef.current?.();
    speakResolveRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    speakingRef.current = true;
    setIsSpeaking(true);

    return new Promise((resolve) => {
      speakResolveRef.current = resolve;
      const onDone = () => {
        speakingRef.current = false;
        setIsSpeaking(false);
        audioRef.current = null;
        speakResolveRef.current = null;
        resolve();
      };
      (async () => {
        try {
          const resp = await apiClient.synthesizeText(text, language);
          if (resp.audioBase64) {
            const audio = new Audio(`data:audio/mpeg;base64,${resp.audioBase64}`);
            audioRef.current = audio;
            audio.onended = onDone;
            audio.onerror = () => onDone();
            try { await audio.play(); return; } catch {
              audio.onended = null; audio.onerror = null; audioRef.current = null;
            }
          }
        } catch {}
        const synth = window.speechSynthesis;
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = isRtl ? 'ar-SA' : 'en-US';
        utt.rate = 0.9;
        utt.onend = onDone; utt.onerror = onDone;
        synth.speak(utt);
        setTimeout(() => { if (speakingRef.current) onDone(); }, 15000);
      })();
    });
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
        userId, doctorId: doctor.id, startTime: apptDate.toISOString(), bookedVia: 'voice-chat'
      });

      const timeStr = `${String(bookingAction.hour).padStart(2, '0')}:${String(bookingAction.minute || 0).padStart(2, '0')}`;
      const msg = result.success
        ? (isRtl
          ? `تم حجز موعدك بنجاح مع ${doctor.nameAr} في تمام الساعة ${timeStr}.`
          : `Your appointment with ${doctor.name} at ${timeStr} has been booked.`)
        : (isRtl
          ? `الوقت ${timeStr} محجوز مسبقاً. يرجى اختيار وقت آخر.`
          : `The ${timeStr} slot is already taken. Please choose a different time.`);

      setMessages(prev => [...prev, { type: 'bot', text: msg, isVoice: true }]);
      await speakMessage(msg);
    } catch {}
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !sessionId || loading) return;
    setTranscript('');
    setMessages(prev => [...prev, { type: 'user', text, isVoice: true }]);
    setLoading(true);
    try {
      const response = await apiClient.sendMessage(sessionId, text, language);
      setMessages(prev => [...prev, { type: 'bot', text: response.reply, isVoice: true }]);
      await speakMessage(response.reply);
      if (response.bookingAction && userId) await bookAppointmentFromAI(response.bookingAction);
    } catch {
      const errMsg = isRtl ? 'عذراً، حدث خطأ.' : 'Sorry, an error occurred.';
      setMessages(prev => [...prev, { type: 'bot', text: errMsg, isVoice: true }]);
      speakMessage(errMsg);
    } finally { setLoading(false); }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) recognitionRef.current.start();
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };
  const handleVoiceSubmit = () => {
    if (transcript.trim()) { handleSendMessage(transcript); setTranscript(''); }
  };

  /* Derived state for the mic button */
  const micDisabled = isListening || loading || isSpeaking;
  const statusLabel = isListening
    ? (isRtl ? 'جاري الاستماع...' : 'Listening...')
    : isSpeaking
      ? (isRtl ? 'المساعد يتحدث...' : 'Speaking...')
      : loading
        ? (isRtl ? 'جاري المعالجة...' : 'Processing...')
        : (isRtl ? 'اضغط للتحدث' : 'Tap to speak');

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isRtl ? 'text-right' : ''}`}
      style={{ height: '80vh' }}
    >

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-white/15 rounded-xl border border-white/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-sm">{isRtl ? 'المساعد الصوتي' : 'Voice Assistant'}</h2>
          <p className="text-blue-200 text-xs">{isRtl ? 'احجز موعدك بصوتك' : 'Book your appointment by voice'}</p>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
          {isListening || isSpeaking ? (
            <Waveform color={isListening ? 'text-red-300' : 'text-emerald-300'} />
          ) : (
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-slate-300'}`} />
          )}
          <span className="text-[11px] text-blue-100 font-medium ms-1">
            {isListening ? (isRtl ? 'يستمع' : 'Listening')
              : isSpeaking ? (isRtl ? 'يتحدث' : 'Speaking')
              : (isRtl ? 'جاهز' : 'Ready')}
          </span>
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
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.type === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
            }`}>
              <p>{msg.text}</p>
              {msg.isVoice && (
                <p className="text-[10px] opacity-50 mt-1">
                  {msg.type === 'user' ? '🎤' : '🔊'}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className={`flex gap-2.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
            <BotAvatar />
            <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Live transcript preview */}
        {transcript && (
          <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[75%] bg-blue-50 text-blue-900 px-4 py-3 rounded-2xl border border-blue-200 text-sm italic">
              {transcript}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-slate-100 px-5 py-5 shrink-0">

        {/* Transcript confirmation */}
        {transcript && (
          <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700">
            <p className="text-[10px] text-blue-400 font-semibold mb-1 uppercase tracking-wider">
              {isRtl ? 'سمعت' : 'Heard'}
            </p>
            {transcript}
          </div>
        )}

        {/* Primary mic button */}
        <div className="flex items-center justify-center gap-4 mb-4">

          {/* Mute / stop speaking */}
          <button
            onClick={stopAllAudio}
            disabled={!isSpeaking}
            title={isRtl ? 'إيقاف الصوت' : 'Mute'}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M9.547 3.062A.75.75 0 0110 3.75v12.5a.75.75 0 01-1.264.546L4.703 13H3.167a.75.75 0 01-.7-.48A6.985 6.985 0 012 10c0-.887.165-1.737.468-2.52a.75.75 0 01.7-.48h1.535l4.033-3.796a.75.75 0 01.811-.142zM13.28 7.22a.75.75 0 10-1.06 1.06L13.44 9.5l-1.22 1.22a.75.75 0 101.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 101.06-1.06L15.56 9.5l1.22-1.22a.75.75 0 00-1.06-1.06l-1.22 1.22-1.22-1.22z"/>
            </svg>
          </button>

          {/* Main mic button */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-red-400 pulse-ring text-red-400" />
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading || isSpeaking}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center font-semibold text-white shadow-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 scale-110'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:scale-100 hover:scale-105'
              }`}
            >
              {isListening ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>

          {/* Send transcript / stop mic */}
          {transcript ? (
            <button
              onClick={handleVoiceSubmit}
              disabled={loading}
              title={isRtl ? 'إرسال' : 'Send'}
              className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center text-white transition-colors shadow-sm"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <div className="w-11 h-11" /> /* spacer */
          )}
        </div>

        {/* Status label */}
        <p className="text-center text-xs text-slate-400 font-medium">{statusLabel}</p>
      </div>
    </div>
  );
}
