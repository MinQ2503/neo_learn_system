
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, User, ClassGroup } from '../../types';
import { userService } from '../../services/api/userService';
import { classService } from '../../services/api/classService';
import { Plus, Edit2, Trash2, Search, Mail, User as UserIcon, GraduationCap, Camera, Phone, Calendar, FileText, School, CheckSquare, Square } from 'lucide-react';

const TeacherManager: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    bio: '', 
    phone: '', 
    birthday: '',
    avatarUrl: '',
    assignedCourseIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tData, cData] = await Promise.all([
      userService.getUsersByRole(Role.TEACHER),
      classService.getAll()
    ]);
    setTeachers(tData);
    setClasses(cData);
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

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
    if (!formData.name || !formData.email) return;
    
    setLoading(true);
    try {
      let savedTeacher: User;
      if (editingTeacher) {
        savedTeacher = await userService.update(editingTeacher.id, formData);
      } else {
        savedTeacher = await userService.create({ 
          ...formData, 
          role: Role.TEACHER, 
          avatarUrl: formData.avatarUrl || `https://picsum.photos/200/200?random=${Date.now()}` 
        });
      }

      // Update Course Responsible Teacher
      const teacherName = savedTeacher.name;
      const updates = classes.map(async (cls) => {
        const shouldBeLead = formData.assignedCourseIds.includes(cls.id);
        const isCurrentlyLead = cls.teacherName === (editingTeacher?.name || '');

        if (shouldBeLead) {
            // Assign this teacher to course
            await classService.update(cls.id, { teacherName: teacherName });
        } else if (isCurrentlyLead && !shouldBeLead) {
            // Remove assignment if it was previously this teacher
            await classService.update(cls.id, { teacherName: 'N/A' });
        }
      });
      await Promise.all(updates);

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giáo viên này không?')) {
        await userService.delete(id);
        fetchData();
    }
  };

  const openEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    const assignedIds = classes
      .filter(c => c.teacherName === teacher.name)
      .map(c => c.id);

    setFormData({ 
        name: teacher.name, 
        email: teacher.email || '', 
        bio: teacher.bio || '',
        phone: teacher.phone || '',
        birthday: teacher.birthday || '',
        avatarUrl: teacher.avatarUrl || '',
        assignedCourseIds: assignedIds
    });
    setCourseSearchQuery('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', bio: '', phone: '', birthday: '', avatarUrl: '', assignedCourseIds: [] });
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => {
        const current = prev.assignedCourseIds;
        if (current.includes(courseId)) {
            return { ...prev, assignedCourseIds: current.filter(id => id !== courseId) };
        } else {
            return { ...prev, assignedCourseIds: [...current, courseId] };
        }
    });
  };

  return (
    <Layout role={Role.ADMIN} title="Quản lý Giáo viên">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm kiếm giáo viên theo tên hoặc email..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Thêm Giáo viên
        </ClayButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách giáo viên...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => {
                const assignedClasses = classes.filter(c => c.teacherName === teacher.name);
                return (
                    <ClayCard key={teacher.id} className="p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 rounded-3xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-clay overflow-hidden">
                              {teacher.avatarUrl ? (
                                <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                              ) : (
                                teacher.name.charAt(0)
                              )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
                            <GraduationCap size={16} className="text-primary-500" />
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-lg mb-1">{teacher.name}</h4>
                        <p className="text-xs text-gray-500 mb-3">{teacher.email}</p>
                        
                        <div className="flex flex-wrap justify-center gap-1 mb-4">
                            {assignedClasses.map(c => (
                                <span key={c.id} className="text-[8px] font-extrabold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded shadow-clay-sm uppercase">{c.name}</span>
                            ))}
                            {assignedClasses.length === 0 && <span className="text-[10px] text-gray-300 italic">Chưa phụ trách khóa nào</span>}
                        </div>

                        <div className="flex gap-3 w-full border-t border-gray-100 pt-4 mt-auto">
                            <button onClick={() => openEdit(teacher)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-primary-500 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                              <Edit2 size={16} /> Sửa
                            </button>
                            <button onClick={() => handleDelete(teacher.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 size={20} />
                            </button>
                        </div>
                    </ClayCard>
                );
            })}
        </div>
      )}

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTeacher ? "Chỉnh sửa Giáo viên" : "Thêm Giáo viên mới"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingTeacher ? 'Lưu Thay đổi' : 'Tạo mới'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-5">
            <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-20 h-20 rounded-3xl shadow-clay-sm overflow-hidden border-2 border-white bg-gray-50 flex items-center justify-center">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="text-gray-300" size={32} />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="text-white" size={16} />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Họ và Tên</label>
                    <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input type="email" className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* ASSIGN TO COURSES AS TEACHER */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phụ trách Khóa học</label>
                    <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-1 rounded-md font-extrabold uppercase shadow-clay-sm">
                        {formData.assignedCourseIds.length} Đã chọn
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        type="text"
                        placeholder="Tìm khóa học..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                        value={courseSearchQuery}
                        onChange={e => setCourseSearchQuery(e.target.value)}
                    />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 p-2 shadow-clay-inset bg-gray-100 rounded-2xl no-scrollbar">
                    {filteredClasses.map(cls => {
                        const isSelected = formData.assignedCourseIds.includes(cls.id);
                        return (
                            <div 
                                key={cls.id} 
                                onClick={() => toggleCourse(cls.id)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-white shadow-clay-sm text-primary-600' : 'text-gray-500 hover:bg-white/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{cls.name}</span>
                                        <span className="text-[9px] uppercase font-bold opacity-60">GV hiện tại: {cls.teacherName || 'Chưa gán'}</span>
                                    </div>
                                </div>
                                <School size={14} className="opacity-30" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </form>
      </ClayModal>
    </Layout>
  );
};

export default TeacherManager;
