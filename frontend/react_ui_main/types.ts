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
  email?: string;
  role: Role;
  avatarUrl?: string;
  studentId?: string; // For students
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

// --- New Types for Exam Management ---

export interface ProctorConfig {
  requireFaceAuth: boolean;      // Verify face before start
  continuousFaceAuth: boolean;   // Verify face during exam
  detectCheating: boolean;       // Master toggle for AI detection
  maxViolations: number;         // Threshold to auto-submit/block
  allowHeadphones: boolean;      // Specific rule
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
  
  // Management Fields
  assignedClassIds: string[];
  questionIds: string[];
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  proctorConfig: ProctorConfig;
}

// --- New Types for Class Management ---

export interface Lesson {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link';
  format: 'pdf' | 'docx' | 'xlsx' | 'mp4' | 'mp3' | 'url';
  url: string;
  dateAdded: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  subject: string;
  studentCount: number; // Can be derived from studentIds.length
  schedule: string;
  
  // New Management Fields
  studentIds: string[];
  lessons: Lesson[];
  assignments: Assignment[];
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Multiple Choice',
  ESSAY = 'Essay',
  TRUE_FALSE = 'True/False',
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ
  correctAnswer?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  score: number;
  grade: string;
  violations: Violation[];
  status: 'Completed' | 'Terminated' | 'Absent';
}

export interface ExamStatistics {
  examId: string;
  totalStudents: number;
  averageScore: number;
  violationRate: number; // Percentage 0-100
  scoreDistribution: { range: string; count: number }[];
  violationDistribution: { type: string; count: number }[];
}
