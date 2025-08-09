import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Lightweight AR-like overlay: camera feed with on-screen arrow guidance + TTS
const say = (msg: string) => {
  try {
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
};

const ARNavigator: React.FC<{ autoStart?: boolean; fullscreen?: boolean }> = ({ 
  autoStart = false, 
  fullscreen = false 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [step, setStep] = useState(0);

  const cleanupStream = useCallback(() => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startGuidance = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Camera not supported in this browser.';
      setError(msg);
      toast({ title: 'Camera not available', description: msg });
      return;
    }
    if (!window.isSecureContext) {
      const msg = 'Camera requires HTTPS context.';
      setError(msg);
      toast({ title: 'Secure context required', description: msg });
      return;
    }
    setLoading(true);
    try {
      const constraints: MediaStreamConstraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!stream || stream.getVideoTracks().length === 0) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        (video as any).playsInline = true;
        (video as any).autoplay = true;
        video.srcObject = stream;
        try {
          await video.play();
        } catch (err) {
          console.warn('Video play blocked:', err);
        }
      }
      setActive(true);
      say('Starting guidance. Walk straight for 20 meters.');
      setStep(1);
    } catch (e: any) {
      console.error('getUserMedia failed', e);
      let msg = e?.message || 'Unable to access camera.';
      if (e?.name === 'NotAllowedError') {
        msg = 'Camera permission was denied. Please allow access and try again.';
        setPermissionDenied(true); // Prevent auto-retry
      } else if (e?.name === 'NotFoundError') {
        msg = 'No camera was found on this device.';
        setPermissionDenied(true); // Prevent auto-retry
      }
      setError(msg);
      toast({ title: 'Camera error', description: msg });
      cleanupStream();
    } finally {
      setLoading(false);
    }
  }, [cleanupStream]);

  // Auto-start camera when autoStart is enabled (but only once)
  useEffect(() => {
    if (autoStart && !active && !loading && !permissionDenied && !error) {
      console.log('Auto-starting AR guidance...');
      startGuidance();
    }
  }, [autoStart, active, loading, permissionDenied, error]); // Removed startGuidance from dependencies

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      if (step === 1) {
        say('Turn left at the reception.');
        setStep(2);
      } else if (step === 2) {
        say('You have arrived at Cardiology, Room 203.');
        setStep(3);
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [active, step]);

  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-black" 
    : "relative w-full aspect-[9/16] max-w-sm mx-auto overflow-hidden rounded-2xl border bg-card shadow";

  return (
    <div className={containerClasses}>
      {!active && (error || permissionDenied) && (
        <div className="absolute inset-0 grid place-items-center p-6 bg-background/90 backdrop-blur">
          <div className="text-center space-y-4">
            <p className="text-sm text-destructive" role="alert">{error}</p>
            {permissionDenied && (
              <Button 
                onClick={() => {
                  setPermissionDenied(false);
                  setError(null);
                  startGuidance();
                }} 
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
      {active && (
        <>
          <div className="absolute inset-0 pointer-events-none flex items-end justify-center p-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary grid place-items-center animate-pulse">
              <div className="w-12 h-12 rotate-90 border-l-8 border-t-8 border-primary rounded-sm" aria-hidden />
            </div>
          </div>
          
          {/* Distance and direction indicators */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg">
              <p className="text-xs font-medium">20m ahead</p>
            </div>
            <div className="bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg">
              <p className="text-xs font-medium">Turn left</p>
            </div>
          </div>
          
          {/* Floor arrows overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="transform translate-y-16">
              <div className="w-16 h-16 border-4 border-primary/70 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ARNavigator;
