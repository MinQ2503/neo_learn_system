import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, Exam } from '../../types';
import { reportService } from '../../services/api/reportService';
import { Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherReports: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const data = await reportService.getCompletedExams();
    setExams(data);
    setLoading(false);
  };

  return (
    <Layout role={Role.TEACHER} title="Exam Reports">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Completed Sessions</h2>
        
        {loading ? (
            <div className="text-center py-10 text-gray-500">Loading reports...</div>
        ) : exams.length === 0 ? (
            <ClayCard className="p-8 text-center text-gray-500">
                No completed exams found.
            </ClayCard>
        ) : (
            <div className="grid gap-4">
                {exams.map(exam => (
                    <ClayCard 
                        key={exam.id} 
                        className="p-6 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => navigate(`/teacher/reports/${exam.id}`)}
                        interactive
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                                <p className="text-gray-500 text-sm mb-1">{exam.subject}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(exam.startTime).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {exam.durationMinutes} mins</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Status</span>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">COMPLETED</span>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                    </ClayCard>
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherReports;
