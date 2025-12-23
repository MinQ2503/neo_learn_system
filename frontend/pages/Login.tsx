
import React, { useState } from 'react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Role } from '../types';
import { mockLogin } from '../services/mockService';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Vui lòng nhập đầy đủ thông tin.');
    
    setLoading(true);
    setError(null);
    try {
        const user = await mockLogin(email, password);
        onLogin(user.role);
        navigate(`/${user.role.toLowerCase()}`);
    } catch (err: any) {
        setError(err.message || 'Đăng nhập thất bại.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 shadow-clay flex items-center justify-center text-white font-bold text-2xl">
                N
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Neo<span className="text-primary-500">Learn</span></h1>
        </div>

        <ClayCard className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại</h2>
                <p className="text-sm text-gray-500">Đăng nhập bằng tài khoản email hoặc admin</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-shake">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tài khoản / Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            placeholder="Email hoặc 'admin'"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-primary-500 hover:underline">Quên mật khẩu?</button>
                </div>

                <ClayButton type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Đang xử lý...' : (
                        <>
                            <LogIn size={20} /> Đăng nhập
                        </>
                    )}
                </ClayButton>
            </form>

            <div className="pt-4 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500">
                    Chưa có tài khoản? <Link to="/register" className="text-primary-500 font-bold hover:underline">Đăng ký ngay</Link>
                </p>
            </div>
        </ClayCard>
        
        <div className="mt-8 grid grid-cols-3 gap-2 opacity-50">
             <div className="h-1 bg-gray-300 rounded-full"></div>
             <div className="h-1 bg-primary-500 rounded-full"></div>
             <div className="h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
