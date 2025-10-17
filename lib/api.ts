import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("Request:", {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
      cookies: document.cookie,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // Try to refresh token
//       try {
//         // await api.post("/auth/refresh");
//         // await api.get("auth/me")
//         // Retry the original request
//         // return api(error.config);
//       } catch (refreshError) {
//         toast.error("Session expired. Please log in again.");
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );