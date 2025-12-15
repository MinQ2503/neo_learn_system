import { Role, Violation } from '../types';
import { INITIAL_STUDENTS_STATUS, INITIAL_EXAMS } from './mockData';
import { delay, getStorage, setStorage } from './api/base';

// Keeping these for the Dashboard monitoring (ReadOnly mainly)
export { INITIAL_EXAMS as MOCK_EXAMS };
export const MOCK_STUDENTS = INITIAL_STUDENTS_STATUS;

// Mock Violation Generator
// Removed incorrect re-export from mockData

// Generate random violations logic (Moved inline in dashboard or kept here if needed)
export const generateMockViolation = (studentId: string): Violation => {
    // ... logic same as before, imported from old file if needed, 
    // but for brevity we will use the one in component or simple logic
    return {
        id: `v-${Date.now()}`,
        studentId,
        type: 'Mobile Device' as any,
        severity: 'HIGH' as any,
        timestamp: Date.now(),
        confidence: 0.95,
        resolved: false
    }
};

// Auth Services
export const getRoleFromStorage = (): Role | null => {
  return localStorage.getItem('neo_role') as Role | null;
};

export const setRoleToStorage = (role: Role) => {
  localStorage.setItem('neo_role', role);
};

export const clearRole = () => {
  localStorage.removeItem('neo_role');
};