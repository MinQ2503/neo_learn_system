import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ExamRoom from './pages/ExamRoom';
import TeacherDashboard from './pages/TeacherDashboard';
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
        
        {/* Student Routes */}
        <Route path="/student" element={userRole === Role.STUDENT ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/exam/:examId" element={userRole === Role.STUDENT ? <ExamRoom /> : <Navigate to="/" />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={userRole === Role.TEACHER ? <TeacherDashboard /> : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userRole === Role.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
