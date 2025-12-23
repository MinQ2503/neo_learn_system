import { ClassGroup } from '../../types';
import { INITIAL_CLASSES } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_classes';

export const classService = {
  getAll: async (): Promise<ClassGroup[]> => {
    await delay(300);
    return getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
  },

  // Get classes for a specific student ID
  getStudentClasses: async (studentId: string): Promise<ClassGroup[]> => {
    await delay(300);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    return classes.filter(c => c.studentIds && c.studentIds.includes(studentId));
  },

  create: async (cls: Omit<ClassGroup, 'id'>): Promise<ClassGroup> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const newClass = { ...cls, id: `c-${Date.now()}` };
    classes.push(newClass);
    setStorage(STORAGE_KEY, classes);
    return newClass;
  },

  update: async (id: string, data: Partial<ClassGroup>): Promise<ClassGroup> => {
    await delay(300);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Class not found');
    
    const updated = { ...classes[index], ...data };
    classes[index] = updated;
    setStorage(STORAGE_KEY, classes);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    let classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    classes = classes.filter(c => c.id !== id);
    setStorage(STORAGE_KEY, classes);
  }
};
