import React, { useEffect, useRef, useState } from 'react';
import ClayButton from './ClayButton';
import { Camera, CameraOff, Mic, CheckCircle2, AlertTriangle } from 'lucide-react';
import { antiCheatService } from '../services/api/antiCheatService';

interface CameraCheckProps {
  onVerified: () => void;
}

const CameraCheck: React.FC<CameraCheckProps> = ({ onVerified }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastDetection, setLastDetection] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopMonitoring(); // Stop monitoring when component unmounts
    };
  }, []);

  // Cleanup monitoring when component unmounts or monitoring stops
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMonitoring]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera or microphone. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture frame from video and convert to File
  const captureFrame = async (): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob then to File
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          candidate_id: user.id?.toString() || '',
          candidate_name: user.name || '',
        };
      }
    } catch (e) {
      console.error('Error parsing user info:', e);
    }
    return { candidate_id: '', candidate_name: '' };
  };

  // Detect cheating from captured frame
  const detectCheating = async () => {
    const frame = await captureFrame();
    if (!frame) {
      console.error('Failed to capture frame');
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo.candidate_id || !userInfo.candidate_name) {
      console.error('User info not found');
      return;
    }

    try {
      const response = await antiCheatService.detectPro(
        userInfo.candidate_id,
        userInfo.candidate_name,
        frame
      );

      setDetectionCount(prev => prev + 1);
      setLastDetection(new Date().toLocaleTimeString());

      // Log result
      if (response.detect_result.cheating) {
        console.warn('Cheating detected:', response.detect_result.cheating_reason);
        // Có thể hiển thị warning hoặc gửi event lên parent component
      } else {
        console.log('No cheating detected');
      }
    } catch (err: any) {
      console.error('Error detecting cheating:', err);
      // Không dừng monitoring nếu có lỗi, chỉ log
    }
  };

  // Start monitoring (call API every 5 seconds)
  const startMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsMonitoring(true);
    // Call immediately first time
    detectCheating();

    // Then call every 5 seconds
    intervalRef.current = setInterval(() => {
      detectCheating();
    }, 5000);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    
    // Simulate initial verification progress
    let p = 0;
    const progressInterval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressInterval);
        // Start monitoring after verification
        startMonitoring();
        setTimeout(() => {
          onVerified();
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-clay-inset mb-6 flex items-center justify-center">
        {error ? (
          <div className="text-center p-4 text-red-500">
            <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
            <button onClick={startCamera} className="mt-4 underline">Retry</button>
          </div>
        ) : stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
        ) : (
          <div className="animate-pulse text-gray-400">Initializing Camera...</div>
        )}
        
        {/* Overlay Guides */}
        {stream && !isVerifying && (
          <div className="absolute inset-0 border-4 border-dashed border-primary-500/30 rounded-3xl m-4 pointer-events-none" />
        )}

        {/* Monitoring indicator */}
        {isMonitoring && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Monitoring
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${stream ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <Camera size={18} />
          <span className="text-sm font-medium">{stream ? 'Camera OK' : 'Camera Error'}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${stream ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <Mic size={18} />
          <span className="text-sm font-medium">{stream ? 'Mic OK' : 'Mic Error'}</span>
        </div>
      </div>

      {isVerifying ? (
        <div className="w-full">
          <div className="flex justify-between text-sm mb-2 text-gray-600">
            <span>Generating Face Embedding...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-clay-inset">
            <div 
              className="h-full bg-primary-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <ClayButton 
          disabled={!stream} 
          onClick={handleVerify}
          className={`w-full ${!stream ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckCircle2 size={20} />
          Verify Identity & Start
        </ClayButton>
      )}

      {/* Monitoring status */}
      {isMonitoring && (
        <div className="w-full mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <AlertTriangle size={16} />
              <span>Anti-cheat monitoring active</span>
            </div>
            <div className="text-blue-600 text-xs">
              Detections: {detectionCount}
            </div>
          </div>
          {lastDetection && (
            <div className="text-xs text-blue-500 mt-1">
              Last check: {lastDetection}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCheck;
