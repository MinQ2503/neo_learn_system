/**
 * Auth Service
 * Ví dụ sử dụng API types với các auth endpoints
 */

import { get, post, isApiSuccess } from './base';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UploadAvatarResponse,
  LogoutResponse,
} from './types';

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      // If avatar is a File, use FormData
      if (data.avatar instanceof File) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        if (data.role) formData.append('role', data.role);
        formData.append('avatar', data.avatar);

        const response = await post<RegisterResponse['data']>('/auth/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response;
      }

      // Otherwise, send as JSON
      const response = await post<RegisterResponse['data']>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return response;
    } catch (error: any) {
      // Error is already formatted by interceptor
      throw error.response?.data || error;
    }
  },

  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await post<LoginResponse['data']>('/auth/login', credentials);
      
      // Store token if login successful
      if (isApiSuccess(response) && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user profile by user_id
   */
  getProfile: async (userId: number): Promise<ProfileResponse> => {
    try {
      const response = await get<ProfileResponse['data']>(`/auth/profile/${userId}`);
      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    userId: number,
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    try {
      const response = await post<null>(`/auth/change-password/${userId}`, data);
      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (userId: number, avatarFile: File): Promise<UploadAvatarResponse> => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await post<UploadAvatarResponse['data']>(
        `/auth/upload-avatar/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await post<LogoutResponse['data']>('/auth/logout');
      
      // Remove token on logout
      localStorage.removeItem('token');
      
      return response;
    } catch (error: any) {
      // Remove token even if API call fails
      localStorage.removeItem('token');
      throw error.response?.data || error;
    }
  },
};

