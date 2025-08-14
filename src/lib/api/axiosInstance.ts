import axios from 'axios';
import { getToken, removeToken } from '../../utils/token';
import { mapResponseData } from '../../utils/responseMapper';

const axiosInstance = axios.create({
  baseURL: 'https://api.realtalks.co.kr:8443',
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    (response) => {
      response.data = mapResponseData(response.data);
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export default axiosInstance;
