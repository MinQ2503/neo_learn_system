import { Question } from '../../types';
import { INITIAL_QUESTIONS } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_questions';

export const questionService = {
  getAll: async (): Promise<Question[]> => {
    await delay(300);
    return getStorage<Question[]>(STORAGE_KEY, INITIAL_QUESTIONS);
  },

  create: async (q: Omit<Question, 'id'>): Promise<Question> => {
    await delay(400);
    const questions = getStorage<Question[]>(STORAGE_KEY, INITIAL_QUESTIONS);
    const newQ = { ...q, id: `q-${Date.now()}` };
    questions.push(newQ);
    setStorage(STORAGE_KEY, questions);
    return newQ;
  },

  update: async (id: string, data: Partial<Question>): Promise<Question> => {
    await delay(300);
    const questions = getStorage<Question[]>(STORAGE_KEY, INITIAL_QUESTIONS);
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Question not found');
    
    const updated = { ...questions[index], ...data };
    questions[index] = updated;
    setStorage(STORAGE_KEY, questions);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    let questions = getStorage<Question[]>(STORAGE_KEY, INITIAL_QUESTIONS);
    questions = questions.filter(q => q.id !== id);
    setStorage(STORAGE_KEY, questions);
  }
};
