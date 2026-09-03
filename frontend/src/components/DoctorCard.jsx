import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { t } from '../utils/translations';

const SPECIALTY_GRADIENT = {
  'Internal Medicine': 'from-blue-600 to-blue-700',
  'Cardiology':        'from-rose-500 to-red-600',
  'Orthopedics':       'from-emerald-500 to-teal-600',
};

const SPECIALTY_BTN = {
  'Internal Medicine': 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
  'Cardiology':        'bg-rose-500 hover:bg-rose-600 shadow-rose-100',
  'Orthopedics':       'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
};

const SPECIALTY_CHIP = {
  'Internal Medicine': 'bg-blue-50 text-blue-600',
  'Cardiology':        'bg-rose-50 text-rose-600',
  'Orthopedics':       'bg-emerald-50 text-emerald-600',
};

const SPECIALTY_SELECTED_SLOT = {
  'Internal Medicine': 'bg-blue-600 text-white shadow-sm shadow-blue-200',
  'Cardiology':        'bg-rose-500 text-white shadow-sm shadow-rose-200',
  'Orthopedics':       'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const SpinnerIcon = () => (
  <svg className="animate-rotating w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
  </svg>
);

export default function DoctorCard({ doctor, language, onBook }) {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const gradient      = SPECIALTY_GRADIENT[doctor.specialty] || 'from-slate-600 to-slate-700';
  const btnClass      = SPECIALTY_BTN[doctor.specialty]      || 'bg-slate-600 hover:bg-slate-700 shadow-slate-100';
  const chipClass     = SPECIALTY_CHIP[doctor.specialty]     || 'bg-slate-50 text-slate-600';
  const selectedClass = SPECIALTY_SELECTED_SLOT[doctor.specialty] || 'bg-slate-600 text-white';

  const todayStr     = new Date().toISOString().split('T')[0];
  const doctorName   = language === 'ar' ? doctor.nameAr   : doctor.name;
  const specialty    = language === 'ar' ? doctor.specialtyAr : doctor.specialty;
  const description  = language === 'ar' ? doctor.descriptionAr : doctor.description;
  const initials     = getInitials(doctorName);
  const available    = slots.filter(s => s.available).length;

  useEffect(() => {
    if (selectedDate) {
      setSlotsLoading(true);
      apiClient.getAvailableSlots(doctor._id, selectedDate)
        .then(data => setSlots(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;
    setBooking(true);
    const d = new Date(selectedDate);
    d.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
    await onBook({ doctorId: doctor._id, startTime: d.toISOString() });
    setBooking(false);
    setShowBooking(false);
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
  };

  const closeBooking = () => {
    setShowBooking(false);
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${gradient} p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative flex items-start gap-3">

          {/* Avatar with initials */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{doctorName}</h3>
            <p className="text-white/70 text-xs mt-0.5">{specialty}</p>
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-yellow-300">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 text-xs font-medium">4.8</span>
            </div>
          </div>

          <div className="shrink-0 text-end">
            <p className="text-white font-bold text-xl leading-none">{doctor.consultationFee}</p>
            <p className="text-white/65 text-[11px] mt-0.5">{t('sar', language)} {t('perVisit', language)}</p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${chipClass}`}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            30 {t('minutes', language)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            {t('availableDays', language)}
          </span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-5 flex-1">{description}</p>

        {/* Book / Booking form */}
        {!showBooking ? (
          <button
            onClick={() => setShowBooking(true)}
            className={`w-full ${btnClass} text-white py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            {t('bookNow', language)}
          </button>
        ) : (
          <div className="border border-slate-100 rounded-xl p-4 space-y-4 bg-slate-50 animate-scale-in">

            {/* Step 1 — Date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                {t('selectDate', language)}
              </label>
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); setSlots([]); }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
              />
            </div>

            {/* Step 2 — Time slots */}
            {selectedDate && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  {t('selectTime', language)}
                  {available > 0 && (
                    <span className="ms-1 text-emerald-600 font-normal">
                      ({available} {t('available', language)})
                    </span>
                  )}
                </label>

                {slotsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-5 text-slate-400 text-xs">
                    <SpinnerIcon />
                    {t('loading', language)}
                  </div>
                ) : available === 0 && slots.length > 0 ? (
                  <p className="text-xs text-red-500 text-center py-2">{t('noSlots', language)}</p>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          selectedSlot?.label === slot.label
                            ? selectedClass
                            : slot.available
                              ? 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3 — Confirm */}
            {selectedSlot && (
              <div className="animate-fade-in">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                </label>
                <div className="bg-white border border-slate-100 rounded-xl p-3 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{language === 'ar' ? 'الموعد' : 'Appointment'}</span>
                    <span className="font-semibold text-slate-800">{selectedDate} · {selectedSlot.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t('consultationFee', language)}</span>
                    <span className="font-bold text-blue-600">{doctor.consultationFee} {t('sar', language)}</span>
                  </div>
                </div>
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className={`w-full ${btnClass} disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2`}
                >
                  {booking ? <><SpinnerIcon />{language === 'ar' ? 'جاري الحجز...' : 'Booking...'}</> : t('confirm', language)}
                </button>
              </div>
            )}

            <button
              onClick={closeBooking}
              className="w-full text-xs text-slate-400 hover:text-slate-600 py-0.5 transition-colors"
            >
              {language === 'ar' ? '← رجوع' : '← Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
