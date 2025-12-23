
import { Lesson, ClassGroup } from '../../types';
import { INITIAL_CLASSES } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_classes';

export const lessonService = {
  // Global search for lessons across all classes
  getAllGlobal: async (): Promise<Lesson[]> => {
    await delay(300);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const allLessons: Lesson[] = [];
    classes.forEach(c => {
      if (c.lessons) {
        c.lessons.forEach(l => {
          allLessons.push({ ...l, teacherName: c.teacherName });
        });
      }
    });
    return allLessons;
  },

  createGlobal: async (classId: string, lesson: Omit<Lesson, 'id' | 'dateAdded'>): Promise<Lesson> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) throw new Error('Class not found');
    
    const newLesson: Lesson = {
      ...lesson,
      id: `l-${Date.now()}`,
      dateAdded: new Date().toISOString()
    };
    
    classes[index].lessons = [...(classes[index].lessons || []), newLesson];
    setStorage(STORAGE_KEY, classes);
    return newLesson;
  },

  updateGlobal: async (lessonId: string, data: Partial<Lesson>): Promise<void> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    let found = false;
    
    for (let i = 0; i < classes.length; i++) {
      const lIndex = classes[i].lessons?.findIndex(l => l.id === lessonId);
      if (lIndex !== undefined && lIndex !== -1) {
        classes[i].lessons[lIndex] = { ...classes[i].lessons[lIndex], ...data };
        found = true;
        break;
      }
    }
    
    if (!found) throw new Error('Lesson not found');
    setStorage(STORAGE_KEY, classes);
  },

  deleteGlobal: async (lessonId: string): Promise<void> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    
    classes.forEach(c => {
      if (c.lessons) {
        c.lessons = c.lessons.filter(l => l.id !== lessonId);
      }
    });
    
    setStorage(STORAGE_KEY, classes);
  }
};
