import React, { useState } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import CameraCheck from '../components/CameraCheck';
import { Role } from '../types';
import { MOCK_EXAMS as MockExamsData } from '../services/mockService';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const activeExams = MockExamsData.filter(e => e.status === 'live');
  const upcomingExams = MockExamsData.filter(e => e.status === 'upcoming');

  const handleStartExam = (examId: string) => {
    setSelectedExamId(examId);
    setIsVerifying(true);
  };

  const handleVerificationComplete = () => {
    if (selectedExamId) {
        navigate(`/exam/${selectedExamId}`);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <ClayCard className="max-w-2xl w-full p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
            <p className="text-gray-500 mb-8">Please align your face within the frame to verify your identity before entering the exam room.</p>
            <CameraCheck onVerified={handleVerificationComplete} />
            <button 
                onClick={() => setIsVerifying(false)}
                className="mt-6 text-gray-500 hover:text-gray-800 underline text-sm"
            >
                Cancel and return to dashboard
            </button>
        </ClayCard>
      </div>
    );
  }

  return (
    <Layout role={Role.STUDENT} title="Student Portal">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Active Exams
            </h2>
            <div className="grid gap-6">
                {activeExams.map(exam => (
                    <ClayCard key={exam.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full mb-2">LIVE NOW</span>
                            <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes} mins</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(exam.startTime).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <ClayButton onClick={() => handleStartExam(exam.id)}>
                            Enter Exam Room
                        </ClayButton>
                    </ClayCard>
                ))}
                {activeExams.length === 0 && (
                     <ClayCard className="p-8 text-center text-gray-500">
                        No active exams at the moment.
                     </ClayCard>
                )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-700">Upcoming</h2>
            <div className="grid gap-6">
                {upcomingExams.map(exam => (
                    <ClayCard key={exam.id} className="p-6 opacity-80">
                         <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                         <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes} mins</span>
                            <span className="flex items-center gap-1 text-primary-600 font-medium">Starts: {new Date(exam.startTime).toLocaleString()}</span>
                        </div>
                    </ClayCard>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
             <ClayCard className="p-6">
                <h3 className="font-bold text-lg mb-4">System Check</h3>
                <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Camera</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">READY</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Microphone</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">READY</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Network</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">STABLE</span>
                    </li>
                </ul>
             </ClayCard>

             <ClayCard className="p-6 bg-orange-50 border border-orange-100">
                <div className="flex gap-3">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <div className="text-sm text-orange-800">
                        <p className="font-bold mb-1">Important Rule</p>
                        <p>Mobile phones must be switched off and placed out of reach. Detection of mobile devices will lead to immediate flagging.</p>
                    </div>
                </div>
             </ClayCard>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;