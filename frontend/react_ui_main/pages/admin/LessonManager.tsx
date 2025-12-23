
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Lesson, ClassGroup } from '../../types';
import { lessonService } from '../../services/api/lessonService';
import { classService } from '../../services/api/classService';
import { Plus, Edit2, Trash2, Search, FileText, Video, Link as LinkIcon, User as UserIcon, Calendar, FileJson, AlignLeft } from 'lucide-react';

const LessonManagerAdmin: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    content: '',
    type: 'document' as Lesson['type'], 
    format: 'pdf' as Lesson['format'], 
    url: '',
    classId: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [lData, cData] = await Promise.all([
      lessonService.getAllGlobal(),
      classService.getAll()
    ]);
    setLessons(lData);
    setClasses(cData);
    setLoading(false);
  };

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!editingLesson && !formData.classId)) return;
    
    setLoading(true);
    try {
      if (editingLesson) {
        await lessonService.updateGlobal(editingLesson.id, {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          type: formData.type,
          format: formData.format,
          url: formData.url
        });
      } else {
        await lessonService.createGlobal(formData.classId, {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          type: formData.type,
          format: formData.format,
          url: formData.url
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này không?')) {
        await lessonService.deleteGlobal(id);
        fetchData();
    }
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({ 
        title: lesson.title, 
        description: lesson.description || '',
        content: lesson.content || '',
        type: lesson.type, 
        format: lesson.format,
        url: lesson.url,
        classId: '' 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({ title: '', description: '', content: '', type: 'document', format: 'pdf', url: '', classId: '' });
  };

  const getIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video size={18} />;
      case 'link': return <LinkIcon size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <Layout role={Role.ADMIN} title="Quản lý Bài học">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm tên bài học hoặc người tạo..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Thêm Bài học
        </ClayButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách bài học...</p>
        </div>
      ) : (
        <ClayCard className="overflow-hidden p-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-6 py-4">Tên bài học</th>
                            <th className="px-6 py-4">Loại / Định dạng</th>
                            <th className="px-6 py-4">Người tạo</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLessons.map(lesson => (
                            <tr key={lesson.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm shadow-clay-sm ${lesson.type === 'video' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {getIcon(lesson.type)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-bold text-gray-800">{lesson.title}</span>
                                          {lesson.description && <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{lesson.description}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm text-gray-700 capitalize font-medium">{lesson.type}</span>
                                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{lesson.format}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                      <UserIcon size={14} className="text-primary-400" />
                                      {lesson.teacherName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEdit(lesson)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-lg transition-all">
                                          <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(lesson.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all">
                                          <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredLessons.length === 0 && (
              <div className="py-20 text-center">
                  <FileText className="mx-auto mb-4 text-gray-200" size={48} />
                  <p className="text-gray-400 font-medium">Không tìm thấy bài học nào.</p>
              </div>
            )}
        </ClayCard>
      )}

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLesson ? "Chỉnh sửa Bài học" : "Thêm Bài học mới"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingLesson ? 'Lưu Thay đổi' : 'Thêm mới'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-5">
            {!editingLesson && (
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Thuộc Lớp học</label>
                  <select 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.classId}
                      onChange={e => setFormData({...formData, classId: e.target.value})}
                  >
                      <option value="">-- Chọn Lớp học --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
                      ))}
                  </select>
              </div>
            )}
            
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề bài học</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                        placeholder="Ví dụ: Giới thiệu về React Hooks"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả ngắn</label>
                <div className="relative">
                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                        placeholder="Mô tả tóm tắt nội dung bài học..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Loại nội dung</label>
                  <select 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                      <option value="document">Tài liệu</option>
                      <option value="video">Video</option>
                      <option value="audio">Âm thanh</option>
                      <option value="link">Liên kết</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Định dạng</label>
                  <select 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.format}
                      onChange={e => setFormData({...formData, format: e.target.value as any})}
                  >
                      <option value="pdf">PDF</option>
                      <option value="docx">Word (DOCX)</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="mp4">Video (MP4)</option>
                      <option value="url">URL</option>
                  </select>
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nội dung chi tiết bài học</label>
                <div className="relative">
                    <FileJson className="absolute left-4 top-4 text-gray-400" size={16} />
                    <textarea 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all h-32 resize-none" 
                        placeholder="Nhập nội dung bài học hoặc ghi chú chi tiết..."
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Đường dẫn tài liệu (URL)</label>
                <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                        placeholder="https://drive.google.com/..."
                        value={formData.url}
                        onChange={e => setFormData({...formData, url: e.target.value})}
                    />
                </div>
            </div>
        </form>
      </ClayModal>
    </Layout>
  );
};

export default LessonManagerAdmin;
