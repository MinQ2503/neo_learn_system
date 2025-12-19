import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentClassDetail from './pages/student/StudentClassDetail';
import StudentExamResult from './pages/student/StudentExamResult';
import ExamRoom from './pages/ExamRoom';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentManager from './pages/teacher/StudentManager';
import ClassManager from './pages/teacher/ClassManager';
import ClassDetail from './pages/teacher/ClassDetail';
import QuestionBank from './pages/teacher/QuestionBank';
import ExamManager from './pages/teacher/ExamManager';
import TeacherReports from './pages/teacher/TeacherReports';
import ExamReportDetail from './pages/teacher/ExamReportDetail';
import AdminDashboard from './pages/AdminDashboard';
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
        
        <Route path="/register" element={
            !userRole ? <Register /> : <Navigate to={`/${userRole.toLowerCase()}`} />
        } />
        
        {/* Student Routes */}
        <Route path="/student" element={userRole === Role.STUDENT ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/student/classes" element={userRole === Role.STUDENT ? <StudentClasses /> : <Navigate to="/" />} />
        <Route path="/student/classes/:classId" element={userRole === Role.STUDENT ? <StudentClassDetail /> : <Navigate to="/" />} />
        <Route path="/student/exam-result/:examId" element={userRole === Role.STUDENT ? <StudentExamResult /> : <Navigate to="/" />} />
        <Route path="/exam/:examId" element={userRole === Role.STUDENT ? <ExamRoom /> : <Navigate to="/" />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={userRole === Role.TEACHER ? <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/teacher/students" element={userRole === Role.TEACHER ? <StudentManager /> : <Navigate to="/" />} />
        <Route path="/teacher/classes" element={userRole === Role.TEACHER ? <ClassManager /> : <Navigate to="/" />} />
        <Route path="/teacher/classes/:classId" element={userRole === Role.TEACHER ? <ClassDetail /> : <Navigate to="/" />} />
        <Route path="/teacher/questions" element={userRole === Role.TEACHER ? <QuestionBank /> : <Navigate to="/" />} />
        <Route path="/teacher/exams" element={userRole === Role.TEACHER ? <ExamManager /> : <Navigate to="/" />} />
        <Route path="/teacher/reports" element={userRole === Role.TEACHER ? <TeacherReports /> : <Navigate to="/" />} />
        <Route path="/teacher/reports/:examId" element={userRole === Role.TEACHER ? <ExamReportDetail /> : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userRole === Role.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
