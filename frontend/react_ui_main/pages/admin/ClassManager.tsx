
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, ClassGroup, User } from '../../types';
import { classService } from '../../services/api/classService';
import { userService } from '../../services/api/userService';
import { Plus, Edit2, Trash2, Search, Users, Calendar, User as UserIcon, BookOpen } from 'lucide-react';

const ClassManagerAdmin: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    subject: '', 
    schedule: '', 
    teacherName: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cData, tData] = await Promise.all([
      classService.getAll(),
      userService.getUsersByRole(Role.TEACHER)
    ]);
    setClasses(cData);
    setTeachers(tData);
    setLoading(false);
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) return;
    
    setLoading(true);
    try {
      if (editingClass) {
        await classService.update(editingClass.id, formData);
      } else {
        await classService.create({ 
          ...formData, 
          studentCount: 0, 
          studentIds: [], 
          lessons: [], 
          assignments: [] 
        } as any);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp học này không?')) {
        await classService.delete(id);
        fetchData();
    }
  };

  const openEdit = (cls: ClassGroup) => {
    setEditingClass(cls);
    setFormData({ 
        name: cls.name, 
        subject: cls.subject, 
        schedule: cls.schedule,
        teacherName: cls.teacherName || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingClass(null);
    setFormData({ name: '', subject: '', schedule: '', teacherName: '' });
  };

  return (
    <Layout role={Role.ADMIN} title="Quản lý Lớp học">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm tên lớp, môn học hoặc giáo viên..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Tạo Lớp học
        </ClayButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách lớp học...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => (
                <ClayCard key={cls.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl font-bold text-xl shadow-clay-sm">
                        {cls.subject.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cls)} className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(cls.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 text-lg mb-1">{cls.name}</h4>
                    <p className="text-sm text-gray-500 mb-4">{cls.subject}</p>
                    
                    <div className="space-y-2 border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <UserIcon size={14} className="text-primary-400" />
                        <span>Giáo viên: <span className="font-bold">{cls.teacherName || 'Chưa phân công'}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} className="text-primary-400" />
                        <span>Lịch học: {cls.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={14} className="text-primary-400" />
                        <span>Sĩ số: {cls.studentIds?.length || 0} học sinh</span>
                      </div>
                    </div>
                </ClayCard>
            ))}
            {filteredClasses.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-white/50 inline-block p-8 rounded-3xl shadow-clay-inset">
                  <BookOpen className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 font-medium">Không tìm thấy lớp học phù hợp.</p>
                </div>
              </div>
            )}
        </div>
      )}

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClass ? "Chỉnh sửa Lớp học" : "Tạo Lớp học mới"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingClass ? 'Lưu Thay đổi' : 'Tạo mới'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên Lớp học</label>
                <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    placeholder="Lớp Toán nâng cao A1"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Môn học</label>
                <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    placeholder="Toán học / Vật lý / ..."
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Lịch học</label>
                <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    placeholder="Thứ 2, Thứ 4 - 10:00 AM"
                    value={formData.schedule}
                    onChange={e => setFormData({...formData, schedule: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Giáo viên phụ trách</label>
                <select 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all appearance-none cursor-pointer"
                    value={formData.teacherName}
                    onChange={e => setFormData({...formData, teacherName: e.target.value})}
                >
                    <option value="">-- Chọn Giáo viên --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                </select>
            </div>
        </form>
      </ClayModal>
    </Layout>
  );
};

export default ClassManagerAdmin;
