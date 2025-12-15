export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum ViolationType {
  FACE_MISMATCH = 'Face Mismatch',
  MULTI_FACE = 'Multiple Faces',
  MOBILE_DETECTED = 'Mobile Device',
  GAZE_AWAY = 'Gaze Away',
  HEADPHONES = 'Headphones',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface Violation {
  id: string;
  studentId: string;
  type: ViolationType;
  severity: Severity;
  timestamp: number;
  confidence: number;
  imageUrl?: string;
  resolved: boolean;
}

export interface StudentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'flagged' | 'offline';
  lastPing: number;
  riskScore: number;
  currentViolation?: Violation;
  gazeVector?: { x: number; y: number };
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
}
