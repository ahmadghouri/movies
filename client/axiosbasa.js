import axios from "axios";

const axiosbase = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 15000,
});

// Global response interceptor — normalize error messages
axiosbase.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default axiosbase;
