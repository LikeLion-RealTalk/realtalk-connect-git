// src/lib/apiClient.ts
import axios, { AxiosError } from "axios";

// Vite(브라우저) 또는 Node(tsx) 양쪽에서 API_BASE_URL을 읽는다.
const API_BASE_URL =
    // Vite 런타임(브라우저/빌드)일 때
    (import.meta as any)?.env?.VITE_API_BASE_URL
    // Node(tsx)로 실행할 때
    ?? process.env.VITE_API_BASE_URL
    // 마지막 안전 fallback
    ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 인증 쓰면 유지, 아니면 지워도 됨
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터: JWT 자동 첨부 (세션/로컬 선택해 사용)
apiClient.interceptors.request.use((config) => {
  const token =
      (typeof window !== "undefined" && sessionStorage.getItem("accessToken"))
      || process.env.ACCESS_TOKEN; // 노드 실행 테스트용 (있다면)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 공통 처리
apiClient.interceptors.response.use(
    (res) => res, // 필요하면 res.data만 반환하도록 바꿔도 됨
    (err: AxiosError) => {
      if (err.response?.status === 401) {
        // 만료 처리 등
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("accessToken");
          // window.location.href = "/login";
        }
      }
      return Promise.reject(err);
    }
);

export default apiClient;
