import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Create axios instance
export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.code === "ECONNABORTED") {
      useToast().error("Yêu cầu hết thời gian chờ. Vui lòng thử lại.");
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Use apiError method for better handling
      useToast().error(data?.message || "Có lỗi xảy ra");

      // Special handling for 401 (redirect to login)
      if (status === 401) {
        // Use setTimeout to avoid blocking the current execution
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } else if (error.request) {
      // Network error
      useToast().error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
    } else {
      // Something else happened
      useToast().error("Có lỗi không xác định xảy ra");
    }

    return Promise.reject(error);
  }
);

export default api;
