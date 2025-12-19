/**
 * API Response Types
 * Định nghĩa kiểu dữ liệu trả về từ backend API
 */

// Generic API Response - cấu trúc chung cho tất cả API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Success Response - khi API thành công
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// Error Response - khi API thất bại
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// ==================== AUTH API TYPES ====================

// Register Request/Response
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  avatar?: File; // For form-data upload
}

export interface RegisterResponseData {
  id: number;
  name: string;
  email: string;
  profile: {
    bio?: string;
    phone?: string;
    birth_day?: string;
    avatar?: string;
  };
  created_at: string;
  updatedAt: string;
}

export type RegisterResponse = ApiResponse<RegisterResponseData>;

// Login Request/Response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile?: {
      bio?: string;
      phone?: string;
      birth_day?: string;
      avatar?: string;
    };
  };
}

export type LoginResponse = ApiResponse<LoginResponseData>;

// Profile Response
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  profile?: {
    bio?: string;
    phone?: string;
    birth_day?: string;
    avatar?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export type ProfileResponse = ApiResponse<ProfileData>;

// Change Password Request/Response
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export type ChangePasswordResponse = ApiResponse<null>;

// Upload Avatar Response
export interface UploadAvatarResponseData {
  avatar: string;
}

export type UploadAvatarResponse = ApiResponse<UploadAvatarResponseData>;

// Logout Response
export type LogoutResponse = ApiResponse<ProfileData>;

// ==================== HELPER TYPES ====================

// Type guard để kiểm tra response thành công
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true && response.data !== undefined;
}

// Type guard để kiểm tra response lỗi
export function isApiError(
  response: ApiResponse<any>
): response is ApiErrorResponse {
  return response.success === false;
}

// Extract data từ response (type-safe)
export function extractApiData<T>(response: ApiResponse<T>): T | null {
  return isApiSuccess(response) ? response.data : null;
}

