
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import { Role, Exam, ClassGroup, User, ViolationType } from '../types';
import { examService } from '../services/api/examService';
import { classService } from '../services/api/classService';
import { userService } from '../services/api/userService';
import { reportService } from '../services/api/reportService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  FileText, Users, School, GraduationCap, TrendingUp, 
  Clock, AlertTriangle, ChevronRight, Calendar, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0ea5e9', '#f97316', '#ef4444', '#22c55e', '#8b5cf6'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    topExams: [] as Exam[],
    topCourses: [] as ClassGroup[],
    recentExams: [] as Exam[],
    recentCourses: [] as ClassGroup[],
    recentReports: [] as any[]
  });

  const [violationPeriod, setViolationPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [exams, courses, students, teachers, reports] = await Promise.all([
        examService.getAll(),
        classService.getAll(),
        userService.getUsersByRole(Role.STUDENT),
        userService.getUsersByRole(Role.TEACHER),
        reportService.getCompletedExams()
      ]);

      // Top 3 Exams by Question Count (Proxy for size in mock) or assigned classes
      const topExams = [...exams].sort((a, b) => b.questionIds.length - a.questionIds.length).slice(0, 3);
      
      // Top 3 Courses by Student Count
      const topCourses = [...courses].sort((a, b) => (b.studentIds?.length || 0) - (a.studentIds?.length || 0)).slice(0, 3);

      // Recent 5
      const recentExams = [...exams].reverse().slice(0, 5);
      const recentCourses = [...courses].reverse().slice(0, 5);
      
      // 3 Recent Reports
      const recentReports = reports.slice(0, 3);

      setStats({
        totalExams: exams.length,
        totalCourses: courses.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        topExams,
        topCourses,
        recentExams,
        recentCourses,
        recentReports
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts based on filters
  const getViolationData = () => {
    if (violationPeriod === 'week') {
      return [
        { name: 'Thứ 2', count: 12 }, { name: 'Thứ 3', count: 18 }, { name: 'Thứ 4', count: 15 },
        { name: 'Thứ 5', count: 25 }, { name: 'Thứ 6', count: 20 }, { name: 'Thứ 7', count: 10 }, { name: 'CN', count: 5 }
      ];
    }
    if (violationPeriod === 'month') {
      return [
        { name: 'Tuần 1', count: 45 }, { name: 'Tuần 2', count: 52 }, { name: 'Tuần 3', count: 38 }, { name: 'Tuần 4', count: 60 }
      ];
    }
    return [
      { name: 'Tháng 1', count: 120 }, { name: 'Tháng 2', count: 150 }, { name: 'Tháng 3', count: 180 },
      { name: 'Tháng 4', count: 140 }, { name: 'Tháng 5', count: 160 }, { name: 'Tháng 6', count: 130 }
    ];
  };

  const violationDistribution = [
    { name: ViolationType.MOBILE_DETECTED, value: 45 },
    { name: ViolationType.GAZE_AWAY, value: 120 },
    { name: ViolationType.MULTI_FACE, value: 12 },
    { name: ViolationType.FACE_MISMATCH, value: 15 },
    { name: ViolationType.HEADPHONES, value: 34 },
  ];

  if (loading) return <Layout role={Role.ADMIN} title="Hệ thống"><div className="p-20 text-center animate-pulse font-bold text-gray-400 uppercase tracking-widest">Đang khởi tạo Dashboard...</div></Layout>;

  return (
    <Layout role={Role.ADMIN} title="Tổng quan Hệ thống">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng Kỳ thi', value: stats.totalExams, icon: <FileText />, color: 'bg-blue-100 text-blue-600' },
          { label: 'Tổng Khóa học', value: stats.totalCourses, icon: <School />, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Tổng Học sinh', value: stats.totalStudents, icon: <Users />, color: 'bg-purple-100 text-purple-600' },
          { label: 'Tổng Giáo viên', value: stats.totalTeachers, icon: <GraduationCap />, color: 'bg-orange-100 text-orange-600' },
        ].map((item, idx) => (
          <ClayCard key={idx} className="p-6 flex items-center justify-between group hover:translate-y-[-4px] transition-all">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{item.value.toLocaleString()}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-clay-sm ${item.color} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
          </ClayCard>
        ))}
      </div>

      {/* 2. TOP RANKINGS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <ClayCard className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
            <TrendingUp size={20} className="text-primary-500" /> Top 3 Kỳ thi tham gia nhiều nhất
          </h3>
          <div className="space-y-4">
            {stats.topExams.map((exam, i) => (
              <div key={exam.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-primary-100 transition-all cursor-pointer" onClick={() => navigate(`/admin/exams`)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{exam.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{exam.subject} • {exam.questionIds.length} Câu hỏi</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-primary-600">Phổ biến</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Ranking #{i+1}</span>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
            <School size={20} className="text-primary-500" /> Top 3 Khóa học Sĩ số cao nhất
          </h3>
          <div className="space-y-4">
            {stats.topCourses.map((course, i) => (
              <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-primary-100 transition-all cursor-pointer" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{course.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{course.subject} • GV: {course.teacherName}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-indigo-600">{course.studentIds?.length || 0}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Học sinh</span>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <ClayCard className="lg:col-span-2 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Biểu đồ sinh viên vi phạm
            </h3>
            <div className="flex gap-2">
               <select 
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl bg-gray-100 border-none shadow-clay-inset outline-none"
                value={selectedExamFilter}
                onChange={e => setSelectedExamFilter(e.target.value)}
               >
                 <option value="all">Tất cả kỳ thi</option>
                 {stats.recentExams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
               </select>
               <div className="flex p-1 bg-gray-200 rounded-xl shadow-clay-inset">
                  {(['week', 'month', 'year'] as const).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setViolationPeriod(p)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${violationPeriod === p ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                    >
                      {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                    </button>
                  ))}
               </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getViolationData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '8px 8px 16px #d1d5db' }} />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        <ClayCard className="p-8">
          <h3 className="text-lg font-bold mb-8 text-gray-800">Tỉ lệ lỗi vi phạm</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {violationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>

      {/* 4. RECENT ITEMS & REPORTS */}
      <div className="grid lg:grid-cols-3 gap-8 mb-20">
        <ClayCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Khóa học mới nhất</h3>
            <button onClick={() => navigate('/admin/courses')} className="text-[10px] font-bold text-primary-500 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {stats.recentCourses.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all cursor-pointer group" onClick={() => navigate(`/admin/courses/${c.id}`)}>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-xs">
                     {c.subject.charAt(0)}
                   </div>
                   <div className="max-w-[120px]">
                      <h4 className="text-xs font-bold text-gray-700 truncate">{c.name}</h4>
                      <p className="text-[9px] text-gray-400">{c.teacherName}</p>
                   </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Kỳ thi gần đây</h3>
            <button onClick={() => navigate('/admin/exams')} className="text-[10px] font-bold text-primary-500 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {stats.recentExams.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all cursor-pointer group" onClick={() => navigate(`/admin/exams`)}>
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${e.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                     <Clock size={14} />
                   </div>
                   <div className="max-w-[120px]">
                      <h4 className="text-xs font-bold text-gray-700 truncate">{e.title}</h4>
                      <p className="text-[9px] text-gray-400">{e.status === 'live' ? 'Đang diễn ra' : 'Sắp tới'}</p>
                   </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="p-6 bg-primary-500 text-white shadow-[8px_8px_16px_#0c4a6e,-8px_-8px_16px_#38bdf8]">
          <h3 className="text-sm font-black text-primary-100 uppercase tracking-widest mb-6">3 Báo cáo Kỳ thi mới nhất</h3>
          <div className="space-y-3">
            {stats.recentReports.map(r => (
              <div key={r.id} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all cursor-pointer border border-white/10" onClick={() => navigate(`/admin/reports`)}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={14} className="text-primary-200" />
                  <span className="text-[10px] font-bold text-primary-100">{new Date(r.startTime).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-black truncate">{r.title}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="px-2 py-1 bg-white text-primary-600 rounded-md text-[9px] font-black uppercase">Hoàn thành</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    Chi tiết <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))}
            {stats.recentReports.length === 0 && <p className="text-center py-10 text-xs font-bold text-primary-200 uppercase opacity-60">Chưa có báo cáo hoàn thành</p>}
          </div>
        </ClayCard>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
