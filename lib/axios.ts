import axios from "axios";
import { toast } from "sonner";

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
      toast.error("Yêu cầu hết thời gian chờ. Vui lòng thử lại.");
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          toast.error(data.message || "Dữ liệu không hợp lệ");
          break;
        case 401:
          toast.error("Phiên đăng nhập đã hết hạn");
          window.location.href = "/login";
        case 403:
          toast.error("Bạn không có quyền thực hiện hành động này");
          break;
        case 404:
          toast.error("Không tìm thấy dữ liệu");
          break;
        case 429:
          toast.error("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
          break;
        case 500:
          toast.error("Lỗi server nội bộ. Vui lòng thử lại sau.");
          break;
        default:
          toast.error(data.message || "Có lỗi xảy ra");
      }
    } else if (error.request) {
      // Network error
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
    } else {
      // Something else happened
      toast.error("Có lỗi không xác định xảy ra");
    }

    return Promise.reject(error);
  }
);

export default api;
