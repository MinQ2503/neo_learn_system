import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { Role } from '../types';

interface AuthRoutesProps {
  userRole: Role | null;
  onLogin: (role: Role) => void;
}

export const createAuthRoutes = ({ userRole, onLogin }: AuthRoutesProps) => (
  <>
    <Route 
      path="/" 
      element={
        !userRole ? <Login onLogin={onLogin} /> : <Navigate to={`/${userRole.toLowerCase()}`} />
      } 
    />
    
    <Route 
      path="/register" 
      element={
        !userRole ? <Register /> : <Navigate to={`/${userRole.toLowerCase()}`} />
      } 
    />
  </>
);

