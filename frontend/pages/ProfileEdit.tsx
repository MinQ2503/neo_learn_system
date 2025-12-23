import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { getCurrentUser, updateProfile } from '../services/mockService';
import { User as UserIcon, Camera, Phone, Calendar, FileText, Save, CheckCircle } from 'lucide-react';

const ProfileEdit: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
        setUser(u);
        setFormData({
            name: u.name,
            bio: u.bio || '',
            phone: u.phone || '',
            birthday: u.birthday || '',
            avatarUrl: u.avatarUrl || ''
        });
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, avatarUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
        await updateProfile(user.id, formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5173);
    } catch (err) {
        alert('Cập nhật thất bại');
    } finally {
        setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Vui lòng đăng nhập</div>;

  return (
    <Layout role={user.role} title="Chỉnh sửa Profile">
      <div className="max-w-4xl mx-auto pb-20">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
            {/* Sidebar: Avatar */}
            <div className="md:col-span-1 space-y-6">
                <ClayCard className="p-8 text-center flex flex-col items-center">
                    <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                        <div className="w-32 h-32 rounded-3xl shadow-clay overflow-hidden border-4 border-white">
                            <img src={formData.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="text-white" size={32} />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{user.role}</p>
                    
                    <div className="mt-6 w-full pt-6 border-t border-gray-100 text-left space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-primary-500" /> {formData.phone || 'Chưa cập nhật'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-primary-500" /> {formData.birthday || 'Chưa cập nhật'}
                        </div>
                    </div>
                </ClayCard>
            </div>

            {/* Main: Form Fields */}
            <div className="md:col-span-2 space-y-6">
                <ClayCard className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                        {success && <span className="flex items-center gap-1 text-green-600 text-sm font-bold animate-bounce"><CheckCircle size={16}/> Đã lưu</span>}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-600 ml-1">Họ và tên</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-600 ml-1">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="tel"
                                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="0123 456 789"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-600 ml-1">Ngày sinh</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="date"
                                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
                                        value={formData.birthday}
                                        onChange={e => setFormData({...formData, birthday: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-600 ml-1">Giới thiệu (Bio)</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                                <textarea 
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 shadow-clay-inset outline-none focus:ring-2 focus:ring-primary-200 transition-all h-32 resize-none" 
                                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                                    value={formData.bio}
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                />
                            </div>
                        </div>

                        <ClayButton type="submit" className="w-full py-4" disabled={loading}>
                            {loading ? 'Đang lưu...' : <><Save size={20}/> Lưu thay đổi</>}
                        </ClayButton>
                    </div>
                </ClayCard>
            </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProfileEdit;