
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, User, Violation, ExamResult } from '../../types';
import { userService } from '../../services/api/userService';
import { reportService } from '../../services/api/reportService';
import { examService } from '../../services/api/examService';
import { 
  ArrowLeft, ShieldAlert, Clock, Calendar, 
  ExternalLink, User as UserIcon, Camera, AlertTriangle
} from 'lucide-react';

const StudentViolationHistory: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<User | null>(null);
  const [allViolations, setAllViolations] = useState<{ examTitle: string, violations: Violation[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) loadData();
  }, [studentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const users = await userService.getAll();
      const found = users.find(u => u.id === studentId);
      if (found) setStudent(found);

      const exams = await examService.getAll();
      const history: { examTitle: string, violations: Violation[] }[] = [];

      for (const exam of exams) {
        const results = await reportService.getExamResults(exam.id);
        const myResult = results.find(r => r.studentId === studentId);
        if (myResult && myResult.violations.length > 0) {
          history.push({
            examTitle: exam.title,
            violations: myResult.violations
          });
        }
      }
      setAllViolations(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout role={Role.ADMIN} title="Đang tải..."><div className="p-20 text-center animate-spin"></div></Layout>;
  if (!student) return <Layout role={Role.ADMIN} title="Lỗi"><div className="p-20 text-center">Không tìm thấy học sinh.</div></Layout>;

  return (
    <Layout role={Role.ADMIN} title="Lịch sử Vi phạm">
      <button onClick={() => navigate('/admin/reports')} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 font-bold text-sm transition-all group">
        <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" /> Quay lại danh sách báo cáo
      </button>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <ClayCard className="p-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-500 mx-auto mb-4 flex items-center justify-center font-black text-3xl shadow-clay-sm overflow-hidden">
               {student.avatarUrl ? <img src={student.avatarUrl} className="w-full h-full object-cover" /> : student.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-gray-800">{student.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {student.studentId || student.id}</p>
            <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-3">
               <div className="p-3 bg-red-50 rounded-2xl">
                  <p className="text-[9px] text-red-400 font-black uppercase mb-1">Tổng vi phạm</p>
                  <p className="text-xl font-black text-red-600">{allViolations.reduce((acc, curr) => acc + curr.violations.length, 0)}</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Mức độ rủi ro</p>
                  <p className="text-xl font-black text-orange-600">Cao</p>
               </div>
            </div>
          </ClayCard>
        </div>

        {/* Violation Timeline */}
        <div className="lg:col-span-3 space-y-8">
          {allViolations.length === 0 ? (
            <ClayCard className="p-20 text-center">
               <ShieldAlert size={48} className="mx-auto mb-4 text-green-200" />
               <p className="text-gray-400 font-bold">Học sinh này chưa có lịch sử vi phạm nào.</p>
            </ClayCard>
          ) : (
            allViolations.map((item, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-px flex-1 bg-gray-200"></div>
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 py-1.5 bg-white rounded-full shadow-clay-sm border border-gray-50">{item.examTitle}</h4>
                   <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="space-y-6 relative pl-8 ml-4 border-l-2 border-dashed border-gray-200">
                  {item.violations.map((v, vIdx) => (
                    <div key={vIdx} className="relative">
                       {/* Timeline dot */}
                       <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-red-500 border-4 border-white shadow-md flex items-center justify-center">
                          <AlertTriangle size={10} className="text-white" />
                       </div>

                       <ClayCard className="p-6 overflow-hidden">
                          <div className="flex flex-col md:flex-row gap-6">
                             {v.imageUrl && (
                               <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl bg-gray-200 overflow-hidden shadow-clay-sm shrink-0 border-2 border-white">
                                  <img src={v.imageUrl} className="w-full h-full object-cover" />
                               </div>
                             )}
                             <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                   <div>
                                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded uppercase tracking-wider">{v.type}</span>
                                      <h5 className="text-lg font-black text-gray-800 mt-1">Phát hiện bởi AI Proctor</h5>
                                   </div>
                                   <div className="text-right">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                         <Clock size={12} /> {new Date(v.timestamp).toLocaleTimeString()}
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                         <Calendar size={12} /> {new Date(v.timestamp).toLocaleDateString()}
                                      </div>
                                   </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 shadow-clay-inset text-sm text-gray-600 leading-relaxed mb-4 italic">
                                   "{v.reason || 'Hệ thống tự động phát hiện hành vi không trung thực thông qua phân tích luồng video camera.'}"
                                </div>
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                         <div className="h-full bg-primary-500" style={{ width: `${v.confidence * 100}%` }}></div>
                                      </div>
                                      <span className="text-[10px] font-black text-primary-600">Độ tin cậy: {(v.confidence * 100).toFixed(0)}%</span>
                                   </div>
                                   <button className="text-[10px] font-black text-primary-500 hover:underline uppercase tracking-tighter flex items-center gap-1">
                                      Tải bằng chứng <ExternalLink size={12} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </ClayCard>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentViolationHistory;
