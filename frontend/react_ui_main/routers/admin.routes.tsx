import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import { Role } from '../types';

interface AdminRoutesProps {
  userRole: Role | null;
}

export const createAdminRoutes = ({ userRole }: AdminRoutesProps) => (
  <>
    <Route 
      path="/admin" 
      element={userRole === Role.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} 
    />
  </>
);

