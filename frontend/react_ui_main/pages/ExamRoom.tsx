import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { Clock, Wifi, AlertTriangle, EyeOff, MessageCircle } from 'lucide-react';

const ExamRoom: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5400); // 90 mins in seconds
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
            clearInterval(timer);
            return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate random violation warning
    const warningTimer = setTimeout(() => {
        setShowWarning("Please keep your face centered in the frame.");
        setTimeout(() => setShowWarning(null), 5000);
    }, 10000);

    return () => {
        clearInterval(timer);
        clearTimeout(warningTimer);
    };
  }, []);

  // Camera stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
            <h1 className="font-bold text-gray-800">Advanced Calculus Final</h1>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">ID: {examId}</span>
        </div>
        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 600 ? 'text-red-500' : 'text-primary-600'}`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
            </div>
            <ClayButton variant="danger" className="py-1 px-4 text-sm" onClick={() => navigate('/student')}>
                Finish Exam
            </ClayButton>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Exam Area (Simulated Question) */}
        <main className="flex-1 p-8 overflow-y-auto">
            <ClayCard className="min-h-[80vh] p-8">
                <h2 className="text-xl font-bold mb-6">Question 1</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                    Calculate the definite integral of the function f(x) = x^2 * e^x from x = 0 to x = 1. 
                    Show your work in the text area below.
                </p>
                <textarea 
                    className="w-full h-64 p-4 rounded-xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none resize-none font-mono text-gray-700"
                    placeholder="Type your answer here..."
                />
                
                <div className="mt-8 flex justify-between">
                    <ClayButton variant="neutral">Previous</ClayButton>
                    <ClayButton>Next Question</ClayButton>
                </div>
            </ClayCard>
        </main>

        {/* Floating Proctor Widget */}
        <aside className="w-80 p-6 flex flex-col gap-6">
            <div className="sticky top-6">
                <div className="relative rounded-2xl overflow-hidden shadow-clay bg-black aspect-video mb-4 ring-4 ring-white">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Recording
                    </div>
                    {showWarning && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center p-4 text-center">
                            <div className="bg-white p-3 rounded-xl shadow-lg animate-bounce">
                                <AlertTriangle className="text-red-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-red-600">{showWarning}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white p-3 rounded-xl shadow-clay-sm flex flex-col items-center justify-center text-gray-500">
                        <Wifi size={18} className="text-green-500 mb-1" />
                        <span className="text-xs">Stable</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-clay-sm flex flex-col items-center justify-center text-gray-500">
                        <EyeOff size={18} className="text-gray-400 mb-1" />
                        <span className="text-xs">Privacy</span>
                    </div>
                </div>

                <button className="w-full py-3 bg-white rounded-xl shadow-clay text-primary-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <MessageCircle size={18} />
                    Request Proctor Help
                </button>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamRoom;
