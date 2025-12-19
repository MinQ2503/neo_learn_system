import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Role } from './types';
import { getRoleFromStorage } from './services/mockService';
import { AppRoutes } from './routers';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get role from localStorage
    let role = getRoleFromStorage();
    
    // If no role in storage, try to get from user object
    if (!role) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.role) {
            const roleUpper = user.role.toUpperCase();
            if (roleUpper === 'ADMIN' || roleUpper === 'TEACHER' || roleUpper === 'STUDENT') {
              role = roleUpper as Role;
              // Save to storage for next time
              localStorage.setItem('neo_role', role);
            }
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
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
      <AppRoutes userRole={userRole} onLogin={handleLogin} />
    </Router>
  );
};

export default App;
