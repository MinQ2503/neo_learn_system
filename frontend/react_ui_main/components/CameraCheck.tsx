import React, { useEffect, useRef, useState } from 'react';
import ClayButton from './ClayButton';
import { Camera, CameraOff, Mic, CheckCircle2 } from 'lucide-react';

interface CameraCheckProps {
  onVerified: () => void;
}

const CameraCheck: React.FC<CameraCheckProps> = ({ onVerified }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate embedding generation
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onVerified();
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
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
    </div>
  );
};

export default CameraCheck;
