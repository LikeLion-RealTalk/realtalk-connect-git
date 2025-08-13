import { apiClient } from './apiClient';
import { setToken, removeToken } from '@/utils/token';

export const login = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  setToken(data.token);
  return data;
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

export const refreshToken = async () => {
  const { data } = await apiClient.post('/auth/refresh');
  setToken(data.token);
  return data;
};
