
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Assignment, ClassGroup, AssignmentSubmission } from '../../types';
import { assignmentService } from '../../services/api/assignmentService';
import { classService } from '../../services/api/classService';
import { 
  Plus, Edit2, Trash2, Search, FileText, User as UserIcon, 
  Calendar, Clock, BookOpen, AlertCircle, ChevronDown, 
  SortAsc, SortDesc, Users, CheckCircle, XCircle, 
  ExternalLink, ArrowLeft, Save, Star
} from 'lucide-react';

const AssignmentManagerAdmin: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'soonest' | 'latest'>('soonest');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  // Submissions management state
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'submitted' | 'pending'>('submitted');
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  
  // Grading form
  const [gradingForm, setGradingForm] = useState({ grade: 0, feedback: '', gradedBy: 'Admin System' });

  // Assignment form
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    startDate: '',
    dueDate: '',
    classId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [aData, cData] = await Promise.all([
      assignmentService.getAllGlobal(),
      classService.getAll()
    ]);
    setAssignments(aData);
    setClasses(cData);
    setLoading(false);
  };

  const handleSort = (type: 'soonest' | 'latest') => {
    setSortBy(type);
    const sorted = [...assignments].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return type === 'soonest' ? dateA - dateB : dateB - dateA;
    });
    setAssignments(sorted);
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classes.find(c => c.id === a.classId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!editingAssignment && !formData.classId)) return;
    
    setLoading(true);
    try {
      if (editingAssignment) {
        await assignmentService.updateGlobal(editingAssignment.id, {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          dueDate: formData.dueDate
        });
      } else {
        await assignmentService.createGlobal(formData.classId, {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          dueDate: formData.dueDate
        });
      }
      setIsFormModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài tập này không?')) {
        await assignmentService.deleteGlobal(id);
        fetchData();
    }
  };

  const openEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({ 
        title: assignment.title, 
        description: assignment.description,
        startDate: assignment.startDate || '',
        dueDate: assignment.dueDate,
        classId: assignment.classId || ''
    });
    setIsFormModalOpen(true);
  };

  const openSubmissions = async (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setLoading(true);
    const subs = await assignmentService.getSubmissions(assignment.id);
    setSubmissions(subs);
    setIsSubmissionsModalOpen(true);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setFormData({ title: '', description: '', startDate: '', dueDate: '', classId: '' });
  };

  const handleGradeSubmit = async () => {
    if (!selectedSub) return;
    setLoading(true);
    try {
      await assignmentService.gradeSubmission(selectedSub.id, gradingForm);
      // Refresh local state
      const updatedSubs = await assignmentService.getSubmissions(activeAssignment!.id);
      setSubmissions(updatedSubs);
      setSelectedSub(updatedSubs.find(s => s.id === selectedSub.id) || null);
      alert('Chấm điểm thành công!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase()) &&
    (subTab === 'submitted' ? (s.status === 'submitted' || s.status === 'graded') : s.status === 'pending')
  );

  const getStatusBadge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-md">QUÁ HẠN</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-md">ĐANG MỞ</span>;
  };

  return (
    <Layout role={Role.ADMIN} title="Quản lý Bài tập">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-4 w-full max-w-2xl">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm tên bài tập, giáo viên hoặc lớp..." 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {/* Sort Dropdown */}
            <div className="relative group">
                <button className="h-full px-6 py-4 rounded-2xl bg-white shadow-clay flex items-center gap-2 font-bold text-gray-600 hover:text-primary-500 transition-all">
                    {sortBy === 'soonest' ? <SortAsc size={20} /> : <SortDesc size={20} />}
                    <span className="hidden sm:inline">Sắp xếp: {sortBy === 'soonest' ? 'Hạn gần nhất' : 'Hạn xa nhất'}</span>
                    <ChevronDown size={16} />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                    <button onClick={() => handleSort('soonest')} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors border-b border-gray-50 flex items-center gap-2">
                        <SortAsc size={16} /> Hạn gần nhất
                    </button>
                    <button onClick={() => handleSort('latest')} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors flex items-center gap-2">
                        <SortDesc size={16} /> Hạn xa nhất
                    </button>
                </div>
            </div>
        </div>
        <ClayButton onClick={() => { resetForm(); setIsFormModalOpen(true); }}>
            <Plus size={20} /> Thêm Bài tập
        </ClayButton>
      </div>

      {loading && !isFormModalOpen && !isSubmissionsModalOpen ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách bài tập...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(assignment => {
                const targetClass = classes.find(c => c.id === assignment.classId);
                return (
                    <ClayCard key={assignment.id} className="p-6 flex flex-col h-full relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-clay-sm">
                                <FileText size={20} />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(assignment)} className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(assignment.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            {getStatusBadge(assignment.dueDate)}
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{assignment.title}</h4>
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{assignment.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <BookOpen size={14} className="text-primary-400" />
                                <span>Lớp: <span className="text-gray-700">{targetClass?.name || 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <UserIcon size={14} className="text-primary-400" />
                                <span>Giáo viên: <span className="text-gray-700">{assignment.teacherName}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                <Clock size={14} className="text-red-400" />
                                <span>Hạn chót: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => openSubmissions(assignment)}
                            className="mt-6 w-full py-3 rounded-xl bg-primary-50 text-primary-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-500 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
                        >
                            <Users size={18} /> Quản lý nộp bài
                        </button>
                    </ClayCard>
                );
            })}
            {filteredAssignments.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-white/50 inline-block p-8 rounded-3xl shadow-clay-inset">
                  <AlertCircle className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 font-medium">Không tìm thấy bài tập nào.</p>
                </div>
              </div>
            )}
        </div>
      )}

      {/* --- FORM MODAL --- */}
      <ClayModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingAssignment ? "Chỉnh sửa Bài tập" : "Thêm Bài tập mới"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsFormModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingAssignment ? 'Lưu Thay đổi' : 'Giao Bài tập'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-5">
            {!editingAssignment && (
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên bài tập</label>
                <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    placeholder="Ví dụ: Bài tập về nhà tuần 4"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Ngày bắt đầu</label>
                  <input 
                      type="date" 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Hạn nộp bài</label>
                  <input 
                      type="date" 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả chi tiết</label>
                <textarea 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none transition-all h-32 resize-none" 
                    placeholder="Nhập yêu cầu bài tập..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>
        </form>
      </ClayModal>

      {/* --- SUBMISSIONS MODAL --- */}
      <ClayModal
        isOpen={isSubmissionsModalOpen}
        onClose={() => { setIsSubmissionsModalOpen(false); setSelectedSub(null); }}
        title={`Báo cáo nộp bài: ${activeAssignment?.title}`}
        footer={<div className="flex justify-end"><ClayButton variant="neutral" onClick={() => { setIsSubmissionsModalOpen(false); setSelectedSub(null); }}>Đóng</ClayButton></div>}
      >
        <div className="space-y-6">
            {!selectedSub ? (
                <>
                    {/* Submissions Overview & Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 p-1 bg-gray-200 rounded-2xl w-full sm:w-auto">
                            <button 
                                onClick={() => setSubTab('submitted')}
                                className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'submitted' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                Đã nộp ({submissions.filter(s => s.status !== 'pending').length})
                            </button>
                            <button 
                                onClick={() => setSubTab('pending')}
                                className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'pending' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                Chưa nộp ({submissions.filter(s => s.status === 'pending').length})
                            </button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Tìm học sinh..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white shadow-clay-inset outline-none"
                                value={studentSearchQuery}
                                onChange={e => setStudentSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto space-y-3 no-scrollbar pr-2">
                        {filteredSubmissions.map(sub => (
                            <ClayCard 
                                key={sub.id} 
                                className={`p-4 flex items-center justify-between group cursor-pointer border-2 transition-all ${sub.status === 'graded' ? 'border-green-100 bg-green-50/30' : 'border-transparent'}`}
                                onClick={() => sub.status !== 'pending' && setSelectedSub(sub)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-clay-sm ${sub.status === 'pending' ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600'}`}>
                                        {sub.studentName.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800 text-sm">{sub.studentName}</h5>
                                        {sub.status !== 'pending' ? (
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Clock size={10} /> Nộp lúc: {new Date(sub.submittedAt!).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Chưa nộp</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {sub.status === 'graded' ? (
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-green-600">ĐÃ CHẤM</span>
                                            <span className="text-xs font-bold text-gray-700">{sub.grade}/10</span>
                                        </div>
                                    ) : sub.status === 'submitted' ? (
                                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-[10px] font-bold rounded-md">CHỜ CHẤM</span>
                                    ) : null}
                                    {sub.status !== 'pending' && <ExternalLink size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />}
                                </div>
                            </ClayCard>
                        ))}
                        {filteredSubmissions.length === 0 && (
                            <div className="py-12 text-center text-gray-400">
                                <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                                <p className="text-sm font-medium">Không có dữ liệu phù hợp.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* --- GRADING VIEW --- */
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <button 
                        onClick={() => setSelectedSub(null)}
                        className="flex items-center gap-2 text-primary-600 font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
                    >
                        <ArrowLeft size={16} /> Quay lại danh sách
                    </button>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* Student Content Column */}
                        <div className="md:col-span-3 space-y-6">
                            <ClayCard className="p-6 bg-white border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Nội dung bài làm</h4>
                                <div className="p-4 rounded-xl bg-gray-50 shadow-clay-inset text-gray-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[150px]">
                                    {selectedSub.content || "Học sinh không để lại ghi chú nội dung."}
                                </div>
                            </ClayCard>

                            <ClayCard className="p-6 bg-white border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tệp đính kèm</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedSub.fileUrls?.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                            <FileText size={18} />
                                            <span className="text-xs font-bold truncate">Tài liệu {i+1}.pdf</span>
                                        </a>
                                    ))}
                                    {(!selectedSub.fileUrls || selectedSub.fileUrls.length === 0) && (
                                        <p className="text-xs text-gray-400 italic col-span-2">Không có tệp đính kèm.</p>
                                    )}
                                </div>
                            </ClayCard>
                        </div>

                        {/* Grading Form Column */}
                        <div className="md:col-span-2 space-y-4">
                            <ClayCard className="p-6 bg-white border-2 border-primary-50">
                                <h4 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Star size={16} /> Chấm điểm & Phản hồi
                                </h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Điểm số (0-10)</label>
                                        <input 
                                            type="number" 
                                            min="0" max="10" step="0.5"
                                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none text-center text-xl font-bold text-primary-600"
                                            value={selectedSub.status === 'graded' ? selectedSub.grade : gradingForm.grade}
                                            onChange={e => setGradingForm({...gradingForm, grade: parseFloat(e.target.value)})}
                                            disabled={selectedSub.status === 'graded' && !loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nhận xét</label>
                                        <textarea 
                                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none text-sm h-32 resize-none"
                                            placeholder="Ghi nhận xét của bạn về bài làm..."
                                            value={selectedSub.status === 'graded' ? selectedSub.feedback : gradingForm.feedback}
                                            onChange={e => setGradingForm({...gradingForm, feedback: e.target.value})}
                                            disabled={selectedSub.status === 'graded' && !loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Người chấm</label>
                                        <input 
                                            type="text"
                                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none text-xs text-gray-500"
                                            value={selectedSub.status === 'graded' ? selectedSub.gradedBy : gradingForm.gradedBy}
                                            onChange={e => setGradingForm({...gradingForm, gradedBy: e.target.value})}
                                            disabled={selectedSub.status === 'graded' && !loading}
                                        />
                                    </div>

                                    {selectedSub.status !== 'graded' ? (
                                        <ClayButton className="w-full py-4" onClick={handleGradeSubmit} disabled={loading}>
                                            <Save size={20} /> Hoàn tất chấm điểm
                                        </ClayButton>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl">
                                            <CheckCircle size={24} />
                                            <span className="text-xs font-bold">BÀI ĐÃ ĐƯỢC CHẤM</span>
                                            <button 
                                                onClick={() => setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? {...s, status: 'submitted'} : s))}
                                                className="text-[10px] underline uppercase font-bold opacity-60 hover:opacity-100"
                                            >
                                                Sửa điểm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </ClayCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </ClayModal>
    </Layout>
  );
};

export default AssignmentManagerAdmin;
