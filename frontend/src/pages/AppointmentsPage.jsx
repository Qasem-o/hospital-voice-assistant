import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

const STATUS_CFG = {
  confirmed: {
    bar:    'bg-emerald-500',
    badge:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd"/></svg>,
  },
  cancelled: {
    bar:    'bg-red-400',
    badge:  'bg-red-50 text-red-600 border-red-200',
    icon:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z"/></svg>,
  },
  completed: {
    bar:    'bg-slate-300',
    badge:  'bg-slate-50 text-slate-500 border-slate-200',
    icon:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.049l4.25-5.5z" clipRule="evenodd"/></svg>,
  },
};

const SPECIALTY_ICONS = {
  'Internal Medicine': '🩺',
  'Cardiology':        '❤️',
  'Orthopedics':       '🦴',
};

const SpinnerIcon = () => (
  <svg className="animate-rotating w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
  </svg>
);

export default function AppointmentsPage({ language, userId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => { loadAppointments(); }, [userId]);

  const loadAppointments = async () => {
    try {
      const data = await apiClient.getUserAppointments(userId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await apiClient.cancelAppointment(id);
      await loadAppointments();
    } catch {} finally { setCancelling(null); }
  };

  const fmt = (dateStr, opts) =>
    new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', opts);

  const fmtTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const now = new Date();
  const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.startTime) >= now);
  const past     = appointments.filter(a => a.status !== 'confirmed' || new Date(a.startTime) < now);

  const TABS = [
    { id: 'upcoming', label: language === 'ar' ? 'القادمة'  : 'Upcoming', data: upcoming },
    { id: 'past',     label: language === 'ar' ? 'السابقة'  : 'Past',     data: past },
    { id: 'all',      label: language === 'ar' ? 'الكل'     : 'All',      data: appointments },
  ];

  const visible = TABS.find(tb => tb.id === activeTab)?.data ?? appointments;

  return (
    <div className="animate-fade-in-up">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('myAppointments', language)}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {language === 'ar'
            ? `لديك ${upcoming.length} موعد قادم`
            : `You have ${upcoming.length} upcoming appointment${upcoming.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.data.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {tab.data.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3].map(j => <div key={j} className="h-14 bg-slate-50 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold mb-1">{language === 'ar' ? 'لا توجد مواعيد' : 'No appointments'}</p>
          <p className="text-slate-400 text-sm">{t('noAppointments', language)}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((appt, i) => {
            const status = appt.status || 'confirmed';
            const cfg    = STATUS_CFG[status] || STATUS_CFG.confirmed;
            const doctor = appt.doctorId;
            const name   = language === 'ar' ? doctor?.nameAr   : doctor?.name;
            const spec   = language === 'ar' ? doctor?.specialtyAr : doctor?.specialty;
            const icon   = SPECIALTY_ICONS[doctor?.specialty] || '👨‍⚕️';

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Status bar */}
                <div className={`h-1 w-full ${cfg.bar}`} />

                <div className="p-5">
                  {/* Doctor row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{name || '—'}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{spec || ''}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.badge}`}>
                      {cfg.icon}
                      {t(status, language)}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {fmt(appt.startTime, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">{language === 'ar' ? 'الوقت' : 'Time'}</p>
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] text-blue-400 font-medium mb-0.5">{t('consultationFee', language)}</p>
                      <p className="text-xs font-bold text-blue-600">{doctor?.consultationFee} {t('sar', language)}</p>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={cancelling === appt._id}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 font-medium border border-slate-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {cancelling === appt._id ? (
                        <><SpinnerIcon />{language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
                      ) : (
                        <>
                          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z"/>
                          </svg>
                          {t('cancel', language)}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
