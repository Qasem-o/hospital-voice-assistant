const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = {
  // Appointments
  createAppointment: (data) => fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getUserAppointments: (userId) => fetch(`${API_BASE}/appointments/user/${userId}`).then(r => r.json()),

  getAvailableSlots: (doctorId, date) =>
    fetch(`${API_BASE}/appointments/doctor/${doctorId}/slots?date=${date}`).then(r => r.json()),

  cancelAppointment: (id) => fetch(`${API_BASE}/appointments/${id}/cancel`, {
    method: 'PUT'
  }).then(r => r.json()),

  // Doctors
  getAllDoctors: (specialty) => {
    const url = specialty
      ? `${API_BASE}/doctors?specialty=${encodeURIComponent(specialty)}`
      : `${API_BASE}/doctors`;
    return fetch(url).then(r => r.json());
  },

  getSpecialties: () => fetch(`${API_BASE}/doctors/specialties`).then(r => r.json()),

  getDoctor: (id) => fetch(`${API_BASE}/doctors/${id}`).then(r => r.json()),

  // Users
  registerUser: (data) => fetch(`${API_BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  loginUser: (email, password) => fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json()),

  // AI Chat
  initChat: () => fetch(`${API_BASE}/ai/init-chat`, { method: 'POST' }).then(r => r.json()),

  sendMessage: (sessionId, message, language) => fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userMessage: message, language })
  }).then(r => r.json()).then(data => {
    if (!data.reply) throw new Error(data.error || 'No reply from AI');
    return data;
  }),

  getDoctorsForAI: () => fetch(`${API_BASE}/ai/doctors`).then(r => r.json()),

  // Voice
  synthesizeText: (text, language) => fetch(`${API_BASE}/voice/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  }).then(r => r.json()),

  initiatePhoneCall: (userId, phoneNumber) => fetch(`${API_BASE}/voice/initiate-call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, phoneNumber })
  }).then(r => r.json())
};
