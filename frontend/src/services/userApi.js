import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function registerUser(payload) {
  const { data } = await api.post('/api/users/register', payload);
  return data;
}

export async function verifyMfa(payload) {
  const { data } = await api.post('/api/users/verify-mfa', payload);
  return data;
}
