export const translations = {
  en: {
    welcome: "Welcome to the Hospital Appointment Booking System",
    appointment_confirmed: "Your appointment has been confirmed",
    appointment_failed: "Appointment booking failed",
    invalid_time: "Invalid appointment time",
    doctor_already_booked: "Sorry, this doctor already has an appointment at this time",
    select_doctor: "Please select a doctor",
    select_date: "Please select a date",
    select_time: "Please select a time",
    confirm_appointment: "Confirm your appointment",
    consultation_fee: "Consultation fee",
    doctor_details: "Doctor details",
    specialty: "Specialty",
    error: "An error occurred",
    operation_hours: "Working hours: 8 AM - 4 PM",
    available_days: "Available days: Sunday to Thursday",
  },
  ar: {
    welcome: "مرحبا بك في نظام حجز مواعيد المستشفى",
    appointment_confirmed: "تم تأكيد موعدك",
    appointment_failed: "فشل حجز الموعد",
    invalid_time: "وقت الموعد غير صحيح",
    doctor_already_booked: "عذراً، الطبيب لديه موعد في هذا الوقت",
    select_doctor: "يرجى اختيار طبيب",
    select_date: "يرجى اختيار تاريخ",
    select_time: "يرجى اختيار وقت",
    confirm_appointment: "تأكيد الموعد",
    consultation_fee: "رسوم الاستشارة",
    doctor_details: "تفاصيل الطبيب",
    specialty: "التخصص",
    error: "حدث خطأ",
    operation_hours: "ساعات العمل: 8 صباحاً - 4 مساءً",
    available_days: "الأيام المتاحة: الأحد إلى الخميس",
  }
};

export const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations.en[key];
};
