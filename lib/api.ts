import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Refresh-token interceptor ──────────────────────────────────────────
// Handles 401 responses by attempting a single token refresh, then retrying
// the original request. Uses a queue to avoid multiple concurrent refreshes.

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

function processQueue(error: unknown | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh auth endpoints themselves (prevents infinite loop)
    const url = originalRequest?.url ?? "";
    if (
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    // Don't retry the same request more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      processQueue(null);
      // Retry the original request with the new cookies
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);