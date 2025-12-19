import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '../types';
import { createAuthRoutes } from './auth.routes';
import { createStudentRoutes } from './student.routes';
import { createTeacherRoutes } from './teacher.routes';
import { createAdminRoutes } from './admin.routes';

interface AppRoutesProps {
  userRole: Role | null;
  onLogin: (role: Role) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ userRole, onLogin }) => {
  return (
    <Routes>
      {/* Auth Routes */}
      {createAuthRoutes({ userRole, onLogin })}
      
      {/* Student Routes */}
      {createStudentRoutes({ userRole })}
      
      {/* Teacher Routes */}
      {createTeacherRoutes({ userRole })}
      
      {/* Admin Routes */}
      {createAdminRoutes({ userRole })}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

