import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true, // send httpOnly cookies
});

let isRefreshing = false;
let queue: Array<() => void> = [];

function processQueue() {
  queue.forEach((resolve) => resolve());
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        return api(original);
      }

      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        processQueue();
        return api(original);
      } catch (e) {
        processQueue();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);