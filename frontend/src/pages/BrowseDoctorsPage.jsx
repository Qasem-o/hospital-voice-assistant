import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import DoctorCard from '../components/DoctorCard';
import { t } from '../utils/translations';

const SPECIALTY_ICONS = {
  'Internal Medicine': '🩺',
  'Cardiology':        '❤️',
  'Orthopedics':       '🦴',
};

export default function BrowseDoctorsPage({ language, userId }) {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSpecialties();
    loadDoctors();
  }, []);

  useEffect(() => { loadDoctors(); }, [selectedSpecialty]);

  const loadSpecialties = async () => {
    try {
      const data = await apiClient.getSpecialties();
      setSpecialties(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAllDoctors(selectedSpecialty || undefined);
      setDoctors(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  const handleBook = async (bookingData) => {
    try {
      const response = await apiClient.createAppointment({ userId, ...bookingData });
      if (response.success) {
        setSuccessMsg(t('appointmentConfirmed', language));
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(response.error || (language === 'ar' ? 'فشل الحجز' : 'Booking failed'));
      }
    } catch {
      alert(language === 'ar' ? 'فشل الحجز' : 'Booking failed');
    }
  };

  return (
    <div className="animate-fade-in-up">

      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-7 md:p-10 mb-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-40 h-40 bg-indigo-500/30 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-medium text-blue-100 mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {language === 'ar' ? 'الأطباء متاحون الآن' : 'Doctors available now'}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('browseHero', language)}</h1>
          <p className="text-blue-100/80 text-sm">{t('browseSubtitle', language)}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-blue-100">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
              {t('operatingHours', language)}
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-blue-100">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
              </svg>
              {t('availableDays', language)}
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-blue-100">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-yellow-300">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
              4.9 {language === 'ar' ? 'تقييم' : 'Rating'}
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-5 flex items-center gap-3 text-sm font-medium animate-fade-in-up shadow-sm">
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-600">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
          {successMsg}
        </div>
      )}

      {/* Specialty filters */}
      {specialties.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            {language === 'ar' ? 'التخصصات' : 'Specialties'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                selectedSpecialty === ''
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {t('allSpecialties', language)}
              {!loading && (
                <span className={`ms-1.5 text-xs px-1.5 py-0.5 rounded-md ${selectedSpecialty === '' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {doctors.length}
                </span>
              )}
            </button>

            {specialties.map(s => (
              <button
                key={s.specialty}
                onClick={() => setSelectedSpecialty(s.specialty)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center gap-2 ${
                  selectedSpecialty === s.specialty
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span>{SPECIALTY_ICONS[s.specialty] || '👨‍⚕️'}</span>
                <span>{language === 'ar' ? s.specialtyAr : s.specialty}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Doctors grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-50 rounded-lg w-full" />
                <div className="h-3 bg-slate-50 rounded-lg w-2/3" />
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold mb-1">
            {language === 'ar' ? 'لا يوجد أطباء متاحون' : 'No doctors available'}
          </p>
          <p className="text-slate-400 text-sm">
            {language === 'ar' ? 'حاول تغيير التخصص' : 'Try selecting a different specialty'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor, i) => (
            <div key={doctor._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <DoctorCard doctor={doctor} language={language} onBook={handleBook} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
