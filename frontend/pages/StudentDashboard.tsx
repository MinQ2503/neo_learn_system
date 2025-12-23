import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import CameraCheck from '../components/CameraCheck';
import { Role } from '../types';
import { MOCK_EXAMS as MockExamsData, getCurrentUser } from '../services/mockService';
import { Clock, Calendar, AlertCircle, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const user = getCurrentUser();

  const activeExams = MockExamsData.filter(e => e.status === 'live');
  const upcomingExams = MockExamsData.filter(e => e.status === 'upcoming');

  const handleStartExam = (examId: string) => {
    // KIỂM TRA AVATAR
    if (!user?.avatarUrl || user.avatarUrl.includes('picsum.photos')) {
        // Giả sử logic là nếu user chưa cập nhật avatar thực (hoặc avatar mặc định)
        // Chúng ta yêu cầu họ vào trang profile trước
        if (confirm('Bạn cần cập nhật ảnh đại diện chính thức trước khi làm bài thi. Đi đến trang Profile?')) {
            navigate('/profile-edit');
            return;
        }
    }
    
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
            <h2 className="text-2xl font-bold mb-2">Xác thực danh tính</h2>
            <p className="text-gray-500 mb-8">Vui lòng để khuôn mặt trong khung hình để hệ thống đối chiếu với ảnh hồ sơ.</p>
            <CameraCheck onVerified={handleVerificationComplete} />
            <button 
                onClick={() => setIsVerifying(false)}
                className="mt-6 text-gray-500 hover:text-gray-800 underline text-sm"
            >
                Hủy và quay lại Dashboard
            </button>
        </ClayCard>
      </div>
    );
  }

  return (
    <Layout role={Role.STUDENT} title="Cổng sinh viên">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Kỳ thi đang diễn ra
            </h2>
            <div className="grid gap-6">
                {activeExams.map(exam => (
                    <ClayCard key={exam.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full mb-2">ĐANG DIỄN RA</span>
                            <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes} phút</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(exam.startTime).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <ClayButton onClick={() => handleStartExam(exam.id)}>
                            Vào phòng thi
                        </ClayButton>
                    </ClayCard>
                ))}
                {activeExams.length === 0 && (
                     <ClayCard className="p-8 text-center text-gray-500">
                        Hiện không có kỳ thi nào đang diễn ra.
                     </ClayCard>
                )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-700">Sắp diễn ra</h2>
            <div className="grid gap-6">
                {upcomingExams.map(exam => (
                    <ClayCard key={exam.id} className="p-6 opacity-80">
                         <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                         <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes} phút</span>
                            <span className="flex items-center gap-1 text-primary-600 font-medium">Bắt đầu: {new Date(exam.startTime).toLocaleString()}</span>
                        </div>
                    </ClayCard>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
             <ClayCard className="p-6">
                <h3 className="font-bold text-lg mb-4">Kiểm tra hệ thống</h3>
                <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Camera</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">SẴN SÀNG</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Microphone</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">SẴN SÀNG</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-sm text-gray-600">Network</span>
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">ỔN ĐỊNH</span>
                    </li>
                </ul>
             </ClayCard>

             <ClayCard className="p-6 bg-orange-50 border border-orange-100">
                <div className="flex gap-3">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <div className="text-sm text-orange-800">
                        <p className="font-bold mb-1">Quy định phòng thi</p>
                        <p>Điện thoại phải được tắt và để ngoài tầm với. Hệ thống AI sẽ tự động chụp ảnh và phát hiện các thiết bị di động.</p>
                    </div>
                </div>
             </ClayCard>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;