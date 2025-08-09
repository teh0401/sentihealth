import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const ARCameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCamera = useCallback(async () => {
    setError(null);
    console.log('🧪 Testing camera access...');

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported');
      }

      console.log('📊 Browser info:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      });

      // Try basic camera access first
      console.log('📡 Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      console.log('✅ Camera stream obtained:', {
        videoTracks: stream.getVideoTracks().length,
        active: stream.active,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        console.log('🎥 Video playing successfully');
      }

    } catch (err: any) {
      console.error('❌ Camera test failed:', err);
      setError(`Camera Error: ${err.name} - ${err.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    console.log('🛑 Camera stopped');
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h3 className="text-lg font-semibold">AR Camera Test</h3>
      
      <div className="space-y-2">
        <Button onClick={testCamera} disabled={isStreaming}>
          Test Camera Access
        </Button>
        <Button onClick={stopCamera} disabled={!isStreaming} variant="outline">
          Stop Camera
        </Button>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="w-full aspect-video bg-gray-200 rounded overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ backgroundColor: '#000' }}
        />
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div>Status: {isStreaming ? '🟢 Streaming' : '🔴 Not streaming'}</div>
        <div>Protocol: {window.location.protocol}</div>
        <div>Secure Context: {window.isSecureContext ? '✅ Yes' : '❌ No'}</div>
      </div>
    </div>
  );
};

export default ARCameraTest;
