import axios, { AxiosInstance } from 'axios';

// Anti-cheating service URL (Python FastAPI)
// Có thể set trong .env: VITE_ANTI_CHEAT_URL=http://localhost:8000
export const ANTI_CHEAT_BASE_URL = import.meta.env.VITE_ANTI_CHEAT_URL || 'http://localhost:8000';

// Create axios instance for anti-cheating API
export const antiCheatClient: AxiosInstance = axios.create({
  baseURL: ANTI_CHEAT_BASE_URL,
  timeout: 30000, // 30 seconds timeout for image processing
  // Không set Content-Type ở đây, để axios tự động set khi dùng FormData
  withCredentials: false, // Phải false khi server dùng allow_origins=["*"]
});

// Detect cheating from image
export interface DetectProRequest {
  candidate_id: string;
  candidate_name: string;
  file: File;
}

export interface DetectProResponse {
  candidate_id: string;
  candidate_name: string;
  detect_result: {
    cheating: boolean;
    gaze?: string;
    person?: number;
    faces?: Array<{
      name?: string;
      confidence?: number;
    }>;
    cheat_mobilephone?: Array<{
      label: string;
      confidence: number;
    }>;
    cheat_headphone?: Array<{
      label: string;
      confidence: number;
    }>;
    cheating_reason?: string;
    cheating_image_path?: string;
  };
  execution_time: string;
}

export const antiCheatService = {
  /**
   * Detect cheating from image using /detect_pro endpoint
   * @param candidate_id - ID của thí sinh
   * @param candidate_name - Tên của thí sinh
   * @param file - File ảnh cần detect
   * @returns Response từ API
   */
  detectPro: async (
    candidate_id: string,
    candidate_name: string,
    file: File
  ): Promise<DetectProResponse> => {
    const formData = new FormData();
    formData.append('candidate_id', candidate_id);
    formData.append('candidate_name', candidate_name);
    formData.append('file', file);

    // Không set Content-Type header, để axios tự động set boundary cho multipart/form-data
    const response = await antiCheatClient.post<DetectProResponse>('/detect_pro', formData);

    return response.data;
  },
};

