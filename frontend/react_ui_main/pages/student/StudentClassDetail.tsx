import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import { Role, ClassGroup, Exam } from '../../types';
import { classService } from '../../services/api/classService';
import { examService } from '../../services/api/examService';
import { ArrowLeft, BookOpen, FileText, FileCheck, Download, Video, Link as LinkIcon, Clock, CheckCircle2 } from 'lucide-react';

const StudentClassDetail: React.FC = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassGroup | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'homework' | 'exams'>('lessons');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    // Fetch class details
    const allClasses = await classService.getAll();
    const foundClass = allClasses.find(c => c.id === classId);
    
    // Fetch exams assigned to this class
    const allExams = await examService.getAll();
    const classExams = allExams.filter(e => e.assignedClassIds?.includes(classId!));
    
    if (foundClass) setCls(foundClass);
    setExams(classExams);
    setLoading(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!cls) return <div className="p-8">Class not found</div>;

  const getLessonIcon = (type: string) => {
      switch(type) {
          case 'video': return <Video size={20} />;
          case 'link': return <LinkIcon size={20} />;
          default: return <FileText size={20} />;
      }
  };

  return (
    <Layout role={Role.STUDENT} title="Classroom">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/student/classes')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{cls.name}</h2>
            <p className="text-gray-500">{cls.subject} • {cls.schedule}</p>
        </div>
      </div>

      <div className="flex mb-6 bg-white p-1 rounded-2xl shadow-sm max-w-lg">
          {[
              { id: 'lessons', label: 'Lessons', icon: <BookOpen size={16} /> },
              { id: 'homework', label: 'Assignments', icon: <FileText size={16} /> },
              { id: 'exams', label: 'Exams', icon: <FileCheck size={16} /> }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                  {tab.icon} {tab.label}
              </button>
          ))}
      </div>

      {/* --- LESSONS TAB --- */}
      {activeTab === 'lessons' && (
          <div className="space-y-4">
              {cls.lessons?.map(lesson => (
                  <ClayCard key={lesson.id} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                              {getLessonIcon(lesson.type)}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800 text-lg">{lesson.title}</h4>
                              <p className="text-xs text-gray-500 capitalize">{lesson.type} • {lesson.format.toUpperCase()} • {new Date(lesson.dateAdded).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <ClayButton variant="neutral" className="py-2 px-4 text-xs">
                          <Download size={14} /> Open
                      </ClayButton>
                  </ClayCard>
              ))}
              {(!cls.lessons || cls.lessons.length === 0) && <p className="text-gray-500 text-center py-10 bg-white rounded-3xl">No lessons available yet.</p>}
          </div>
      )}

      {/* --- HOMEWORK TAB --- */}
      {activeTab === 'homework' && (
          <div className="grid md:grid-cols-2 gap-4">
              {cls.assignments?.map(hw => (
                  <ClayCard key={hw.id} className="p-6">
                      <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-lg text-gray-800">{hw.title}</h4>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">Due {hw.dueDate}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{hw.description}</p>
                      <ClayButton className="w-full py-2 text-sm">Submit Work</ClayButton>
                  </ClayCard>
              ))}
              {(!cls.assignments || cls.assignments.length === 0) && <p className="text-gray-500 text-center py-10 col-span-2 bg-white rounded-3xl">No assignments due.</p>}
          </div>
      )}

      {/* --- EXAMS TAB --- */}
      {activeTab === 'exams' && (
          <div className="space-y-4">
              {exams.map(exam => {
                  const isCompleted = exam.status === 'completed'; // Simplified check for demo
                  return (
                    <ClayCard key={exam.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">{exam.title}</h4>
                                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                    <span>{exam.durationMinutes} mins</span>
                                    <span>{exam.questionIds.length} Questions</span>
                                </div>
                                <span className={`inline-block mt-2 text-xs font-bold px-2 py-1 rounded ${isCompleted ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                                    {isCompleted ? 'COMPLETED' : 'LIVE / UPCOMING'}
                                </span>
                            </div>
                        </div>

                        {exam.status === 'live' && (
                             <ClayButton onClick={() => navigate(`/student`)}>Go to Dashboard</ClayButton>
                        )}
                        
                        {isCompleted && (
                            exam.showResults ? (
                                <ClayButton variant="neutral" onClick={() => navigate(`/student/exam-result/${exam.id}`)}>
                                    View Results
                                </ClayButton>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Results Hidden</span>
                            )
                        )}
                    </ClayCard>
                  )
              })}
              {exams.length === 0 && <p className="text-gray-500 text-center py-10 bg-white rounded-3xl">No exams assigned to this class.</p>}
          </div>
      )}
    </Layout>
  );
};

export default StudentClassDetail;
