import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  className?: string;
}

const CameraView: React.FC<CameraViewProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setIsLoading(true);
      setError('');

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Error accessing camera. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (isCameraOn) {
      await startCamera(newFacingMode);
    }
  }, [facingMode, isCameraOn, startCamera]);

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center p-6"
          >
            <div className="text-white text-center max-w-sm">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p className="text-lg font-semibold mb-2">Camera Error</p>
              <p className="text-sm text-gray-300 mb-4">{error}</p>
              <Button
                onClick={() => startCamera()}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera controls overlay */}
      {isCameraOn && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
            {/* Camera type indicator */}
            <div className="text-white text-sm font-medium">
              {facingMode === 'user' ? 'Front Camera' : 'Rear Camera'}
            </div>

            {/* Switch camera button */}
            <Button
              onClick={switchCamera}
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full h-12 w-12"
              disabled={isLoading}
            >
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isCameraOn && !error
            ? 'bg-green-500/80 text-white'
            : 'bg-red-500/80 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isCameraOn && !error ? 'bg-white animate-pulse' : 'bg-white'
          }`} />
          {isCameraOn && !error ? 'Camera Active' : 'Camera Inactive'}
        </div>
      </div>
    </div>
  );
};

export default CameraView;