import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Question, QuestionType } from '../../types';
import { questionService } from '../../services/api/questionService';
import { Plus, Edit2, Trash2, Tag, CheckCircle } from 'lucide-react';

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState<Partial<Question>>({
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctAnswer: '',
    tags: []
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const data = await questionService.getAll();
    setQuestions(data);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.text) return;

    // Clean up options if not MCQ
    const payload = { ...formData };
    if (payload.type !== QuestionType.MULTIPLE_CHOICE) {
        delete payload.options;
    }

    if (editingQ && editingQ.id) {
        await questionService.update(editingQ.id, payload);
    } else {
        await questionService.create(payload as Question);
    }
    setIsModalOpen(false);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this question?')) {
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
            options: ['', '', '', ''], correctAnswer: '', tags: [] 
        });
    }
    setIsModalOpen(true);
  };

  const updateOption = (index: number, val: string) => {
    const newOpts = [...(formData.options || [])];
    newOpts[index] = val;
    setFormData({ ...formData, options: newOpts });
  };

  return (
    <Layout role={Role.TEACHER} title="Question Bank">
        <div className="flex justify-end mb-6">
            <ClayButton onClick={() => openModal()}><Plus size={20} /> Add Question</ClayButton>
        </div>

        <div className="space-y-4">
            {questions.map(q => (
                <ClayCard key={q.id} className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {q.difficulty}
                                </span>
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-600">
                                    {q.type}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{q.text}</h3>
                            
                            {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                                <ul className="grid grid-cols-2 gap-2 mt-2">
                                    {q.options.map((opt, idx) => (
                                        <li key={idx} className={`text-sm p-2 rounded-lg border ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                            {String.fromCharCode(65 + idx)}. {opt}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                             <button onClick={() => openModal(q)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><Edit2 size={18} /></button>
                             <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500"><Trash2 size={18} /></button>
                        </div>
                    </div>
                </ClayCard>
            ))}
        </div>

        <ClayModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingQ ? "Edit Question" : "Add Question"}
            footer={
                <div className="flex justify-end gap-3">
                    <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Cancel</ClayButton>
                    <ClayButton onClick={handleSubmit}>Save</ClayButton>
                </div>
            }
        >
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Question Text</label>
                    <textarea 
                        className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none h-24 resize-none" 
                        value={formData.text} 
                        onChange={e => setFormData({...formData, text: e.target.value})} 
                        placeholder="Enter the question here..." 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select 
                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value as QuestionType})}
                        >
                            {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
                        <select 
                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                            value={formData.difficulty}
                            onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                     </div>
                </div>

                {formData.type === QuestionType.MULTIPLE_CHOICE && (
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Options</label>
                        {formData.options?.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <span className="text-xs font-bold w-6">{String.fromCharCode(65+i)}</span>
                                <input 
                                    className="flex-1 p-2 rounded-lg bg-gray-50 shadow-clay-inset outline-none text-sm" 
                                    value={opt} 
                                    onChange={e => updateOption(i, e.target.value)} 
                                />
                                <input 
                                    type="radio" 
                                    name="correct" 
                                    checked={formData.correctAnswer === opt && opt !== ''} 
                                    onChange={() => setFormData({...formData, correctAnswer: opt})}
                                />
                            </div>
                        ))}
                        <p className="text-xs text-gray-400 mt-1">Select the radio button next to the correct answer.</p>
                    </div>
                )}
            </div>
        </ClayModal>
    </Layout>
  );
};

export default QuestionBank;
