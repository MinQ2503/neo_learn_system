import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from './types';

// Get BASE_URL from environment variables
// In Vite, environment variables must be prefixed with VITE_ to be accessible
export const BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || 'http://localhost:8080';

// API prefix - có thể thay đổi từ .env nếu cần
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

// Combine BASE_URL and API_PREFIX
const API_BASE_URL = `${BASE_URL}${API_PREFIX}`;

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional - for handling errors globally)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      console.error('Unauthorized access');
    }
    
    // Format error response to match ApiResponse structure
    if (error.response?.data) {
      // If backend already returns ApiResponse format, use it
      return Promise.reject(error);
    }
    
    // Otherwise, format it
    const formattedError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      error: error.response?.data?.error || error.message,
    };
    
    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: formattedError,
      },
    });
  }
);

// Export axios instance and types for use in services
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };

// HTTP method helpers - return ApiResponse format
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data;
};

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data;
};

export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data;
};

export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data;
};

// Helper functions to extract data from ApiResponse
export { extractApiData, isApiSuccess, isApiError } from './types';

// Simulates a generic API client with delay (keeping for backward compatibility)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get/set data from localStorage to persist changes during session
export const getStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

export const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};
