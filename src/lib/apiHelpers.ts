import apiClient from "./apiClient";

export const get = async <T>(url: string, params?: object) => {
  return apiClient.get<T>(url, { params });
};

export const post = async <T>(url: string, data?: object) => {
  return apiClient.post<T>(url, data);
};

export const put = async <T>(url: string, data?: object) => {
  return apiClient.put<T>(url, data);
};

export const del = async <T>(url: string) => {
  return apiClient.delete<T>(url);
};
