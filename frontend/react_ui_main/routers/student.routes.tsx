import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import StudentClasses from '../pages/student/StudentClasses';
import StudentClassDetail from '../pages/student/StudentClassDetail';
import StudentExamResult from '../pages/student/StudentExamResult';
import ExamRoom from '../pages/student/ExamRoom';
import { Role } from '../types';

interface StudentRoutesProps {
  userRole: Role | null;
}

export const createStudentRoutes = ({ userRole }: StudentRoutesProps) => (
  <>
    <Route 
      path="/student" 
      element={userRole === Role.STUDENT ? <StudentDashboard /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/student/classes" 
      element={userRole === Role.STUDENT ? <StudentClasses /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/student/classes/:classId" 
      element={userRole === Role.STUDENT ? <StudentClassDetail /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/student/exam-result/:examId" 
      element={userRole === Role.STUDENT ? <StudentExamResult /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/exam/:examId" 
      element={userRole === Role.STUDENT ? <ExamRoom /> : <Navigate to="/" />} 
    />
  </>
);

