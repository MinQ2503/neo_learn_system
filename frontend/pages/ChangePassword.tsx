
import React, { useState } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Role } from '../types';
import { mockChangePassword, getCurrentUser } from '../services/mockService';
import { Lock, ShieldCheck, AlertCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) return setStatus({ type: 'error', msg: 'Vui lòng nhập đầy đủ thông tin.' });
    if (newPass !== confirmPass) return setStatus({ type: 'error', msg: 'Mật khẩu mới không khớp.' });
    if (newPass.length < 6) return setStatus({ type: 'error', msg: 'Mật khẩu mới phải từ 6 ký tự.' });

    setLoading(true);
    setStatus(null);
    try {
        await mockChangePassword(user?.email || '', newPass);
        setStatus({ type: 'success', msg: 'Thay đổi mật khẩu thành công!' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
    } catch (err: any) {
        setStatus({ type: 'error', msg: 'Đã xảy ra lỗi khi đổi mật khẩu.' });
    } finally {
        setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <Layout role={user.role} title="Đổi mật khẩu">
      <div className="max-w-xl mx-auto">
        <ClayCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Cài đặt bảo mật</h3>
                    <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-xl text-sm mb-6 flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <AlertCircle size={18} /> {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu hiện tại</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                    </div>
                </div>

                <ClayButton type="submit" className="w-full py-4" disabled={loading}>
                    {loading ? 'Đang cập nhật...' : (
                        <>
                            <Save size={20} /> Lưu thay đổi
                        </>
                    )}
                </ClayButton>
            </form>
        </ClayCard>
      </div>
    </Layout>
  );
};

export default ChangePassword;
