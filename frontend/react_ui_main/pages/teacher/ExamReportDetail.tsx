import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, ExamStatistics, ExamResult, Violation, Severity } from '../../types';
import { reportService } from '../../services/api/reportService';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, TrendingUp, ArrowLeft, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#f97316', '#ef4444', '#22c55e'];

const ExamReportDetail: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ExamStatistics | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<ExamResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (examId) fetchData(examId);
  }, [examId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    const [statsData, resultsData] = await Promise.all([
        reportService.getExamStatistics(id),
        reportService.getExamResults(id)
    ]);
    setStats(statsData);
    setResults(resultsData);
    setLoading(false);
  };

  const openStudentDetails = (student: ExamResult) => {
    if (student.violations.length > 0) {
        setSelectedStudent(student);
        setIsModalOpen(true);
    }
  };

  if (loading) return <Layout role={Role.TEACHER} title="Loading Report..."><div className="p-8 text-center">Loading...</div></Layout>;
  if (!stats) return <Layout role={Role.TEACHER} title="Error"><div className="p-8 text-center">Report not found.</div></Layout>;

  return (
    <Layout role={Role.TEACHER} title="Session Analytics">
      <button onClick={() => navigate('/teacher/reports')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium">
        <ArrowLeft size={18} /> Back to Reports
      </button>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ClayCard className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-2xl text-blue-600"><Users size={24} /></div>
            <div>
                <p className="text-sm text-gray-500 font-bold">Participants</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalStudents}</h3>
            </div>
        </ClayCard>
        <ClayCard className="p-6 flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-2xl text-green-600"><TrendingUp size={24} /></div>
            <div>
                <p className="text-sm text-gray-500 font-bold">Average Score</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.averageScore}</h3>
            </div>
        </ClayCard>
        <ClayCard className="p-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stats.violationRate > 20 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <AlertTriangle size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-bold">Cheating Rate</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.violationRate}%</h3>
            </div>
        </ClayCard>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <ClayCard className="p-8">
            <h3 className="text-lg font-bold mb-6 text-gray-700">Score Distribution</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.scoreDistribution}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                         <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ClayCard>

        <ClayCard className="p-8">
            <h3 className="text-lg font-bold mb-6 text-gray-700">Violation Types</h3>
            <div className="h-64 w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.violationDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                        >
                            {stats.violationDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </ClayCard>
      </div>

      {/* Violations Table */}
      <ClayCard className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Flagged Students</h3>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                        <th className="pb-3 pl-2">Student</th>
                        <th className="pb-3">Score</th>
                        <th className="pb-3">Violations</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {results.filter(r => r.violations.length > 0).map((r) => (
                        <tr key={r.studentId} className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-4 pl-2">
                                <p className="font-bold text-gray-700">{r.studentName}</p>
                                <p className="text-xs text-gray-400">ID: {r.studentId}</p>
                            </td>
                            <td className="py-4 font-bold text-gray-600">{r.score}</td>
                            <td className="py-4">
                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs font-bold">
                                    {r.violations.length} Flags
                                </span>
                            </td>
                            <td className="py-4 text-right pr-2">
                                <ClayButton variant="neutral" className="py-1 px-3 text-xs" onClick={() => openStudentDetails(r)}>
                                    <Eye size={14} /> View Evidence
                                </ClayButton>
                            </td>
                        </tr>
                    ))}
                    {results.filter(r => r.violations.length > 0).length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-gray-500">No violations detected in this session.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </ClayCard>

      {/* Evidence Modal */}
      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Violation Evidence Log"
        footer={<div className="flex justify-end"><ClayButton onClick={() => setIsModalOpen(false)}>Close Log</ClayButton></div>}
      >
        {selectedStudent && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl text-gray-600">
                        {selectedStudent.studentName.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{selectedStudent.studentName}</h4>
                        <p className="text-sm text-gray-500">ID: {selectedStudent.studentId}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {selectedStudent.violations.map((v, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-red-200">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800">{v.type}</span>
                                <span className="text-xs text-gray-400">{new Date(v.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Confidence: {(v.confidence * 100).toFixed(1)}% | Severity: {v.severity}</p>
                            {v.imageUrl && (
                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <img src={v.imageUrl} alt="Violation Snapshot" className="w-full h-auto object-cover" />
                                </div>
                            )}
                            {!v.imageUrl && (
                                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 italic">No image captured for this event.</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </ClayModal>
    </Layout>
  );
};

export default ExamReportDetail;
