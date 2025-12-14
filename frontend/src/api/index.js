import axios from "axios";
import { ElMessage } from "element-plus";

const apiClient = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          ElMessage.error("Bạn không có quyền truy cập");
          break;
        case 404:
          ElMessage.error("Không tìm thấy tài nguyên");
          break;
        case 500:
          ElMessage.error("Lỗi server");
          break;
        default:
          ElMessage.error(error.response.data?.message || "Có lỗi xảy ra");
      }
    } else {
      ElMessage.error("Không thể kết nối đến server");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
