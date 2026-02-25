import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function getCreditCards() {
  const { data } = await api.get('/api/credit-cards');
  return data;
}

export async function createCreditCard(payload) {
  const { data } = await api.post('/api/credit-cards', payload, {
    headers: {
      Authorization: 'Basic ' + btoa('admin:admin'),
    },
  });
  return data;
}
