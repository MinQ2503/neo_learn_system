
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileEdit from './pages/ProfileEdit';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentClassDetail from './pages/student/StudentClassDetail';
import StudentExamResult from './pages/student/StudentExamResult';
import LessonDetail from './pages/student/LessonDetail';
import AssignmentDetail from './pages/student/AssignmentDetail';
import ExamRoom from './pages/ExamRoom';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherManagerAdmin from './pages/admin/TeacherManager';
import StudentManagerAdmin from './pages/admin/StudentManager';
import CourseManagerAdmin from './pages/admin/CourseManager';
import CourseDetailAdmin from './pages/admin/CourseDetail';
import LessonManagerAdmin from './pages/admin/LessonManager';
import AssignmentManagerAdmin from './pages/admin/AssignmentManager';
import ExamManagerAdmin from './pages/admin/ExamManager';
import QuestionBankAdmin from './pages/admin/QuestionBank';
import AdminReports from './pages/admin/AdminReports';
import StudentViolationHistory from './pages/admin/StudentViolationHistory';
import { Role } from './types';
import { getRoleFromStorage } from './services/mockService';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = getRoleFromStorage();
    if (role) {
      setUserRole(role);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (role: Role) => {
    setUserRole(role);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
            !userRole ? <Login onLogin={handleLogin} /> : <Navigate to={`/${userRole.toLowerCase()}`} />
        } />
        <Route path="/register" element={!userRole ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route path="/profile-edit" element={userRole ? <ProfileEdit /> : <Navigate to="/" />} />
        <Route path="/change-password" element={userRole ? <ChangePassword /> : <Navigate to="/" />} />

        {/* Student Routes */}
        <Route path="/student" element={userRole === Role.STUDENT ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/student/courses" element={userRole === Role.STUDENT ? <StudentClasses /> : <Navigate to="/" />} />
        <Route path="/student/courses/:classId" element={userRole === Role.STUDENT ? <StudentClassDetail /> : <Navigate to="/" />} />
        <Route path="/student/lesson/:lessonId" element={userRole === Role.STUDENT ? <LessonDetail /> : <Navigate to="/" />} />
        <Route path="/student/assignment/:assignmentId" element={userRole === Role.STUDENT ? <AssignmentDetail /> : <Navigate to="/" />} />
        <Route path="/student/exam-result/:examId" element={userRole === Role.STUDENT ? <StudentExamResult /> : <Navigate to="/" />} />
        <Route path="/exam/:examId" element={userRole === Role.STUDENT ? <ExamRoom /> : <Navigate to="/" />} />

        {/* Teacher Routes - Shared management components with Admin */}
        <Route path="/teacher" element={userRole === Role.TEACHER ? <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/teacher/students" element={userRole === Role.TEACHER ? <StudentManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/courses" element={userRole === Role.TEACHER ? <CourseManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/courses/:courseId" element={userRole === Role.TEACHER ? <CourseDetailAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/lessons" element={userRole === Role.TEACHER ? <LessonManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/assignments" element={userRole === Role.TEACHER ? <AssignmentManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/exams" element={userRole === Role.TEACHER ? <ExamManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/questions" element={userRole === Role.TEACHER ? <QuestionBankAdmin /> : <Navigate to="/" />} />
        <Route path="/teacher/reports" element={userRole === Role.TEACHER ? <AdminReports /> : <Navigate to="/" />} />
        <Route path="/teacher/reports/student/:studentId" element={userRole === Role.TEACHER ? <StudentViolationHistory /> : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userRole === Role.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/teachers" element={userRole === Role.ADMIN ? <TeacherManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/students" element={userRole === Role.ADMIN ? <StudentManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/courses" element={userRole === Role.ADMIN ? <CourseManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/courses/:courseId" element={userRole === Role.ADMIN ? <CourseDetailAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/lessons" element={userRole === Role.ADMIN ? <LessonManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/assignments" element={userRole === Role.ADMIN ? <AssignmentManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/exams" element={userRole === Role.ADMIN ? <ExamManagerAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/questions" element={userRole === Role.ADMIN ? <QuestionBankAdmin /> : <Navigate to="/" />} />
        <Route path="/admin/reports" element={userRole === Role.ADMIN ? <AdminReports /> : <Navigate to="/" />} />
        <Route path="/admin/reports/student/:studentId" element={userRole === Role.ADMIN ? <StudentViolationHistory /> : <Navigate to="/" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
