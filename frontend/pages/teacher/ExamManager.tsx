import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, Exam, ClassGroup, Question, ProctorConfig } from '../../types';
import { examService } from '../../services/api/examService';
import { classService } from '../../services/api/classService';
import { questionService } from '../../services/api/questionService';
import { Plus, Edit2, Trash2, Calendar, Clock, Book, AlertTriangle, CheckSquare, Square, ToggleLeft, ToggleRight } from 'lucide-react';

// Default Config
const DEFAULT_CONFIG: ProctorConfig = {
    requireFaceAuth: true,
    continuousFaceAuth: true,
    detectCheating: true,
    maxViolations: 3,
    allowHeadphones: false
};

const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'questions' | 'proctoring'>('general');

  // Form State
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
      if (!formData.title) return alert('Title is required');
      if (formData.questionIds?.length === 0) return alert('Please assign at least one question.');

      if (editingExam && editingExam.id) {
          await examService.update(editingExam.id, formData);
      } else {
          await examService.create(formData as Exam);
      }
      setIsModalOpen(false);
      loadData();
  };

  const handleDelete = async (id: string) => {
      if (confirm('Delete this exam?')) {
          await examService.delete(id);
          loadData();
      }
  };

  // Helper for Toggle Switches
  const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
      <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <button onClick={() => onChange(!checked)} className={`text-2xl transition-colors ${checked ? 'text-primary-500' : 'text-gray-300'}`}>
              {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
      </div>
  );

  return (
    <Layout role={Role.TEACHER} title="Exam Management">
      <div className="flex justify-end mb-6">
        <ClayButton onClick={() => handleOpenModal()}><Plus size={20} /> Create New Exam</ClayButton>
      </div>

      <div className="grid gap-4">
          {exams.map(exam => (
              <ClayCard key={exam.id} className="p-6">
                  <div className="flex justify-between items-start">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs font-bold rounded-md ${exam.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                                  {exam.status.toUpperCase()}
                              </span>
                              <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                                  <Clock size={14} /> {exam.durationMinutes} mins
                              </span>
                              <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                                  <Book size={14} /> {exam.questionIds.length} Questions
                              </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">Subject: {exam.subject}</p>
                          <div className="mt-3 flex gap-2">
                              {exam.assignedClassIds.map(cid => {
                                  const cls = classes.find(c => c.id === cid);
                                  return cls ? <span key={cid} className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">{cls.name}</span> : null
                              })}
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => handleOpenModal(exam)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500"><Trash2 size={18} /></button>
                      </div>
                  </div>
              </ClayCard>
          ))}
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Edit Exam" : "Create Exam"}
        footer={
            <div className="flex justify-between w-full">
                <div className="text-xs text-gray-400 flex items-center">
                    {activeTab === 'general' ? 'Step 1 of 3' : activeTab === 'questions' ? 'Step 2 of 3' : 'Step 3 of 3'}
                </div>
                <div className="flex gap-2">
                    {activeTab !== 'general' && <ClayButton variant="neutral" onClick={() => setActiveTab(activeTab === 'proctoring' ? 'questions' : 'general')}>Back</ClayButton>}
                    {activeTab !== 'proctoring' 
                        ? <ClayButton onClick={() => setActiveTab(activeTab === 'general' ? 'questions' : 'proctoring')}>Next</ClayButton>
                        : <ClayButton onClick={handleSubmit}>Finish & Save</ClayButton>
                    }
                </div>
            </div>
        }
      >
        <div className="flex mb-6 bg-gray-200 p-1 rounded-xl">
            {['general', 'questions', 'proctoring'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* --- TAB 1: GENERAL --- */}
        {activeTab === 'general' && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Exam Title</label>
                    <input className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Final Exam 2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <input className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Duration (min)</label>
                        <input type="number" className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                        <input type="datetime-local" className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Max Attempts</label>
                        <input type="number" min="1" className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.maxAttempts} onChange={e => setFormData({...formData, maxAttempts: parseInt(e.target.value)})} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Classes</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {classes.map(cls => (
                            <label key={cls.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${formData.assignedClassIds?.includes(cls.id) ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-100'}`}>
                                <input 
                                    type="checkbox" 
                                    className="accent-primary-500"
                                    checked={formData.assignedClassIds?.includes(cls.id) || false}
                                    onChange={(e) => {
                                        const ids = formData.assignedClassIds || [];
                                        if (e.target.checked) setFormData({...formData, assignedClassIds: [...ids, cls.id]});
                                        else setFormData({...formData, assignedClassIds: ids.filter(id => id !== cls.id)});
                                    }}
                                />
                                <span className="text-sm">{cls.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Toggle label="Shuffle Questions" checked={formData.shuffleQuestions || false} onChange={v => setFormData({...formData, shuffleQuestions: v})} />
                    <Toggle label="Show Result After" checked={formData.showResults || false} onChange={v => setFormData({...formData, showResults: v})} />
                </div>
            </div>
        )}

        {/* --- TAB 2: QUESTIONS --- */}
        {activeTab === 'questions' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-700">Select Questions</h4>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-md font-bold">
                        {formData.questionIds?.length || 0} selected
                    </span>
                </div>
                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                    {questions.map(q => {
                        const isSelected = formData.questionIds?.includes(q.id);
                        return (
                            <div 
                                key={q.id} 
                                onClick={() => {
                                    const ids = formData.questionIds || [];
                                    if (isSelected) setFormData({...formData, questionIds: ids.filter(id => id !== q.id)});
                                    else setFormData({...formData, questionIds: [...ids, q.id]});
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-primary-50 border-primary-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${isSelected ? 'text-primary-500' : 'text-gray-300'}`}>
                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-1">
                                            <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-1 rounded">{q.type}</span>
                                            <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-1 rounded">{q.difficulty}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 font-medium line-clamp-2">{q.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- TAB 3: PROCTORING --- */}
        {activeTab === 'proctoring' && formData.proctorConfig && (
            <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-start mb-4">
                    <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                    <p className="text-xs text-orange-800">
                        Strict proctoring may require higher bandwidth for students. Ensure students are aware of camera requirements.
                    </p>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Identity Verification</h4>
                    <Toggle 
                        label="Require Face Auth (Pre-Exam)" 
                        checked={formData.proctorConfig.requireFaceAuth} 
                        onChange={v => setFormData({ ...formData, proctorConfig: { ...formData.proctorConfig!, requireFaceAuth: v } })} 
                    />
                    <Toggle 
                        label="Continuous Face Scan (During)" 
                        checked={formData.proctorConfig.continuousFaceAuth} 
                        onChange={v => setFormData({ ...formData, proctorConfig: { ...formData.proctorConfig!, continuousFaceAuth: v } })} 
                    />
                </div>
                
                <div className="h-px bg-gray-200 my-2"></div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Cheat Detection AI</h4>
                        <ToggleLeft className={formData.proctorConfig.detectCheating ? "text-primary-500" : "text-gray-300"} size={24} />
                    </div>
                    
                    <Toggle 
                        label="Enable AI Detection" 
                        checked={formData.proctorConfig.detectCheating} 
                        onChange={v => setFormData({ ...formData, proctorConfig: { ...formData.proctorConfig!, detectCheating: v } })} 
                    />

                    {formData.proctorConfig.detectCheating && (
                        <div className="pl-4 border-l-2 border-primary-200 space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Max Violation Threshold</label>
                                <input 
                                    type="number" min="1" max="10"
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 outline-none" 
                                    value={formData.proctorConfig.maxViolations} 
                                    onChange={e => setFormData({ ...formData, proctorConfig: { ...formData.proctorConfig!, maxViolations: parseInt(e.target.value) } })} 
                                />
                                <p className="text-xs text-gray-400 mt-1">Exam terminates automatically if exceeded.</p>
                            </div>
                            <Toggle 
                                label="Allow Headphones" 
                                checked={formData.proctorConfig.allowHeadphones} 
                                onChange={v => setFormData({ ...formData, proctorConfig: { ...formData.proctorConfig!, allowHeadphones: v } })} 
                            />
                        </div>
                    )}
                </div>
            </div>
        )}

      </ClayModal>
    </Layout>
  );
};

export default ExamManager;
