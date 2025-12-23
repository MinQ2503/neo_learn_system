
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, ClassGroup, User, Lesson, Assignment, Exam, Question, QuestionType, ProctorConfig, AssignmentSubmission } from '../../types';
import { classService } from '../../services/api/classService';
import { userService } from '../../services/api/userService';
import { examService } from '../../services/api/examService';
import { lessonService } from '../../services/api/lessonService';
import { assignmentService } from '../../services/api/assignmentService';
import { questionService } from '../../services/api/questionService';
import { 
  ArrowLeft, Users, BookOpen, FileText, Plus, Trash2, Edit2, 
  Calendar, FileCheck, Search, Video, Link as LinkIcon, 
  User as UserIcon, Clock, ShieldCheck, AlignLeft, FileJson, 
  CheckCircle, Hash, Mail, Camera, Phone, AlertTriangle, 
  ToggleLeft, ToggleRight, Square, CheckSquare, ExternalLink, Star, Save
} from 'lucide-react';

type TabType = 'lessons' | 'assignments' | 'exams' | 'students';

const CourseDetailAdmin: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<ClassGroup | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [loading, setLoading] = useState(true);

  // Data Selectors
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  
  // Search Queries per tab
  const [searchQueries, setSearchQueries] = useState({
    lessons: '',
    assignments: '',
    exams: '',
    students: ''
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TabType | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [examTab, setExamTab] = useState<'general' | 'questions' | 'proctoring'>('general');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');

  // Submissions Modal State
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'submitted' | 'pending'>('submitted');
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  
  // Grading form
  const [gradingForm, setGradingForm] = useState({ grade: 0, feedback: '', gradedBy: 'Admin System' });

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    const [allCourses, sData, eData, qData] = await Promise.all([
      classService.getAll(),
      userService.getUsersByRole(Role.STUDENT),
      examService.getAll(),
      questionService.getAll()
    ]);
    const found = allCourses.find(c => c.id === courseId);
    if (found) setCourse(found);
    setAllStudents(sData);
    setAllExams(eData);
    setAllQuestions(qData);
    setLoading(false);
  };

  const handleUpdateSearch = (tab: TabType, val: string) => {
    setSearchQueries(prev => ({ ...prev, [tab]: val }));
  };

  // --- ACTIONS ---

  const handleOpenEdit = (type: TabType, item: any) => {
    setEditingType(type);
    setFormData({ ...item });
    setExamTab('general');
    setIsEditModalOpen(true);
  };

  const handleUnassign = async (type: TabType, id: string) => {
    if (!course) return;
    const confirmMsg = `Bạn có chắc chắn muốn hủy gán ${
      type === 'lessons' ? 'bài học' : 
      type === 'assignments' ? 'bài tập' : 
      type === 'exams' ? 'kỳ thi' : 'học sinh'
    } này khỏi khóa học?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      if (type === 'lessons') {
        const newLessons = (course.lessons || []).filter(l => l.id !== id);
        await classService.update(course.id, { lessons: newLessons });
      } else if (type === 'assignments') {
        const newAssignments = (course.assignments || []).filter(a => a.id !== id);
        await classService.update(course.id, { assignments: newAssignments });
      } else if (type === 'exams') {
        await examService.toggleClassAssignment(id, course.id, false);
      } else if (type === 'students') {
        const newStudentIds = (course.studentIds || []).filter(sid => sid !== id);
        await classService.update(course.id, { studentIds: newStudentIds });
      }
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi hủy gán.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingType || !formData || !course) return;
    setLoading(true);
    try {
      if (editingType === 'lessons') {
        await lessonService.updateGlobal(formData.id, formData);
      } else if (editingType === 'assignments') {
        await assignmentService.updateGlobal(formData.id, formData);
      } else if (editingType === 'exams') {
        await examService.update(formData.id, formData);
      } else if (editingType === 'students') {
        await userService.update(formData.id, formData);
      }
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMISSIONS ACTIONS ---
  const openSubmissions = async (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setLoading(true);
    try {
        const subs = await assignmentService.getSubmissions(assignment.id);
        setSubmissions(subs);
        setIsSubmissionsModalOpen(true);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!selectedSub || !activeAssignment) return;
    setLoading(true);
    try {
      await assignmentService.gradeSubmission(selectedSub.id, gradingForm);
      // Refresh local state
      const updatedSubs = await assignmentService.getSubmissions(activeAssignment.id);
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

  // --- FILTERS ---
  const filteredLessons = (course?.lessons || []).filter(l => 
    l.title.toLowerCase().includes(searchQueries.lessons.toLowerCase())
  );
  const filteredAssignments = (course?.assignments || []).filter(a => 
    a.title.toLowerCase().includes(searchQueries.assignments.toLowerCase())
  );
  const courseExams = allExams.filter(e => e.assignedClassIds?.includes(course?.id || ''));
  const filteredExams = courseExams.filter(e => 
    e.title.toLowerCase().includes(searchQueries.exams.toLowerCase())
  );
  const enrolledStudents = allStudents.filter(s => course?.studentIds?.includes(s.id));
  const filteredStudents = enrolledStudents.filter(s => 
    s.name.toLowerCase().includes(searchQueries.students.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(searchQueries.students.toLowerCase())
  );

  const SearchBar = ({ tab }: { tab: TabType }) => (
    <div className="relative mb-4">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input 
        type="text" 
        placeholder="Tìm kiếm trong danh sách..." 
        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white shadow-clay-inset border-none outline-none text-sm transition-all focus:ring-2 focus:ring-primary-200"
        value={searchQueries[tab]}
        onChange={(e) => handleUpdateSearch(tab, e.target.value)}
      />
    </div>
  );

  // Helper for Toggle Switches in Exam Edit
  const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button onClick={() => onChange(!checked)} className={`text-2xl transition-colors ${checked ? 'text-primary-500' : 'text-gray-300'}`}>
            {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
    </div>
  );

  if (loading && !course && !isSubmissionsModalOpen) return <div className="p-8 text-center">Đang tải dữ liệu khóa học...</div>;
  if (!course) return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy khóa học này.</div>;

  return (
    <Layout role={Role.ADMIN} title="Chi tiết Khóa học">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/courses')} className="p-3 bg-white rounded-2xl shadow-clay text-gray-500 hover:text-primary-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">{course.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 font-medium">
              <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded-md font-bold uppercase text-[10px]">{course.subject}</span>
              <span className="flex items-center gap-1"><UserIcon size={14} /> {course.teacherName}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {course.schedule}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-gray-200 p-1.5 rounded-3xl mb-8 overflow-x-auto no-scrollbar shadow-clay-inset max-w-3xl">
        {[
          { id: 'lessons', label: 'Bài học', icon: <BookOpen size={18} /> },
          { id: 'assignments', label: 'Bài tập', icon: <FileText size={18} /> },
          { id: 'exams', label: 'Kỳ thi', icon: <FileCheck size={18} /> },
          { id: 'students', label: 'Học sinh', icon: <Users size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-clay text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Danh sách Bài học</h3>
              <ClayButton className="py-2 text-xs" onClick={() => navigate('/admin/lessons')}><Plus size={16} /> Quản lý Bài học</ClayButton>
            </div>
            <SearchBar tab="lessons" />
            <div className="grid gap-4">
              {filteredLessons.map(lesson => (
                <ClayCard key={lesson.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-clay-sm ${lesson.type === 'video' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                      {lesson.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                      <p className="text-xs text-gray-400 capitalize">{lesson.type} • {lesson.format.toUpperCase()} • Thêm ngày {new Date(lesson.dateAdded).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit('lessons', lesson)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleUnassign('lessons', lesson.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Trash2 size={16} /></button>
                  </div>
                </ClayCard>
              ))}
              {filteredLessons.length === 0 && <div className="p-10 text-center text-gray-400 font-medium bg-white/50 rounded-3xl shadow-clay-inset italic">Không tìm thấy bài học nào.</div>}
            </div>
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Danh sách Bài tập</h3>
              <ClayButton className="py-2 text-xs" onClick={() => navigate('/admin/assignments')}><Plus size={16} /> Quản lý Bài tập</ClayButton>
            </div>
            <SearchBar tab="assignments" />
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAssignments.map(hw => (
                <ClayCard key={hw.id} className="p-6 relative group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-extrabold rounded uppercase tracking-wider">Bài tập về nhà</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit('assignments', hw)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleUnassign('assignments', hw.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg mb-2">{hw.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">{hw.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter"><Clock size={12} /> Hạn nộp: {hw.dueDate}</span>
                    </div>
                    <button 
                        onClick={() => openSubmissions(hw)}
                        className="w-full py-3 rounded-xl bg-primary-50 text-primary-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-500 hover:text-white transition-all shadow-clay-sm"
                    >
                        <Users size={16} /> Quản lý nộp bài
                    </button>
                  </div>
                </ClayCard>
              ))}
              {filteredAssignments.length === 0 && <div className="col-span-2 p-10 text-center text-gray-400 font-medium bg-white/50 rounded-3xl shadow-clay-inset italic">Không tìm thấy bài tập nào.</div>}
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === 'exams' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Danh sách Kỳ thi</h3>
              <ClayButton className="py-2 text-xs" onClick={() => navigate('/admin/exams')}><Plus size={16} /> Quản lý Kỳ thi</ClayButton>
            </div>
            <SearchBar tab="exams" />
            <div className="grid gap-4">
              {filteredExams.map(exam => (
                <ClayCard key={exam.id} className="p-5 flex items-center justify-between group border-l-4 border-primary-500">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-clay-sm ${exam.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                      {exam.status === 'live' ? <ShieldCheck size={20} className="animate-pulse" /> : <FileCheck size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{exam.title}</h4>
                      <p className="text-xs text-gray-400">Thời lượng: {exam.durationMinutes} phút • Số câu hỏi: {exam.questionIds.length}</p>
                      <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${exam.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>{exam.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit('exams', exam)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleUnassign('exams', exam.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Trash2 size={16} /></button>
                  </div>
                </ClayCard>
              ))}
              {filteredExams.length === 0 && <div className="p-10 text-center text-gray-400 font-medium bg-white/50 rounded-3xl shadow-clay-inset italic">Không có kỳ thi nào cho khóa học này.</div>}
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Danh sách Học sinh ({filteredStudents.length})</h3>
              <ClayButton className="py-2 text-xs" onClick={() => navigate('/admin/students')}><Plus size={16} /> Quản lý Học sinh</ClayButton>
            </div>
            <SearchBar tab="students" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <ClayCard key={student.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-lg shadow-clay-sm overflow-hidden">
                      {student.avatarUrl ? <img src={student.avatarUrl} className="w-full h-full object-cover" /> : student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight">{student.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{student.studentId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit('students', student)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleUnassign('students', student.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-clay-sm transition-all"><Trash2 size={16} /></button>
                  </div>
                </ClayCard>
              ))}
              {filteredStudents.length === 0 && <div className="col-span-full p-10 text-center text-gray-400 font-medium bg-white/50 rounded-3xl shadow-clay-inset italic">Không tìm thấy học sinh phù hợp.</div>}
            </div>
          </div>
        )}
      </div>

      {/* --- SUBMISSIONS MODAL --- */}
      <ClayModal
        isOpen={isSubmissionsModalOpen}
        onClose={() => { setIsSubmissionsModalOpen(false); setSelectedSub(null); }}
        title={`Quản lý nộp bài: ${activeAssignment?.title}`}
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
                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${subTab === 'submitted' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                Đã nộp ({submissions.filter(s => s.status !== 'pending').length})
                            </button>
                            <button 
                                onClick={() => setSubTab('pending')}
                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${subTab === 'pending' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                Chưa nộp ({submissions.filter(s => s.status === 'pending').length})
                            </button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Tìm học sinh..."
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white shadow-clay-inset outline-none"
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
                                        <h5 className="font-bold text-gray-800 text-xs">{sub.studentName}</h5>
                                        {sub.status !== 'pending' ? (
                                            <span className="text-[9px] text-gray-400 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(sub.submittedAt!).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Chưa nộp</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {sub.status === 'graded' ? (
                                        <div className="text-right">
                                            <span className="block text-[9px] font-bold text-green-600 uppercase">Đã chấm</span>
                                            <span className="text-xs font-bold text-gray-700">{sub.grade}/10</span>
                                        </div>
                                    ) : sub.status === 'submitted' ? (
                                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-[9px] font-bold rounded-md uppercase">Chờ chấm</span>
                                    ) : null}
                                    {sub.status !== 'pending' && <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />}
                                </div>
                            </ClayCard>
                        ))}
                    </div>
                </>
            ) : (
                /* --- GRADING VIEW --- */
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <button 
                        onClick={() => setSelectedSub(null)}
                        className="flex items-center gap-2 text-primary-600 font-bold text-xs mb-6 hover:translate-x-[-4px] transition-transform"
                    >
                        <ArrowLeft size={14} /> Quay lại danh sách
                    </button>

                    <div className="space-y-6">
                        <ClayCard className="p-6 bg-white border border-gray-100">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Nội dung bài làm</h4>
                            <div className="p-4 rounded-xl bg-gray-50 shadow-clay-inset text-gray-700 text-xs leading-relaxed whitespace-pre-wrap min-h-[100px]">
                                {selectedSub.content || "Học sinh không để lại ghi chú nội dung."}
                            </div>
                        </ClayCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ClayCard className="p-6 bg-white border-2 border-primary-50">
                                <h4 className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Star size={14} /> Chấm điểm
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Điểm (0-10)</label>
                                        <input 
                                            type="number" min="0" max="10" step="0.5"
                                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none text-center text-xl font-bold text-primary-600"
                                            value={selectedSub.status === 'graded' ? selectedSub.grade : gradingForm.grade}
                                            onChange={e => setGradingForm({...gradingForm, grade: parseFloat(e.target.value)})}
                                            disabled={selectedSub.status === 'graded'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Nhận xét</label>
                                        <textarea 
                                            className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none text-xs h-24 resize-none"
                                            placeholder="Ghi nhận xét..."
                                            value={selectedSub.status === 'graded' ? selectedSub.feedback : gradingForm.feedback}
                                            onChange={e => setGradingForm({...gradingForm, feedback: e.target.value})}
                                            disabled={selectedSub.status === 'graded'}
                                        />
                                    </div>
                                    {selectedSub.status !== 'graded' ? (
                                        <ClayButton className="w-full py-3 text-xs" onClick={handleGradeSubmit} disabled={loading}>
                                            <Save size={16} /> Lưu điểm
                                        </ClayButton>
                                    ) : (
                                        <div className="text-center p-2 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase">Bài đã được chấm</div>
                                    )}
                                </div>
                            </ClayCard>

                            <ClayCard className="p-6 bg-white border border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tệp đính kèm</h4>
                                <div className="space-y-2">
                                    {selectedSub.fileUrls?.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                            <FileText size={16} />
                                            <span className="text-[10px] font-bold truncate">Tai_lieu_{i+1}.pdf</span>
                                        </a>
                                    ))}
                                    {(!selectedSub.fileUrls || selectedSub.fileUrls.length === 0) && (
                                        <p className="text-[10px] text-gray-400 italic">Không có tệp đính kèm.</p>
                                    )}
                                </div>
                            </ClayCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </ClayModal>

      {/* --- REUSABLE EDIT MODAL --- */}
      <ClayModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Chỉnh sửa ${editingType === 'lessons' ? 'Bài học' : editingType === 'assignments' ? 'Bài tập' : editingType === 'exams' ? 'Kỳ thi' : 'Học sinh'}`}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ClayButton variant="neutral" onClick={() => setIsEditModalOpen(false)}>Hủy</ClayButton>
            <ClayButton onClick={handleSaveEdit}>Lưu Thay đổi</ClayButton>
          </div>
        }
      >
        {formData && (
          <div className="space-y-5">
            {/* LESSON EDIT FORM */}
            {editingType === 'lessons' && (
              <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tiêu đề bài học</label>
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Loại</label>
                      <select className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="document">Tài liệu</option>
                          <option value="video">Video</option>
                          <option value="audio">Âm thanh</option>
                          <option value="link">Liên kết</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Định dạng</label>
                      <select className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                          <option value="pdf">PDF</option>
                          <option value="docx">Word</option>
                          <option value="xlsx">Excel</option>
                          <option value="mp4">MP4</option>
                          <option value="url">URL</option>
                      </select>
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Đường dẫn (URL)</label>
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                </div>
              </div>
            )}

            {/* ASSIGNMENT EDIT FORM */}
            {editingType === 'assignments' && (
              <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên bài tập</label>
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ngày bắt đầu</label>
                      <input type="date" className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hạn nộp</label>
                      <input type="date" className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mô tả</label>
                    <textarea className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none h-32 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            )}

            {/* EXAM EDIT FORM (Simplified matching ExamManager UI) */}
            {editingType === 'exams' && (
              <div className="space-y-4">
                <div className="flex bg-gray-200 p-1 rounded-2xl mb-4">
                    {['general', 'questions', 'proctoring'].map((tab) => (
                        <button key={tab} onClick={() => setExamTab(tab as any)} className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl uppercase tracking-widest transition-all ${examTab === tab ? 'bg-white shadow-clay-sm text-primary-600' : 'text-gray-500'}`}>
                            {tab === 'general' ? 'Thông tin' : tab === 'questions' ? 'Câu hỏi' : 'Giám sát'}
                        </button>
                    ))}
                </div>

                {examTab === 'general' && (
                  <div className="space-y-4">
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Tiêu đề kỳ thi" />
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Môn học" />
                      <input type="number" className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} placeholder="Phút" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Toggle label="Trộn câu hỏi" checked={formData.shuffleQuestions || false} onChange={v => setFormData({...formData, shuffleQuestions: v})} />
                        <Toggle label="Hiện kết quả" checked={formData.showResults || false} onChange={v => setFormData({...formData, showResults: v})} />
                    </div>
                  </div>
                )}

                {examTab === 'questions' && (
                   <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Tìm câu hỏi..." className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={questionSearchQuery} onChange={e => setQuestionSearchQuery(e.target.value)} />
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                        {allQuestions.filter(q => q.text.toLowerCase().includes(questionSearchQuery.toLowerCase())).map(q => {
                          const isSelected = formData.questionIds?.includes(q.id);
                          return (
                            <div key={q.id} onClick={() => {
                              const ids = formData.questionIds || [];
                              if (isSelected) setFormData({...formData, questionIds: ids.filter((id: string) => id !== q.id)});
                              else setFormData({...formData, questionIds: [...ids, q.id]});
                            }} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-white border-primary-500 shadow-clay-sm' : 'bg-transparent border-transparent'}`}>
                               <div className="flex gap-3">
                                  {isSelected ? <CheckSquare size={18} className="text-primary-500" /> : <Square size={18} className="text-gray-300" />}
                                  <span className="text-xs font-medium text-gray-700 line-clamp-1">{q.text}</span>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                )}

                {examTab === 'proctoring' && formData.proctorConfig && (
                  <div className="space-y-4">
                    <Toggle label="Xác thực trước thi" checked={formData.proctorConfig.requireFaceAuth} onChange={v => setFormData({...formData, proctorConfig: {...formData.proctorConfig, requireFaceAuth: v}})} />
                    <Toggle label="Quét liên tục" checked={formData.proctorConfig.continuousFaceAuth} onChange={v => setFormData({...formData, proctorConfig: {...formData.proctorConfig, continuousFaceAuth: v}})} />
                    <Toggle label="AI Chống gian lận" checked={formData.proctorConfig.detectCheating} onChange={v => setFormData({...formData, proctorConfig: {...formData.proctorConfig, detectCheating: v}})} />
                  </div>
                )}
              </div>
            )}

            {/* STUDENT EDIT FORM */}
            {editingType === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center mb-2">
                    <div className="w-20 h-20 rounded-3xl shadow-clay overflow-hidden border-2 border-white bg-indigo-50 flex items-center justify-center">
                        {formData.avatarUrl ? <img src={formData.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="text-indigo-300" size={32} />}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Họ và Tên</label>
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mã học sinh</label>
                      <input className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                      <input className="w-full p-4 rounded-2xl bg-gray-50 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                    <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-clay-inset outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        )}
      </ClayModal>
    </Layout>
  );
};

export default CourseDetailAdmin;
