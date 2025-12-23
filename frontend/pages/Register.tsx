
import React, { useState } from 'react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Role } from '../types';
import { mockRegister } from '../services/mockService';
import { User, Mail, Lock, UserPlus, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Vui lòng điền đầy đủ thông tin.');
    
    setLoading(true);
    setError(null);
    try {
        await mockRegister({ name, email, role });
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/');
    } catch (err: any) {
        setError(err.message || 'Đăng ký thất bại.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium transition-colors">
            <ArrowLeft size={18} /> Quay lại đăng nhập
        </Link>

        <ClayCard className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                <p className="text-sm text-gray-500">Bắt đầu hành trình học tập hiện đại của bạn</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="flex gap-2 p-1 bg-gray-200 rounded-2xl">
                <button 
                    onClick={() => setRole(Role.STUDENT)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${role === Role.STUDENT ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                >
                    <User size={16} /> Học sinh
                </button>
                <button 
                    onClick={() => setRole(Role.TEACHER)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${role === Role.TEACHER ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                >
                    <GraduationCap size={16} /> Giáo viên
                </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Họ và tên</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            placeholder="your@email.com"
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
                            placeholder="Tối thiểu 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <ClayButton type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Đang đăng ký...' : (
                        <>
                            <UserPlus size={20} /> Đăng ký tài khoản
                        </>
                    )}
                </ClayButton>
            </form>
        </ClayCard>
      </div>
    </div>
  );
};

export default Register;
