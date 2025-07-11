import axios from "axios";
import useAuthStore from "../store/authStore";
import { refreshToken } from "./authService";

// export const API_URL = import.meta.env.VITE_API_URL;

export const API_URL = "http://localhost:5000/api/";

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🔁 Add Authorization header to every request
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Refresh access token on 401 Unauthorized
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken(); // 👈 this updates Zustand store
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }
        return instance(originalRequest); // 🔁 Retry original request
      } catch (refreshErr) {
        useAuthStore.getState().logout(); // Clear tokens if refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

const handleRequest = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const get = (url, params) =>
  handleRequest(instance.get(url, { params }));

export const post = (url, data) => handleRequest(instance.post(url, data));

export const put = (url, data) => handleRequest(instance.put(url, data));

export const patch = (url, data) => handleRequest(instance.patch(url, data));

export const del = (url) => handleRequest(instance.delete(url));
