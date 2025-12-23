
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, User, ClassGroup } from '../../types';
import { userService } from '../../services/api/userService';
import { classService } from '../../services/api/classService';
import { getCurrentUser } from '../../services/mockService';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Hash, Camera, Calendar, FileText, Phone, BookOpen, CheckSquare, Square } from 'lucide-react';

const StudentManagerAdmin: React.FC = () => {
  const user = getCurrentUser();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    studentId: '', 
    phone: '',
    birthday: '',
    bio: '',
    avatarUrl: '',
    assignedCourseIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [sData, cData] = await Promise.all([
      userService.getUsersByRole(Role.STUDENT),
      classService.getAll()
    ]);
    setStudents(sData);
    setClasses(cData);
    setLoading(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
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
      let savedStudent: User;
      if (editingStudent) {
        savedStudent = await userService.update(editingStudent.id, formData);
      } else {
        savedStudent = await userService.create({ 
          ...formData, 
          role: Role.STUDENT, 
          avatarUrl: formData.avatarUrl || `https://picsum.photos/200/200?random=${Date.now()}` 
        });
      }

      const studentId = savedStudent.id;
      const updates = classes.map(async (cls) => {
        const isAssigned = formData.assignedCourseIds.includes(cls.id);
        const hasStudent = cls.studentIds?.includes(studentId);

        if (isAssigned && !hasStudent) {
            await classService.update(cls.id, { studentIds: [...(cls.studentIds || []), studentId] });
        } else if (!isAssigned && hasStudent) {
            await classService.update(cls.id, { studentIds: (cls.studentIds || []).filter(id => id !== studentId) });
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
    if (confirm('Bạn có chắc chắn muốn xóa học sinh này không?')) {
        await userService.delete(id);
        fetchData();
    }
  };

  const openEdit = (student: User) => {
    setEditingStudent(student);
    const assignedIds = classes
      .filter(c => c.studentIds?.includes(student.id))
      .map(c => c.id);

    setFormData({ 
        name: student.name, 
        email: student.email || '', 
        studentId: student.studentId || '',
        phone: student.phone || '',
        birthday: student.birthday || '',
        bio: student.bio || '',
        avatarUrl: student.avatarUrl || '',
        assignedCourseIds: assignedIds
    });
    setCourseSearchQuery('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', studentId: '', phone: '', birthday: '', bio: '', avatarUrl: '', assignedCourseIds: [] });
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
    <Layout role={user?.role || Role.TEACHER} title="Quản lý Học sinh">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm tên, email hoặc mã số học sinh..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Thêm Học sinh
        </ClayButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách học sinh...</p>
        </div>
      ) : (
        <ClayCard className="overflow-hidden p-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-6 py-4">Học sinh</th>
                            <th className="px-6 py-4">Mã số</th>
                            <th className="px-6 py-4">Khóa học</th>
                            <th className="px-6 py-4">Liên hệ</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map(student => {
                            const studentCourses = classes.filter(c => c.studentIds?.includes(student.id));
                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-clay-sm overflow-hidden">
                                                {student.avatarUrl ? (
                                                <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                student.name.charAt(0)
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-800">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        <div className="flex items-center gap-1"><Hash size={12} /> {student.studentId || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {studentCourses.map(c => (
                                                <span key={c.id} className="text-[9px] font-bold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded uppercase">{c.name}</span>
                                            ))}
                                            {studentCourses.length === 0 && <span className="text-[10px] text-gray-300 italic">Chưa gán</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        <p className="font-medium">{student.email}</p>
                                        <p className="text-gray-400">{student.phone || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(student)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-lg transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </ClayCard>
      )}

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudent ? "Chỉnh sửa Học sinh" : "Thêm Học sinh mới"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingStudent ? 'Lưu Thay đổi' : 'Tạo mới'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-6">
            <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-24 h-24 rounded-3xl shadow-clay-sm overflow-hidden border-2 border-white bg-gray-50 flex items-center justify-center">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="text-gray-300" size={40} />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="text-white" size={20} />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Ảnh hồ sơ</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Họ và Tên</label>
                    <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mã học sinh</label>
                    <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input type="email" className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gán vào Khóa học</label>
                    <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-1 rounded-md font-extrabold uppercase shadow-clay-sm">
                        {formData.assignedCourseIds.length} Đã chọn
                    </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 shadow-clay-inset bg-gray-100 rounded-2xl no-scrollbar">
                    {filteredClasses.map(cls => {
                        const isSelected = formData.assignedCourseIds.includes(cls.id);
                        return (
                            <div key={cls.id} onClick={() => toggleCourse(cls.id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-white shadow-clay-sm text-primary-600' : 'text-gray-500 hover:bg-white/50'}`}>
                                <div className="flex items-center gap-3">
                                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{cls.name}</span>
                                        <span className="text-[9px] uppercase font-bold opacity-60">{cls.subject}</span>
                                    </div>
                                </div>
                                <BookOpen size={14} className="opacity-30" />
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

export default StudentManagerAdmin;
