
import { StudentStatus, ViolationType, Severity, Exam, User, Role, ClassGroup, Question, QuestionType, ExamResult, AssignmentSubmission } from '../types';

// Storage Keys
const SUBMISSIONS_KEY = 'neo_submissions';

// Helper to init storage if empty
const initMockSubmissions = () => {
  const existing = localStorage.getItem(SUBMISSIONS_KEY);
  if (!existing) {
    const mockSubs: AssignmentSubmission[] = [
      {
        id: 'sub-1',
        assignmentId: 'a1',
        studentId: 's1',
        studentName: 'Alice Johnson',
        submittedAt: new Date().toISOString(),
        content: 'Chào thầy, đây là bài làm tuần 4 của em. Em đã hoàn thành 10 bài tập trong sách giáo khoa.',
        fileUrls: ['#'],
        status: 'submitted'
      },
      {
        id: 'sub-2',
        assignmentId: 'a1',
        studentId: 's2',
        studentName: 'Bob Smith',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        content: 'Bài làm của Bob. Có một số câu em chưa rõ cách giải tích phân.',
        fileUrls: ['#', '#'],
        status: 'graded',
        grade: 8.5,
        feedback: 'Bài làm tốt, trình bày sạch sẽ. Cần chú ý hơn phần nguyên hàm.',
        gradedBy: 'Dr. Sarah Connor'
      }
    ];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(mockSubs));
  }
};

initMockSubmissions();

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-101',
    title: 'Advanced Calculus Final',
    subject: 'Mathematics',
    durationMinutes: 90,
    startTime: new Date().toISOString(),
    status: 'live',
    assignedClassIds: ['c1'],
    questionIds: ['q1'],
    maxAttempts: 1,
    shuffleQuestions: true,
    showResults: false,
    proctorConfig: {
        requireFaceAuth: true,
        continuousFaceAuth: true,
        detectCheating: true,
        maxViolations: 3,
        allowHeadphones: false
    }
  },
  {
    id: 'exam-102',
    title: 'Intro to Physics',
    subject: 'Physics',
    durationMinutes: 60,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'upcoming',
    assignedClassIds: ['c2'],
    questionIds: ['q2'],
    maxAttempts: 2,
    shuffleQuestions: false,
    showResults: true,
    proctorConfig: {
        requireFaceAuth: true,
        continuousFaceAuth: false,
        detectCheating: true,
        maxViolations: 5,
        allowHeadphones: true
    }
  },
  {
    id: 'exam-099',
    title: 'Linear Algebra Midterm',
    subject: 'Mathematics',
    durationMinutes: 45,
    startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'completed',
    assignedClassIds: ['c1'],
    questionIds: ['q1'],
    maxAttempts: 1,
    shuffleQuestions: true,
    showResults: true,
    proctorConfig: {
        requireFaceAuth: true,
        continuousFaceAuth: true,
        detectCheating: true,
        maxViolations: 3,
        allowHeadphones: false
    }
  },
  {
    id: 'exam-098',
    title: 'History of Art',
    subject: 'History',
    durationMinutes: 60,
    startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'completed',
    assignedClassIds: [],
    questionIds: [],
    maxAttempts: 1,
    shuffleQuestions: false,
    showResults: true,
    proctorConfig: {
        requireFaceAuth: false,
        continuousFaceAuth: false,
        detectCheating: false,
        maxViolations: 10,
        allowHeadphones: true
    }
  }
];

export const INITIAL_STUDENTS_STATUS: StudentStatus[] = [
  { id: 's1', name: 'Alice Johnson', status: 'active', lastPing: Date.now(), riskScore: 12 },
  { id: 's2', name: 'Bob Smith', status: 'flagged', lastPing: Date.now(), riskScore: 85, currentViolation: { id: 'v1', studentId: 's2', type: ViolationType.MOBILE_DETECTED, severity: Severity.HIGH, timestamp: Date.now(), confidence: 0.92, resolved: false } },
  { id: 's3', name: 'Charlie Davis', status: 'active', lastPing: Date.now(), riskScore: 5 },
  { id: 's4', name: 'Diana Evans', status: 'idle', lastPing: Date.now() - 5000, riskScore: 25 },
  { id: 's5', name: 'Ethan Hunt', status: 'active', lastPing: Date.now(), riskScore: 0 },
];

// CRUD Data
export const INITIAL_USERS: User[] = [
  { id: 'admin-id', name: 'System Administrator', email: 'admin', role: Role.ADMIN },
  { id: 's1', name: 'Alice Johnson', email: 'alice@school.edu', role: Role.STUDENT, studentId: '2023001', avatarUrl: 'https://picsum.photos/200/200?random=s1' },
  { id: 's2', name: 'Bob Smith', email: 'bob@school.edu', role: Role.STUDENT, studentId: '2023002', avatarUrl: 'https://picsum.photos/200/200?random=s2' },
  { id: 's3', name: 'Charlie Davis', email: 'charlie@school.edu', role: Role.STUDENT, studentId: '2023003', avatarUrl: 'https://picsum.photos/200/200?random=s3' },
  { id: 't1', name: 'Dr. Sarah Connor', email: 'sarah@school.edu', role: Role.TEACHER, avatarUrl: 'https://picsum.photos/200/200?random=t1' },
];

export const INITIAL_CLASSES: ClassGroup[] = [
  { 
    id: 'c1', 
    name: 'Math 101 - A', 
    subject: 'Mathematics', 
    studentCount: 34, 
    schedule: 'Mon/Wed 10:00 AM',
    teacherName: 'Dr. Sarah Connor',
    studentIds: ['s1', 's2', 's3'],
    lessons: [
        { 
          id: 'l1', 
          title: 'Derivatives Intro', 
          description: 'Cơ bản về đạo hàm và ứng dụng.',
          content: 'Trong bài này chúng ta sẽ tìm hiểu về định nghĩa đạo hàm thông qua giới hạn...',
          type: 'document', 
          format: 'pdf', 
          url: '#', 
          dateAdded: new Date().toISOString() 
        },
        { 
          id: 'l2', 
          title: 'Lecture 1 Recording', 
          description: 'Video ghi lại buổi học đầu tiên.',
          content: 'Nội dung video bao gồm phần giới thiệu môn học và chương 1.',
          type: 'video', 
          format: 'mp4', 
          url: '#', 
          dateAdded: new Date().toISOString() 
        }
    ],
    assignments: [
        { 
          id: 'a1', 
          title: 'Problem Set 1', 
          description: 'Complete problems 1-10 on page 24.', 
          startDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10) 
        }
    ]
  },
  { 
    id: 'c2', 
    name: 'Physics 202 - B', 
    subject: 'Physics', 
    studentCount: 28, 
    schedule: 'Tue/Thu 02:00 PM',
    teacherName: 'Dr. Sarah Connor',
    studentIds: ['s4', 's5'],
    lessons: [],
    assignments: []
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  { id: 'q1', text: 'What is the derivative of x^2?', type: QuestionType.MULTIPLE_CHOICE, options: ['x', '2x', 'x^2', '2'], correctAnswer: ['2x'], difficulty: 'Easy', tags: ['Calculus'], creatorName: 'Dr. Sarah Connor' },
  { id: 'q2', text: 'Explain the theory of relativity.', type: QuestionType.ESSAY, difficulty: 'Hard', tags: ['Physics'], creatorName: 'Dr. Sarah Connor' },
  { id: 'q3', text: 'The Earth is flat.', type: QuestionType.TRUE_FALSE, options: ['True', 'False'], correctAnswer: ['False'], difficulty: 'Easy', tags: ['Geography'], creatorName: 'System Admin' },
  { id: 'q4', text: 'Solve for x: 2x + 5 = 15', type: QuestionType.MULTIPLE_CHOICE, options: ['2', '5', '10', '0'], correctAnswer: ['5'], difficulty: 'Easy', tags: ['Algebra'], creatorName: 'System Admin' },
];

// Mock Results for Reports
export const MOCK_EXAM_RESULTS: ExamResult[] = [
    { 
        studentId: 's1', studentName: 'Alice Johnson', score: 95, grade: 'A', status: 'Completed', violations: [] 
    },
    { 
        studentId: 's2', studentName: 'Bob Smith', score: 45, grade: 'F', status: 'Terminated', 
        violations: [
            { id: 'v1', studentId: 's2', type: ViolationType.MOBILE_DETECTED, severity: Severity.HIGH, timestamp: Date.now() - 100000, confidence: 0.98, resolved: false, imageUrl: 'https://picsum.photos/200/300' },
            { id: 'v2', studentId: 's2', type: ViolationType.GAZE_AWAY, severity: Severity.LOW, timestamp: Date.now() - 200000, confidence: 0.85, resolved: true }
        ] 
    },
    { 
        studentId: 's3', studentName: 'Charlie Davis', score: 78, grade: 'B', status: 'Completed', violations: [] 
    },
    { 
        studentId: 's4', studentName: 'Diana Evans', score: 82, grade: 'B', status: 'Completed', 
        violations: [
            { id: 'v3', studentId: 's4', type: ViolationType.HEADPHONES, severity: Severity.MEDIUM, timestamp: Date.now() - 150000, confidence: 0.91, resolved: false, imageUrl: 'https://picsum.photos/200/301' }
        ] 
    },
    { 
        studentId: 's5', studentName: 'Ethan Hunt', score: 88, grade: 'A', status: 'Completed', violations: [] 
    },
    { 
        studentId: 's6', studentName: 'Fiona Gallagher', score: 65, grade: 'D', status: 'Completed', violations: [] 
    },
    { 
        studentId: 's7', studentName: 'George Martin', score: 92, grade: 'A', status: 'Completed', violations: [] 
    },
];
