import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function submitCustomer(payload) {
  const { data } = await api.post('/api/customers', payload);
  return data;
}

export async function getCustomer(id) {
  const { data } = await api.get(`/api/customers/${id}`);
  return data;
}
