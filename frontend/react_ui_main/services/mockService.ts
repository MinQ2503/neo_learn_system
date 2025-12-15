import { StudentStatus, Violation, ViolationType, Severity, Exam, Role } from '../types';

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-101',
    title: 'Advanced Calculus Final',
    subject: 'Mathematics',
    durationMinutes: 90,
    startTime: new Date().toISOString(),
    status: 'live',
  },
  {
    id: 'exam-102',
    title: 'Intro to Physics',
    subject: 'Physics',
    durationMinutes: 60,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'upcoming',
  }
];

export const MOCK_STUDENTS: StudentStatus[] = [
  { id: 's1', name: 'Alice Johnson', status: 'active', lastPing: Date.now(), riskScore: 12 },
  { id: 's2', name: 'Bob Smith', status: 'flagged', lastPing: Date.now(), riskScore: 85, currentViolation: { id: 'v1', studentId: 's2', type: ViolationType.MOBILE_DETECTED, severity: Severity.HIGH, timestamp: Date.now(), confidence: 0.92, resolved: false } },
  { id: 's3', name: 'Charlie Davis', status: 'active', lastPing: Date.now(), riskScore: 5 },
  { id: 's4', name: 'Diana Evans', status: 'idle', lastPing: Date.now() - 5000, riskScore: 25 },
  { id: 's5', name: 'Ethan Hunt', status: 'active', lastPing: Date.now(), riskScore: 0 },
];

export const MOCK_VIOLATIONS_HISTORY: Violation[] = [
  { id: 'vh1', studentId: 's2', type: ViolationType.GAZE_AWAY, severity: Severity.LOW, timestamp: Date.now() - 300000, confidence: 0.75, resolved: true },
  { id: 'vh2', studentId: 's2', type: ViolationType.MOBILE_DETECTED, severity: Severity.HIGH, timestamp: Date.now() - 60000, confidence: 0.95, resolved: false },
  { id: 'vh3', studentId: 's4', type: ViolationType.HEADPHONES, severity: Severity.MEDIUM, timestamp: Date.now() - 1200000, confidence: 0.88, resolved: true },
];

export const generateMockViolation = (studentId: string): Violation => {
  const types = Object.values(ViolationType);
  const type = types[Math.floor(Math.random() * types.length)];
  let severity = Severity.LOW;
  if (type === ViolationType.MOBILE_DETECTED || type === ViolationType.MULTI_FACE) severity = Severity.HIGH;
  else if (type === ViolationType.HEADPHONES) severity = Severity.MEDIUM;

  return {
    id: `v-${Date.now()}`,
    studentId,
    type,
    severity,
    timestamp: Date.now(),
    confidence: 0.7 + Math.random() * 0.25, // 0.7 - 0.95
    resolved: false,
  };
};

export const getRoleFromStorage = (): Role | null => {
  return localStorage.getItem('neo_role') as Role | null;
};

export const setRoleToStorage = (role: Role) => {
  localStorage.setItem('neo_role', role);
};

export const clearRole = () => {
  localStorage.removeItem('neo_role');
};
