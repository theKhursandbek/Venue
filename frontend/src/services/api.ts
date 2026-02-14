import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { APIError } from "@/types";
import { useAuthStore } from "@/store/authStore";

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Language header
  const lang = localStorage.getItem("language") || "ru";
  config.headers["Accept-Language"] = lang;

  return config;
});

// Response interceptor — handle 401 & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/auth/refresh/", {
            refresh: refreshToken,
          });
          useAuthStore.getState().setTokens(data.access, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
