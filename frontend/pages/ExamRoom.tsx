
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Clock, Wifi, AlertTriangle, EyeOff, MessageCircle, ShieldAlert, Camera, CheckCircle } from 'lucide-react';
import { reportProctorHeartbeat, getCurrentUser } from '../services/mockService';

// Giả lập API xác thực khuôn mặt
const mockFaceVerify = async (imageBase64: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Xác suất thành công 90% trong bản demo
    return Math.random() > 0.1;
};

const ExamRoom: React.FC = () => {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5400); 
  const [showWarning, setShowWarning] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const proctorIntervalRef = useRef<any>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isFinishingRef = useRef(false); // Dùng ref để dừng vòng lặp ngay lập tức
  const user = getCurrentUser();

  // 1. Khởi động Camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        activeStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
        alert("Hệ thống không thể truy cập Camera. Vui lòng cấp quyền để tham gia thi.");
        navigate(-1);
    }
  };

  const stopCamera = () => {
    isFinishingRef.current = true;
    if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
    }
    if (proctorIntervalRef.current) {
        clearTimeout(proctorIntervalRef.current);
        proctorIntervalRef.current = null;
    }
  };

  // 2. Xác thực khuôn mặt trước khi vào thi
  const handleVerifyFace = async () => {
    if (!videoRef.current) return;
    setVerifying(true);
    
    try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        const img = canvas.toDataURL('image/jpeg');

        const success = await mockFaceVerify(img);
        if (success) {
            setIsVerified(true);
            startProctoring(); // Bắt đầu giám sát liên tục
        } else {
            alert('Không thể nhận diện khuôn mặt. Vui lòng thử lại, hãy đảm bảo khuôn mặt rõ nét và đủ ánh sáng.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        setVerifying(false);
    }
  };

  // 3. Giám sát liên tục mỗi 5s (Tuần tự - Sequence)
  const startProctoring = () => {
    // Chờ 2s để ổn định rồi mới bắt đầu loop
    setTimeout(() => {
        if (!isFinishingRef.current) {
            runProctorCycle();
        }
    }, 2000);
  };

  const runProctorCycle = async () => {
    // Kiểm tra ngay đầu hàm để dừng loop nếu đã nộp bài/thoát
    if (isFinishingRef.current || !videoRef.current || !activeStreamRef.current) return;

    try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg', 0.5);

        // Đợi API phản hồi xong mới thực hiện bước tiếp theo
        const response = await reportProctorHeartbeat(examId!, user!.id, base64Image);
        
        if (response.violation && !isFinishingRef.current) {
            setShowWarning(`CẢNH BÁO AI: Phát hiện hành vi nghi vấn (${response.violation.type}). Vui lòng tập trung làm bài!`);
            // Tự động ẩn cảnh báo sau 3s
            setTimeout(() => setShowWarning(null), 5173);
        }
    } catch (err) {
        console.error("Proctor cycle error", err);
    }

    // Sau khi xử lý xong API hiện tại, đợi thêm 5s rồi chạy cycle tiếp theo
    if (!isFinishingRef.current) {
        proctorIntervalRef.current = setTimeout(runProctorCycle, 5000);
    }
  };

  // 4. Đếm ngược
  useEffect(() => {
    if (!isVerified) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerified]);

  const handleFinish = (msg: string) => {
    if (confirm(msg)) {
        stopCamera();
        // Điều hướng an toàn: nếu không có courseId thì về danh sách khóa học chung
        const destination = courseId 
          ? `/student/courses/${courseId}?tab=exams` 
          : '/student/courses';
        navigate(destination);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // MÀN HÌNH CHỜ XÁC THỰC
  if (!isVerified) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <ClayCard className="max-w-xl w-full p-10 text-center">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-clay-sm">
                    <ShieldAlert size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Xác thực Phòng thi</h2>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">Hệ thống AI Proctor cần xác nhận khuôn mặt của bạn khớp với ảnh hồ sơ trước khi bắt đầu tính giờ làm bài.</p>
                
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black mb-8 shadow-clay-inset ring-4 ring-white">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 border-2 border-dashed border-primary-500/30 rounded-3xl m-6 pointer-events-none"></div>
                </div>

                <div className="flex gap-4">
                    <ClayButton variant="neutral" className="flex-1" onClick={() => navigate(-1)}>Thoát</ClayButton>
                    <ClayButton className="flex-[2]" onClick={handleVerifyFace} disabled={verifying}>
                        {verifying ? 'Đang nhận diện...' : (
                            <><Camera size={20} /> Xác nhận Khuôn mặt</>
                        )}
                    </ClayButton>
                </div>
            </ClayCard>
        </div>
    );
  }

  // MÀN HÌNH LÀM BÀI
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col animate-in fade-in duration-700">
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold">N</div>
            <h1 className="font-bold text-gray-800">Kỳ thi Trực tuyến</h1>
        </div>
        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-2xl font-black ${timeLeft < 600 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
            </div>
            <ClayButton variant="danger" className="py-2 px-6" onClick={() => handleFinish('Bạn có muốn nộp bài ngay bây giờ không?')}>
                Nộp bài & Kết thúc
            </ClayButton>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto">
            <ClayCard className="min-h-[80vh] p-10 bg-white relative">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Câu hỏi số 1</h2>
                    <span className="text-xs font-bold text-gray-400">ĐIỂM: 1.0</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-10 font-medium">
                    Phân tích các yếu tố ảnh hưởng đến sự phát triển của nền kinh tế số trong bối cảnh cuộc cách mạng công nghiệp 4.0. Nêu ví dụ thực tiễn tại Việt Nam.
                </p>
                <textarea 
                    className="w-full h-80 p-6 rounded-3xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none resize-none text-gray-700 leading-relaxed"
                    placeholder="Nhập nội dung bài làm của bạn tại đây..."
                />
                
                <div className="mt-10 flex justify-between">
                    <ClayButton variant="neutral" className="opacity-50 cursor-not-allowed">Câu trước</ClayButton>
                    <ClayButton>Câu tiếp theo</ClayButton>
                </div>
            </ClayCard>
        </main>

        <aside className="w-80 p-6 flex flex-col gap-6 bg-gray-50/50 border-l border-gray-200">
            <div className="sticky top-6">
                <div className={`relative rounded-3xl overflow-hidden shadow-clay bg-black aspect-square mb-4 ring-4 transition-all duration-500 ${showWarning ? 'ring-red-500 animate-pulse' : 'ring-white'}`}>
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        AI Monitoring
                    </div>
                    
                    {showWarning && (
                        <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center p-4 text-center backdrop-blur-sm animate-in zoom-in duration-300">
                            <div className="bg-white p-4 rounded-2xl shadow-2xl scale-110">
                                <ShieldAlert className="text-red-600 mx-auto mb-2" size={32} />
                                <p className="text-[10px] font-black text-red-600 uppercase leading-tight tracking-tighter">{showWarning}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-clay-sm flex flex-col items-center justify-center text-gray-500">
                        <Wifi size={20} className="text-green-500 mb-1" />
                        <span className="text-[9px] font-black uppercase">Ổn định</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-clay-sm flex flex-col items-center justify-center text-gray-500">
                        <EyeOff size={20} className="text-primary-400 mb-1" />
                        <span className="text-[9px] font-black uppercase">Bảo mật</span>
                    </div>
                </div>

                <ClayCard className="p-5 bg-primary-50 border border-primary-100 mb-6">
                    <div className="flex items-center gap-2 text-primary-700 mb-2">
                        <CheckCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Quy định thi</span>
                    </div>
                    <p className="text-[10px] text-primary-600 leading-relaxed font-medium italic">
                        "Tuyệt đối không sử dụng tài liệu hoặc thiết bị di động. Hệ thống sẽ tự động ghi nhận bằng chứng nếu phát hiện hành vi bất thường."
                    </p>
                </ClayCard>

                <button 
                    onClick={() => handleFinish('Bạn có chắc chắn muốn thoát khỏi phòng thi? Kết quả sẽ không được lưu nếu chưa nộp bài.')}
                    className="w-full py-4 bg-white rounded-2xl shadow-clay text-red-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                >
                    <AlertTriangle size={18} /> Thoát phòng thi
                </button>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamRoom;
