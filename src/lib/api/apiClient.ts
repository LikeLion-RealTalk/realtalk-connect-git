import axiosInstance from './axiosInstance';

export const apiClient = {
  get: (url, params = {}, config = {}) => axiosInstance.get(url, { params, ...config }),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};

export const debateApi = {
  // 토론방 전체 조회
  getAllDebateRooms: async () => {
    const response = await axiosInstance.get('/api/debate-rooms/all');
    return response.data;
  },
  
  // 토론방 생성
  createDebateRoom: async (data: any) => {
    const response = await axiosInstance.post('/api/debate-rooms', data);
    return response.data;
  },
};

export const categoryApi = {
  // 카테고리 전체 조회
  getAllCategories: async () => {
    const response = await axiosInstance.get('/api/categories/all');
    return response.data;
  },
};
