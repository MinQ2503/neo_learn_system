
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Question, QuestionType } from '../../types';
import { questionService } from '../../services/api/questionService';
import { getCurrentUser } from '../../services/mockService';
import { Plus, Edit2, Trash2, Search, HelpCircle, CheckCircle } from 'lucide-react';

const QuestionBankAdmin: React.FC = () => {
  const user = getCurrentUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState<Partial<Question>>({
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctAnswer: [],
    tags: [],
    creatorName: user?.name || 'Giáo viên'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const data = await questionService.getAll();
    setQuestions(data);
    setLoading(false);
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.text) return;
    setLoading(true);
    try {
      if (editingQ && editingQ.id) {
          await questionService.update(editingQ.id, formData);
      } else {
          await questionService.create(formData as Question);
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
        await questionService.delete(id);
        fetchQuestions();
    }
  };

  const openModal = (q?: Question) => {
    if (q) {
        setEditingQ(q);
        setFormData({ ...q });
    } else {
        setEditingQ(null);
        setFormData({ 
            text: '', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'Medium', 
            options: ['', '', '', ''], correctAnswer: [], tags: [],
            creatorName: user?.name || 'Giáo viên'
        });
    }
    setIsModalOpen(true);
  };

  return (
    <Layout role={user?.role || Role.TEACHER} title="Ngân hàng Câu hỏi">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm câu hỏi..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ClayButton onClick={() => openModal()}>
            <Plus size={20} /> Thêm Câu hỏi
        </ClayButton>
      </div>

      <div className="space-y-6">
          {filteredQuestions.map(q => (
              <ClayCard key={q.id} className="p-6 relative group">
                  <div className="flex justify-between items-start">
                      <div className="flex-1">
                          <span className="text-[10px] font-extrabold px-2 py-1 rounded-md uppercase bg-blue-100 text-blue-600 mb-2 inline-block">
                              {q.type}
                          </span>
                          <h3 className="text-lg font-bold text-gray-800 mb-4">{q.text}</h3>
                      </div>
                      <div className="flex gap-2">
                           <button onClick={() => openModal(q)} className="p-2 text-gray-400 hover:text-primary-500 transition-all"><Edit2 size={18} /></button>
                           <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                  </div>
              </ClayCard>
          ))}
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQ ? "Chỉnh sửa Câu hỏi" : "Thêm Câu hỏi mới"}
        footer={<ClayButton onClick={handleSubmit}>Lưu</ClayButton>}
      >
        <textarea 
            className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset h-32 resize-none outline-none" 
            value={formData.text} 
            onChange={e => setFormData({...formData, text: e.target.value})} 
            placeholder="Nhập nội dung câu hỏi..." 
        />
      </ClayModal>
    </Layout>
  );
};

export default QuestionBankAdmin;
