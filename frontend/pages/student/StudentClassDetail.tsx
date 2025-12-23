
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import { Role, ClassGroup, Exam } from '../../types';
import { classService } from '../../services/api/classService';
import { examService } from '../../services/api/examService';
import { getCurrentUser } from '../../services/mockService';
import { ArrowLeft, BookOpen, FileText, FileCheck, Download, Video, Link as LinkIcon, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const StudentClassDetail: React.FC = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<ClassGroup | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'homework' | 'exams'>(
    (searchParams.get('tab') as any) || 'lessons'
  );
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    const allClasses = await classService.getAll();
    const found = allClasses.find(c => c.id === classId);
    
    const allExams = await examService.getAll();
    const classExams = allExams.filter(e => e.assignedClassIds?.includes(classId!));
    
    if (found) setCourse(found);
    setExams(classExams);
    setLoading(false);
  };

  if (loading) return <Layout role={Role.STUDENT} title="Đang tải..."><div className="p-8 text-center animate-pulse">Đang tải dữ liệu khóa học...</div></Layout>;
  if (!course) return <Layout role={Role.STUDENT} title="Lỗi"><div className="p-8 text-center">Không tìm thấy khóa học</div></Layout>;

  const getLessonIcon = (type: string) => {
      switch(type) {
          case 'video': return <Video size={20} />;
          case 'link': return <LinkIcon size={20} />;
          default: return <FileText size={20} />;
      }
  };

  const handleStartExam = (examId: string) => {
    // Kiểm tra avatar
    if (!user?.avatarUrl || user.avatarUrl.includes('picsum.photos') || user.avatarUrl === '') {
        alert('Bạn cần cập nhật ảnh đại diện thật (không phải ảnh mặc định) để AI nhận diện khuôn mặt trước khi thi.');
        navigate('/profile-edit?redirect=' + encodeURIComponent(window.location.hash));
        return;
    }
    navigate(`/exam/${examId}?courseId=${course.id}`);
  };

  return (
    <Layout role={Role.STUDENT} title="Chi tiết Khóa học">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/student/courses')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
            <p className="text-gray-500 text-sm">{course.subject} • {course.teacherName} • {course.schedule}</p>
        </div>
      </div>

      <div className="flex mb-8 bg-gray-200 p-1 rounded-3xl shadow-clay-inset max-w-lg">
          {[
              { id: 'lessons', label: 'Bài học', icon: <BookOpen size={16} /> },
              { id: 'homework', label: 'Bài tập', icon: <FileText size={16} /> },
              { id: 'exams', label: 'Kỳ thi', icon: <FileCheck size={16} /> }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-clay' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                  {tab.icon} {tab.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {/* LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {course.lessons?.map(lesson => (
                  <ClayCard 
                    key={lesson.id} 
                    className="p-5 flex items-center justify-between group cursor-pointer hover:scale-[1.01] transition-all"
                    onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-clay-sm ${lesson.type === 'video' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                              {getLessonIcon(lesson.type)}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{lesson.type} • {lesson.format}</p>
                          </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </ClayCard>
              ))}
              {(!course.lessons || course.lessons.length === 0) && <p className="text-gray-400 italic text-center py-10">Khóa học hiện chưa có bài học nào.</p>}
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {course.assignments?.map(hw => (
                  <ClayCard 
                    key={hw.id} 
                    className="p-6 flex flex-col h-full cursor-pointer hover:scale-[1.02] transition-all group"
                    onClick={() => navigate(`/student/assignment/${hw.id}`)}
                  >
                      <div className="flex justify-between items-start mb-4">
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded uppercase">Bài tập về nhà</span>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800 mb-2">{hw.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6">{hw.description}</p>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-red-500 uppercase tracking-tighter flex items-center gap-1"><Clock size={12} /> Hạn nộp: {hw.dueDate}</span>
                          <span className="text-primary-500 uppercase">Chi tiết & Nộp bài</span>
                      </div>
                  </ClayCard>
              ))}
              {(!course.assignments || course.assignments.length === 0) && <p className="text-gray-400 italic text-center py-10 col-span-2">Không có bài tập nào được giao.</p>}
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === 'exams' && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {exams.map(exam => {
                  const isCompleted = exam.status === 'completed';
                  return (
                    <ClayCard key={exam.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-primary-500">
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">{exam.title}</h4>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500 font-medium">
                                    <span>{exam.durationMinutes} phút</span>
                                    <span>{exam.questionIds.length} Câu hỏi</span>
                                </div>
                                <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${isCompleted ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600'}`}>
                                    {isCompleted ? 'Đã kết thúc' : 'Sẵn sàng / Đang diễn ra'}
                                </span>
                            </div>
                        </div>

                        {!isCompleted ? (
                             <ClayButton onClick={() => handleStartExam(exam.id)}>Vào làm bài</ClayButton>
                        ) : (
                            exam.showResults ? (
                                <ClayButton variant="neutral" onClick={() => navigate(`/student/exam-result/${exam.id}`)}>
                                    Xem kết quả
                                </ClayButton>
                            ) : (
                                <span className="text-xs text-gray-400 italic font-bold">Kết quả đang được chấm</span>
                            )
                        )}
                    </ClayCard>
                  )
              })}
              {exams.length === 0 && <p className="text-gray-400 italic text-center py-10 font-medium">Hiện không có kỳ thi nào được gán cho khóa học này.</p>}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentClassDetail;
