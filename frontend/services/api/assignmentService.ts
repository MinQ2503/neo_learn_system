
import { Assignment, ClassGroup, AssignmentSubmission } from '../../types';
import { INITIAL_CLASSES, INITIAL_USERS } from '../mockData';
import { delay, getStorage, setStorage } from './base';

const STORAGE_KEY = 'neo_classes';
const SUBMISSIONS_KEY = 'neo_submissions';

export const assignmentService = {
  // Get all assignments from all classes
  getAllGlobal: async (): Promise<Assignment[]> => {
    await delay(300);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const allAssignments: Assignment[] = [];
    classes.forEach(c => {
      if (c.assignments) {
        c.assignments.forEach(a => {
          allAssignments.push({ 
            ...a, 
            teacherName: c.teacherName,
            classId: c.id 
          });
        });
      }
    });
    return allAssignments;
  },

  createGlobal: async (classId: string, assignment: Omit<Assignment, 'id'>): Promise<Assignment> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) throw new Error('Class not found');
    
    const newAssignment: Assignment = {
      ...assignment,
      id: `a-${Date.now()}`,
      classId: classId
    };
    
    classes[index].assignments = [...(classes[index].assignments || []), newAssignment];
    setStorage(STORAGE_KEY, classes);
    return newAssignment;
  },

  updateGlobal: async (assignmentId: string, data: Partial<Assignment>): Promise<void> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    let found = false;
    
    for (let i = 0; i < classes.length; i++) {
      const aIndex = classes[i].assignments?.findIndex(a => a.id === assignmentId);
      if (aIndex !== undefined && aIndex !== -1) {
        classes[i].assignments[aIndex] = { ...classes[i].assignments[aIndex], ...data };
        found = true;
        break;
      }
    }
    
    if (!found) throw new Error('Assignment not found');
    setStorage(STORAGE_KEY, classes);
  },

  deleteGlobal: async (assignmentId: string): Promise<void> => {
    await delay(400);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    
    classes.forEach(c => {
      if (c.assignments) {
        c.assignments = c.assignments.filter(a => a.id !== assignmentId);
      }
    });
    
    setStorage(STORAGE_KEY, classes);
  },

  // Submissions Logic
  getSubmissions: async (assignmentId: string): Promise<AssignmentSubmission[]> => {
    await delay(400);
    const submissions = getStorage<AssignmentSubmission[]>(SUBMISSIONS_KEY, []);
    const classes = getStorage<ClassGroup[]>(STORAGE_KEY, INITIAL_CLASSES);
    
    // Tìm lớp chứa bài tập này để biết danh sách học sinh
    let targetClass: ClassGroup | undefined;
    for (const c of classes) {
      if (c.assignments?.some(a => a.id === assignmentId)) {
        targetClass = c;
        break;
      }
    }

    if (!targetClass) return [];

    // Map sinh viên với bài nộp (nếu có)
    const allUsers = getStorage<any[]>('neo_users', INITIAL_USERS);
    const classStudents = allUsers.filter(u => targetClass?.studentIds?.includes(u.id));

    return classStudents.map(student => {
      const sub = submissions.find(s => s.assignmentId === assignmentId && s.studentId === student.id);
      if (sub) return sub;
      
      // Nếu chưa nộp, trả về object trạng thái pending
      return {
        id: `pending-${assignmentId}-${student.id}`,
        assignmentId,
        studentId: student.id,
        studentName: student.name,
        status: 'pending'
      };
    });
  },

  gradeSubmission: async (submissionId: string, data: { grade: number, feedback: string, gradedBy: string }): Promise<void> => {
    await delay(500);
    const submissions = getStorage<AssignmentSubmission[]>(SUBMISSIONS_KEY, []);
    const index = submissions.findIndex(s => s.id === submissionId);
    
    if (index === -1) {
      // Trường hợp học sinh chưa nộp mà vẫn muốn lưu grade (giả lập)
      // Trong thực tế cần logic khác, ở đây ta giả sử chỉ chấm bài đã nộp
      throw new Error('Học sinh chưa nộp bài hoặc không tìm thấy bản ghi nộp bài.');
    }

    submissions[index] = {
      ...submissions[index],
      ...data,
      status: 'graded'
    };
    
    setStorage(SUBMISSIONS_KEY, submissions);
  }
};
