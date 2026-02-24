import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function getAccount(customerId) {
  const { data } = await api.get(`/api/accounts/${customerId}`);
  return data;
}

export async function getTransactions(customerId) {
  const { data } = await api.get(`/api/accounts/${customerId}/transactions`);
  return data;
}
