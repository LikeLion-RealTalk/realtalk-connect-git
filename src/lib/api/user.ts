import apiClient from './axiosInstance';

export const fetchUserProfile = () => apiClient.get('/users/me');

export const login = (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password });

export const logout = () => apiClient.post('/auth/logout');
