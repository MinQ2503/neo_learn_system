import { User, Role } from '../../types';
import { INITIAL_USERS } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_users';

export const studentService = {
  getAll: async (): Promise<User[]> => {
    await delay(300);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    return users.filter(u => u.role === Role.STUDENT);
  },

  create: async (student: Omit<User, 'id'>): Promise<User> => {
    await delay(500);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    const newUser = { ...student, id: `s-${Date.now()}`, role: Role.STUDENT };
    users.push(newUser);
    setStorage(STORAGE_KEY, users);
    return newUser;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(400);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Student not found');
    
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    setStorage(STORAGE_KEY, users);
    return updatedUser;
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    let users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    users = users.filter(u => u.id !== id);
    setStorage(STORAGE_KEY, users);
  }
};
