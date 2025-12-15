import React from 'react';
import { clearRole } from '../services/mockService';
import { LogOut, LayoutDashboard, ShieldCheck, PieChart, Users, BookOpen, Layers, ClipboardList, FileText, School } from 'lucide-react';
import { Role } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearRole();
    window.location.hash = '/';
    window.location.reload();
  };

  const navItem = (path: string, icon: React.ReactNode, label: string) => (
    <SidebarItem 
      icon={icon} 
      label={label} 
      active={location.pathname === path || location.pathname.startsWith(path + '/')} 
      onClick={() => navigate(path)}
    />
  );

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans text-gray-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-gray-100 border-r border-gray-200 z-10">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 shadow-[4px_4px_8px_#b0c4de,-4px_-4px_8px_#ffffff] flex items-center justify-center text-white font-bold text-xl">
            N
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-800">Neo<span className="text-primary-500">Learn</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar pb-4">
          {role === Role.STUDENT && (
             <>
               {navItem('/student', <LayoutDashboard size={20} />, 'Dashboard')}
               {navItem('/student/classes', <School size={20} />, 'My Classes')}
             </>
          )}

          {role === Role.TEACHER && (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Monitoring</div>
              {navItem('/teacher', <LayoutDashboard size={20} />, 'Live Monitor')}
              {navItem('/teacher/proctoring', <ShieldCheck size={20} />, 'Proctoring Logs')}
              
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Management</div>
              {navItem('/teacher/exams', <FileText size={20} />, 'Exam Manager')}
              {navItem('/teacher/students', <Users size={20} />, 'Students')}
              {navItem('/teacher/classes', <Layers size={20} />, 'Classes')}
              {navItem('/teacher/questions', <BookOpen size={20} />, 'Question Bank')}
              
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Analytics</div>
              {navItem('/teacher/reports', <ClipboardList size={20} />, 'Reports & Stats')}
            </>
          )}

          {role === Role.ADMIN && (
             <>
               {navItem('/admin', <LayoutDashboard size={20} />, 'Dashboard')}
               {navItem('/admin/reports', <PieChart size={20} />, 'Reports')}
             </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-gray-100/90 backdrop-blur z-10 py-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-500 mt-1">Welcome back, {role.charAt(0) + role.slice(1).toLowerCase()}.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 shadow-clay overflow-hidden border-2 border-white">
                <img src="https://picsum.photos/100/100" alt="Avatar" />
             </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
      ${active 
        ? 'bg-gray-100 text-primary-600 shadow-clay transform scale-[1.02]' 
        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}
  `}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default Layout;
