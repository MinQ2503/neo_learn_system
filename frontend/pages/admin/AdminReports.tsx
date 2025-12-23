
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, ClassGroup, User, Exam, ExamResult, AssignmentSubmission } from '../../types';
import { classService } from '../../services/api/classService';
import { examService } from '../../services/api/examService';
import { assignmentService } from '../../services/api/assignmentService';
import { reportService } from '../../services/api/reportService';
import { getCurrentUser } from '../../services/mockService';
import { 
  AlertTriangle, FileX, BookOpen, ChevronRight, 
  User as UserIcon, ShieldAlert, Search, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminReports: React.FC = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ClassGroup[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<Record<string, ExamResult[]>>({});
  const [nonSubmissions, setNonSubmissions] = useState<Record<string, { student: User, assignmentTitle: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'violations'>('assignments');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, eData] = await Promise.all([
        classService.getAll(),
        examService.getAll()
      ]);

      setCourses(cData);
      setExams(eData.filter(e => e.status === 'completed' || e.status === 'live'));

      const nonSubMap: Record<string, { student: User, assignmentTitle: string }[]> = {};
      for (const course of cData) {
        if (course.assignments && course.assignments.length > 0) {
          const list: { student: User, assignmentTitle: string }[] = [];
          for (const hw of course.assignments) {
            const subs = await assignmentService.getSubmissions(hw.id);
            const pending = subs.filter(s => s.status === 'pending');
            pending.forEach(p => {
              list.push({ 
                student: { id: p.studentId, name: p.studentName, role: Role.STUDENT }, 
                assignmentTitle: hw.title 
              });
            });
          }
          if (list.length > 0) nonSubMap[course.id] = list;
        }
      }
      setNonSubmissions(nonSubMap);

      const resultMap: Record<string, ExamResult[]> = {};
      for (const exam of eData) {
        if (exam.status === 'completed' || exam.status === 'live') {
          const results = await reportService.getExamResults(exam.id);
          const violators = results.filter(r => r.violations && r.violations.length > 0);
          if (violators.length > 0) resultMap[exam.id] = violators;
        }
      }
      setExamResults(resultMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/${(user?.role || Role.TEACHER).toLowerCase()}/reports/student/${studentId}`);
  };

  return (
    <Layout role={user?.role || Role.TEACHER} title="Báo cáo & Tuân thủ">
      <div className="flex bg-gray-200 p-1.5 rounded-3xl mb-8 shadow-clay-inset max-w-md">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'assignments' ? 'bg-white shadow-clay text-primary-600' : 'text-gray-500'}`}
        >
          <FileX size={18} /> Quên nộp bài
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'violations' ? 'bg-white shadow-clay text-primary-600' : 'text-gray-500'}`}
        >
          <ShieldAlert size={18} /> Vi phạm thi
        </button>
      </div>

      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={activeTab === 'assignments' ? "Tìm theo khóa học hoặc tên học sinh..." : "Tìm theo kỳ thi hoặc tên học sinh..."}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-clay-inset border-none outline-none text-sm transition-all focus:ring-2 focus:ring-primary-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse font-bold text-gray-400 uppercase tracking-widest">Đang tổng hợp dữ liệu báo cáo...</div>
      ) : (
        <div className="space-y-10">
          {activeTab === 'assignments' ? (
            <div className="grid gap-8">
              {courses.filter(c => nonSubmissions[c.id]).map(course => {
                const list = nonSubmissions[course.id].filter(item => 
                  course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  item.student.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (list.length === 0) return null;

                return (
                  <div key={course.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-4 px-2">
                       <BookOpen className="text-primary-500" size={20} />
                       <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{course.name}</h3>
                       <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black">{list.length} HỌC SINH CHƯA NỘP</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {list.map((item, idx) => (
                         <ClayCard 
                           key={idx} 
                           className="p-5 group cursor-pointer hover:bg-white hover:translate-y-[-2px] transition-all"
                           onClick={() => handleStudentClick(item.student.id)}
                         >
                            <div className="flex justify-between items-start mb-3">
                               <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shadow-clay-sm overflow-hidden group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                  <UserIcon size={20} />
                               </div>
                               <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{item.student.name}</h4>
                            <div className="pt-3 border-t border-gray-50">
                               <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Bài tập còn thiếu</p>
                               <p className="text-xs font-bold text-red-500 line-clamp-1">{item.assignmentTitle}</p>
                            </div>
                         </ClayCard>
                       ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-8">
              {exams.filter(e => examResults[e.id]).map(exam => {
                const list = examResults[exam.id].filter(r => 
                  exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (list.length === 0) return null;

                return (
                  <div key={exam.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-4 px-2">
                       <ShieldAlert className="text-red-500" size={20} />
                       <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{exam.title}</h3>
                       <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black">{list.length} TRƯỜNG HỢP VI PHẠM</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {list.map((result, idx) => (
                         <ClayCard 
                           key={idx} 
                           className="p-5 group cursor-pointer hover:bg-white hover:translate-y-[-2px] transition-all border-l-4 border-red-500"
                           onClick={() => handleStudentClick(result.studentId)}
                         >
                            <div className="flex justify-between items-start mb-3">
                               <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shadow-clay-sm">
                                  <AlertTriangle size={20} />
                               </div>
                               <div className="text-right">
                                  <span className="block text-[9px] font-black text-gray-400 uppercase">Điểm thi</span>
                                  <span className="text-sm font-black text-gray-700">{result.score}/100</span>
                               </div>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{result.studentName}</h4>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                               <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Số lỗi ghi nhận</p>
                                  <p className="text-xs font-black text-red-600">{result.violations.length} Cảnh báo AI</p>
                               </div>
                               <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                         </ClayCard>
                       ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AdminReports;
