
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Exam, ClassGroup, Question, ProctorConfig } from '../../types';
import { examService } from '../../services/api/examService';
import { classService } from '../../services/api/classService';
import { questionService } from '../../services/api/questionService';
import { getCurrentUser } from '../../services/mockService';
import { 
    Plus, Edit2, Trash2, Calendar, Clock, Book, AlertTriangle, 
    CheckSquare, Square, ToggleLeft, ToggleRight, Search, FileText, 
    Users, User as UserIcon 
} from 'lucide-react';

const DEFAULT_CONFIG: ProctorConfig = {
    requireFaceAuth: true,
    continuousFaceAuth: true,
    detectCheating: true,
    maxViolations: 3,
    allowHeadphones: false
};

const ExamManagerAdmin: React.FC = () => {
  const user = getCurrentUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'questions' | 'proctoring'>('general');

  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<Exam>>({
      title: '', subject: '', durationMinutes: 60, startTime: '', 
      maxAttempts: 1, shuffleQuestions: false, showResults: true,
      assignedClassIds: [], questionIds: [], proctorConfig: DEFAULT_CONFIG
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [eData, cData, qData] = await Promise.all([
        examService.getAll(),
        classService.getAll(),
        questionService.getAll()
    ]);
    setExams(eData);
    setClasses(cData);
    setQuestions(qData);
    setLoading(false);
  };

  const handleOpenModal = (exam?: Exam) => {
      setClassSearchQuery('');
      setQuestionSearchQuery('');
      if (exam) {
          setEditingExam(exam);
          setFormData({ ...exam });
      } else {
          setEditingExam(null);
          setFormData({
              title: '', subject: '', durationMinutes: 60, startTime: new Date().toISOString().slice(0, 16),
              maxAttempts: 1, shuffleQuestions: false, showResults: true,
              assignedClassIds: [], questionIds: [], status: 'upcoming',
              proctorConfig: DEFAULT_CONFIG
          });
      }
      setActiveTab('general');
      setIsModalOpen(true);
  };

  const handleSubmit = async () => {
      if (!formData.title) return alert('Vui lòng nhập tên kỳ thi');
      if (formData.questionIds?.length === 0) return alert('Vui lòng chọn ít nhất một câu hỏi.');

      if (editingExam && editingExam.id) {
          await examService.update(editingExam.id, formData);
      } else {
          await examService.create(formData as Exam);
      }
      setIsModalOpen(false);
      loadData();
  };

  const handleDelete = async (id: string) => {
      if (confirm('Bạn có chắc chắn muốn xóa kỳ thi này không?')) {
          await examService.delete(id);
          loadData();
      }
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
      <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <button onClick={() => onChange(!checked)} className={`text-2xl transition-colors ${checked ? 'text-primary-500' : 'text-gray-300'}`}>
              {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
      </div>
  );

  return (
    <Layout role={user?.role || Role.TEACHER} title="Quản lý Kỳ thi">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm tên kỳ thi hoặc môn học..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => handleOpenModal()}>
            <Plus size={20} /> Tạo Kỳ thi mới
        </ClayButton>
      </div>

      <div className="grid gap-6">
          {exams.map(exam => (
              <ClayCard key={exam.id} className="p-6">
                  <div className="flex justify-between items-start">
                      <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-[10px] font-extrabold rounded-md ${exam.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : exam.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {exam.status.toUpperCase()}
                              </span>
                              <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                                  <Clock size={14} /> {exam.durationMinutes} phút
                              </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                          <p className="text-sm text-gray-500 font-medium">{exam.subject}</p>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => handleOpenModal(exam)} className="p-2 text-gray-400 hover:text-primary-500 transition-all"><Edit2 size={20} /></button>
                          <button onClick={() => handleDelete(exam.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                      </div>
                  </div>
              </ClayCard>
          ))}
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Chỉnh sửa Kỳ thi" : "Tạo Kỳ thi"}
        footer={
            <div className="flex justify-end gap-2">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Hủy</ClayButton>
                <ClayButton onClick={handleSubmit}>Lưu</ClayButton>
            </div>
        }
      >
        <div className="space-y-5">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề kỳ thi</label>
                <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input className="w-full p-4 rounded-2xl bg-gray-50 shadow-clay-inset outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Môn học" />
                <input type="number" className="w-full p-4 rounded-2xl bg-gray-50 shadow-clay-inset outline-none" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} placeholder="Phút" />
            </div>
            <Toggle label="Trộn câu hỏi" checked={formData.shuffleQuestions || false} onChange={v => setFormData({...formData, shuffleQuestions: v})} />
            <Toggle label="Xác thực khuôn mặt" checked={formData.proctorConfig?.requireFaceAuth || false} onChange={v => setFormData({...formData, proctorConfig: {...formData.proctorConfig!, requireFaceAuth: v}})} />
        </div>
      </ClayModal>
    </Layout>
  );
};

export default ExamManagerAdmin;
