import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

export default function PhoneChatBot({ language, userId }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPhoneActive, setIsPhoneActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await apiClient.initChat();
      setSessionId(response.sessionId);
      addMessage('bot', response.greeting);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const startPhoneCall = async () => {
    if (!phoneNumber.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter a phone number');
      return;
    }

    setIsCalling(true);
    setIsPhoneActive(true);
    setCallDuration(0);
    initializeChat();

    addMessage('system', language === 'ar' 
      ? `📞 جاري الاتصال برقم ${phoneNumber}...`
      : `📞 Calling ${phoneNumber}...`
    );

    // Simulate call connection
    setTimeout(() => {
      addMessage('system', language === 'ar' 
        ? '✅ تم الاتصال بنجاح. تحدث مع المساعد الذكي'
        : '✅ Call connected. Start talking to the AI assistant'
      );
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2000);
  };

  const endPhoneCall = () => {
    setIsCalling(false);
    setIsPhoneActive(false);
    setPhoneNumber('');
    setCallDuration(0);
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    addMessage('system', language === 'ar'
      ? `📞 تم إنهاء الاتصال. المدة: ${formatCallDuration(callDuration)}`
      : `📞 Call ended. Duration: ${formatCallDuration(callDuration)}`
    );
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-purple-50 to-white rounded-lg shadow-2xl ${language === 'ar' ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg shadow-md">
        <h2 className="font-bold text-lg mb-1">📞 {language === 'ar' ? 'اتصال ذكي' : 'Phone Call'}</h2>
        <p className="text-xs opacity-90">
          {language === 'ar' ? 'اتصل بالمساعد الذكي الآن' : 'Call the AI assistant now'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center justify-center">
        {!isPhoneActive ? (
          // Phone Input for initiating call
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📞</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'ar' ? 'ابدأ مكالمة' : 'Start a Call'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'أدخل رقم هاتفك للاتصال بمساعدنا الذكي'
                    : 'Enter your phone number to call our AI assistant'}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={language === 'ar' ? '+966501234567' : '+1 (555) 123-4567'}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  disabled={isCalling}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={startPhoneCall}
                  disabled={!phoneNumber.trim() || isCalling}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-400 text-white px-6 py-4 rounded-full font-bold text-lg shadow-lg transform transition hover:scale-105 disabled:scale-100"
                >
                  {isCalling 
                    ? (language === 'ar' ? '⏳ جاري الاتصال...' : '⏳ Calling...')
                    : (language === 'ar' ? '📞 ابدأ الاتصال' : '📞 Start Call')}
                </button>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-xs text-blue-800">
                  {language === 'ar'
                    ? '💡 هذه محاكاة للمكالمة. في الإصدار الكامل، يمكنك الاتصال بشكل فعلي عبر Twilio API'
                    : '💡 This is a demo. In the full version, you can make real calls via Twilio API'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Active Call Interface
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-b from-purple-600 to-purple-700 rounded-lg shadow-2xl p-8 text-white space-y-6">
              {/* Call Status */}
              <div className="text-center">
                <div className="text-5xl mb-4 animate-bounce">📞</div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'ar' ? 'في المكالمة' : 'On Call'}
                </h3>
                <p className="text-lg font-mono opacity-90">
                  {formatCallDuration(callDuration)}
                </p>
              </div>

              {/* Call Messages */}
              <div className="bg-purple-500 bg-opacity-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm border-l-2 border-white opacity-90 px-3">
                    <p>{msg.text}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm opacity-75 text-center">
                    {language === 'ar' ? 'بانتظار الرد...' : 'Waiting for response...'}
                  </p>
                )}
              </div>

              {/* Mute/Speaker Controls */}
              <div className="flex gap-3 justify-center">
                <button className="bg-purple-400 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                  🔇 {language === 'ar' ? 'كتم' : 'Mute'}
                </button>
                <button className="bg-purple-400 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                  🔊 {language === 'ar' ? 'مكبر' : 'Speaker'}
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={endPhoneCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full font-bold text-lg shadow-lg transform transition hover:scale-105"
              >
                ☎️ {language === 'ar' ? 'إنهاء المكالمة' : 'End Call'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-gray-50 border-t p-4 text-center text-xs text-gray-600">
        {language === 'ar'
          ? '⚠️ هذه ميزة تجريبية. تطبيقات الاتصال الحقيقية تتطلب تكامل Twilio أو خدمة VoIP'
          : '⚠️ This is a demo feature. Real calling requires Twilio or VoIP service integration'}
      </div>
    </div>
  );
}
