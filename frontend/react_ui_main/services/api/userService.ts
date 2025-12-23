
import { User, Role } from '../../types';
import { INITIAL_USERS } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_users';

export const userService = {
  getUsersByRole: async (role: Role): Promise<User[]> => {
    await delay(300);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    return users.filter(u => u.role === role);
  },

  getAll: async (): Promise<User[]> => {
    await delay(300);
    return getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
  },

  create: async (user: Omit<User, 'id'>): Promise<User> => {
    await delay(500);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    const newUser = { ...user, id: `u-${Date.now()}` };
    users.push(newUser);
    setStorage(STORAGE_KEY, users);
    return newUser;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(400);
    const users = getStorage<User[]>(STORAGE_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
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
