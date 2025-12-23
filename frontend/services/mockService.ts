
import { Role, User, Violation, ViolationType, Severity } from '../types';
import { INITIAL_STUDENTS_STATUS, INITIAL_EXAMS, INITIAL_USERS } from './mockData';
import { delay, getStorage, setStorage } from './api/base';

const USERS_STORAGE_KEY = 'neo_users_list';
const CURRENT_USER_KEY = 'neo_current_user';

export { INITIAL_EXAMS as MOCK_EXAMS };
export const MOCK_STUDENTS = INITIAL_STUDENTS_STATUS;

const getStoredUsers = (): User[] => {
    return getStorage<User[]>(USERS_STORAGE_KEY, INITIAL_USERS);
};

export const getRoleFromStorage = (): Role | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? (JSON.parse(user) as User).role : null;
};

export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem(CURRENT_USER_KEY);
  if (!userString) return null;
  
  // Lấy data mới nhất từ danh sách tổng
  const currentUser = JSON.parse(userString) as User;
  const allUsers = getStoredUsers();
  return allUsers.find(u => u.id === currentUser.id) || currentUser;
};

export const clearRole = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('neo_role');
};

export const mockLogin = async (email: string, password: string): Promise<User> => {
    await delay(800);
    
    // Kiểm tra tài khoản Admin cố định trước
    if (email === 'admin' && password === 'Demo@1234') {
        const adminUser: User = {
            id: 'admin-id',
            name: 'System Administrator',
            email: 'admin',
            role: Role.ADMIN,
            avatarUrl: 'https://picsum.photos/200/200?random=admin'
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        return adminUser;
    }

    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Thông tin đăng nhập không chính xác hoặc email không tồn tại.');
    
    // Ở bản mock, chúng ta chấp nhận mọi mật khẩu cho các tài khoản user khác ngoại trừ admin
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
};

export const mockRegister = async (userData: Omit<User, 'id'>): Promise<User> => {
    await delay(1000);
    const users = getStoredUsers();
    if (users.some(u => u.email === userData.email)) throw new Error('Email đã được đăng ký.');
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`
    };
    users.push(newUser);
    setStorage(USERS_STORAGE_KEY, users);
    return newUser;
};

export const updateProfile = async (id: string, data: Partial<User>): Promise<User> => {
    await delay(800);
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    
    users[idx] = { ...users[idx], ...data };
    setStorage(USERS_STORAGE_KEY, users);
    
    // Cập nhật session hiện tại
    const current = getCurrentUser();
    if (current && current.id === id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[idx]));
    }
    return users[idx];
};

// --- PROCTORING HEARTBEAT ---
export const reportProctorHeartbeat = async (examId: string, studentId: string, imageBase64: string): Promise<{ violation?: Violation }> => {
    await delay(300); // Network latency
    
    // Giả lập logic AI trên server: 10% cơ hội phát hiện vi phạm mỗi 5s
    if (Math.random() > 0.90) {
        const types = Object.values(ViolationType);
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            violation: {
                id: `v-${Date.now()}`,
                studentId,
                type,
                severity: Severity.HIGH,
                timestamp: Date.now(),
                confidence: 0.85 + Math.random() * 0.1,
                imageUrl: imageBase64, // Lưu ảnh thực tế lúc đó
                reason: `Hệ thống phát hiện hành vi: ${type}`,
                resolved: false
            }
        };
    }
    
    return {};
};

/**
 * Generates a mock violation for simulation purposes in the Teacher Dashboard.
 * @param studentId The ID of the student to generate the violation for.
 * @returns A Violation object with random properties.
 */
export const generateMockViolation = (studentId: string): Violation => {
  const types = Object.values(ViolationType);
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `v-mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentId,
    type,
    severity: Math.random() > 0.5 ? Severity.HIGH : Severity.MEDIUM,
    timestamp: Date.now(),
    confidence: 0.75 + Math.random() * 0.2,
    reason: `Hệ thống phát hiện hành vi: ${type}`,
    resolved: false
  };
};

export const mockChangePassword = async (email: string, newPass: string): Promise<void> => {
    await delay(1000);
    return;
};
