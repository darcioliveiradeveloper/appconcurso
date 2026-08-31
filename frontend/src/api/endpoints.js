import api from './axios';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};

export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  getTopics: (subjectId) => api.get('/subjects/topics', { params: { subjectId } })
};

export const simuladosApi = {
  start: (data) => api.post('/simulados', data),
  getQuestion: (sessionId, questionIndex) => api.get(`/simulados/${sessionId}/question/${questionIndex}`),
  submitAnswer: (sessionId, questionIndex, selectedIndex) => api.post(`/simulados/${sessionId}/question/${questionIndex}/answer`, { selectedIndex }),
  finish: (sessionId) => api.post(`/simulados/${sessionId}/finish`),
  getHistory: (params) => api.get('/simulados/history', { params }),
  getDetail: (id) => api.get(`/simulados/${id}`)
};

export const cargosApi = {
  getAll: () => api.get('/cargos'),
  getByCode: (code) => api.get(`/cargos/${code}`)
};