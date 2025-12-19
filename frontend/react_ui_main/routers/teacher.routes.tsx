import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import TeacherDashboard from '../pages/dashboards/TeacherDashboard';
import StudentManager from '../pages/teacher/StudentManager';
import ClassManager from '../pages/teacher/ClassManager';
import ClassDetail from '../pages/teacher/ClassDetail';
import QuestionBank from '../pages/teacher/QuestionBank';
import ExamManager from '../pages/teacher/ExamManager';
import TeacherReports from '../pages/teacher/TeacherReports';
import ExamReportDetail from '../pages/teacher/ExamReportDetail';
import { Role } from '../types';

interface TeacherRoutesProps {
  userRole: Role | null;
}

export const createTeacherRoutes = ({ userRole }: TeacherRoutesProps) => (
  <>
    <Route 
      path="/teacher" 
      element={userRole === Role.TEACHER ? <TeacherDashboard /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/students" 
      element={userRole === Role.TEACHER ? <StudentManager /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/classes" 
      element={userRole === Role.TEACHER ? <ClassManager /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/classes/:classId" 
      element={userRole === Role.TEACHER ? <ClassDetail /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/questions" 
      element={userRole === Role.TEACHER ? <QuestionBank /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/exams" 
      element={userRole === Role.TEACHER ? <ExamManager /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/reports" 
      element={userRole === Role.TEACHER ? <TeacherReports /> : <Navigate to="/" />} 
    />
    
    <Route 
      path="/teacher/reports/:examId" 
      element={userRole === Role.TEACHER ? <ExamReportDetail /> : <Navigate to="/" />} 
    />
  </>
);

