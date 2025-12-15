import React from 'react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Role } from '../types';
import { setRoleToStorage } from '../services/mockService';
import { User, GraduationCap, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleSelectRole = (role: Role) => {
    setRoleToStorage(role);
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 shadow-[6px_6px_12px_#b0c4de,-6px_-6px_12px_#ffffff] flex items-center justify-center text-white font-bold text-2xl">
                    N
                </div>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Neo<span className="text-primary-500">Learn</span></h1>
            </div>
          <h2 className="text-3xl font-bold text-gray-800">Secure, Modern Exam Proctoring.</h2>
          <p className="text-gray-500 text-lg">Experience the next generation of integrity management. Real-time monitoring with privacy-first AI.</p>
          <div className="flex gap-4 pt-4">
             <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 shadow-sm overflow-hidden">
                         <img src={`https://picsum.photos/100/100?random=${i}`} alt="user" />
                    </div>
                ))}
             </div>
             <p className="text-sm text-gray-500 flex items-center">Trusted by 10k+ students</p>
          </div>
        </div>

        <ClayCard className="p-8 space-y-6 bg-opacity-80 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-center mb-6">Select Your Role</h3>
            
            <button 
                onClick={() => handleSelectRole(Role.STUDENT)}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white bg-opacity-60 hover:bg-opacity-100 transition-all shadow-sm hover:shadow-clay border border-transparent hover:border-primary-100"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-800">Student</h4>
                    <p className="text-xs text-gray-500">Take exams, view results</p>
                </div>
            </button>

            <button 
                onClick={() => handleSelectRole(Role.TEACHER)}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white bg-opacity-60 hover:bg-opacity-100 transition-all shadow-sm hover:shadow-clay border border-transparent hover:border-primary-100"
            >
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-800">Teacher</h4>
                    <p className="text-xs text-gray-500">Monitor exams, grade</p>
                </div>
            </button>

            <button 
                onClick={() => handleSelectRole(Role.ADMIN)}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white bg-opacity-60 hover:bg-opacity-100 transition-all shadow-sm hover:shadow-clay border border-transparent hover:border-primary-100"
            >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-800">Admin</h4>
                    <p className="text-xs text-gray-500">System config, reports</p>
                </div>
            </button>
        </ClayCard>
      </div>
    </div>
  );
};

export default Login;
