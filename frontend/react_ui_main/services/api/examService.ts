import { Exam } from '../../types';
import { INITIAL_EXAMS } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_exams';

export const examService = {
  getAll: async (): Promise<Exam[]> => {
    await delay(300);
    return getStorage<Exam[]>(STORAGE_KEY, INITIAL_EXAMS);
  },

  create: async (exam: Omit<Exam, 'id'>): Promise<Exam> => {
    await delay(500);
    const exams = getStorage<Exam[]>(STORAGE_KEY, INITIAL_EXAMS);
    const newExam = { ...exam, id: `exam-${Date.now()}` };
    exams.push(newExam);
    setStorage(STORAGE_KEY, exams);
    return newExam;
  },

  update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
    await delay(400);
    const exams = getStorage<Exam[]>(STORAGE_KEY, INITIAL_EXAMS);
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exam not found');
    
    const updated = { ...exams[index], ...data };
    exams[index] = updated;
    setStorage(STORAGE_KEY, exams);
    return updated;
  },

  // Helper: Assign or unassign class to exam
  toggleClassAssignment: async (examId: string, classId: string, assign: boolean): Promise<void> => {
    await delay(300);
    const exams = getStorage<Exam[]>(STORAGE_KEY, INITIAL_EXAMS);
    const index = exams.findIndex(e => e.id === examId);
    if (index === -1) return;
    
    let assigned = exams[index].assignedClassIds || [];
    if (assign && !assigned.includes(classId)) {
        assigned = [...assigned, classId];
    } else if (!assign) {
        assigned = assigned.filter(id => id !== classId);
    }
    
    exams[index] = { ...exams[index], assignedClassIds: assigned };
    setStorage(STORAGE_KEY, exams);
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    let exams = getStorage<Exam[]>(STORAGE_KEY, INITIAL_EXAMS);
    exams = exams.filter(e => e.id !== id);
    setStorage(STORAGE_KEY, exams);
  }
};
