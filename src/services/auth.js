import api from './api';

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function refreshRequest(refreshToken) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data.tokens;
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data;
}
