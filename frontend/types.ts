
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
  studentId?: string; 
  bio?: string;
  birthday?: string;
  phone?: string;
}

export interface Violation {
  id: string;
  studentId: string;
  type: ViolationType;
  severity: Severity;
  timestamp: number;
  confidence: number;
  imageUrl?: string;
  reason?: string;
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

export interface ProctorConfig {
  requireFaceAuth: boolean;
  continuousFaceAuth: boolean;
  detectCheating: boolean;
  maxViolations: number;
  allowHeadphones: boolean;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
  assignedClassIds: string[];
  questionIds: string[];
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  proctorConfig: ProctorConfig;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'document' | 'video' | 'audio' | 'link';
  format: 'pdf' | 'docx' | 'xlsx' | 'mp4' | 'mp3' | 'url';
  url: string;
  dateAdded: string;
  teacherName?: string; // For Admin search
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  classId?: string;
  teacherName?: string; // For Admin search
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt?: string;
  content?: string;
  fileUrls?: string[];
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface ClassGroup {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  schedule: string;
  studentIds: string[];
  lessons: Lesson[];
  assignments: Assignment[];
  teacherName?: string; // For Admin search
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
  options?: string[];
  correctAnswer?: string | string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  creatorName?: string; // For Admin search
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
  violationRate: number;
  scoreDistribution: { range: string; count: number }[];
  violationDistribution: { type: string; count: number }[];
}
