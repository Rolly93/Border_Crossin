/** @format */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export const getBaseUrl = () => import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
});

let isHandling401 = false;

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("jwt_token") ||
      localStorage.getItem("bootstrap_token") ||
      localStorage.getItem("token");


    if (
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== ""
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true;
      try {
        localStorage.removeItem("jwt_token");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/onetime"
        ) {
          window.location.href = "/login";
        }
      } finally {
        isHandling401 = false;
      }
      return Promise.reject(error);
    }

    const shouldRetry =
      !originalRequest._retry &&
      (!error.response ||
        (error.response.status >= 500 && error.response.status < 600)) &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        !error.response);

    if (shouldRetry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const delay = Math.min(
        1000 * 2 ** (originalRequest._retryCount || 0),
        10000,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

export const createApiClient = (): AxiosInstance => {
  return apiClient;
};

export const createEventSource = (endpoint: string): EventSource => {
  const token = localStorage.getItem("jwt_token");
  const baseUrl = getBaseUrl();

  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
  const fullUrl = `${baseUrl}${endpoint}${tokenQuery}`;
  return new EventSource(fullUrl);
};

export { apiClient };
