import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Camera, 
  RotateCcw, 
  Navigation, 
  MapPin, 
  TrendingUp, 
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';

interface ARDirection {
  id: string;
  type: 'straight' | 'left' | 'right' | 'destination';
  distance: number;
  instruction: string;
  landmark?: string;
}

// Simulated route directions
const MOCK_DIRECTIONS: ARDirection[] = [
  { id: '1', type: 'straight', distance: 20, instruction: 'Walk straight ahead', landmark: 'Main entrance' },
  { id: '2', type: 'right', distance: 15, instruction: 'Turn right at the information desk', landmark: 'Information counter' },
  { id: '3', type: 'left', distance: 10, instruction: 'Turn left towards the elevators', landmark: 'Elevator bank' },
  { id: '4', type: 'straight', distance: 25, instruction: 'Walk straight down the corridor', landmark: 'Pediatric ward' },
  { id: '5', type: 'destination', distance: 0, instruction: 'You have arrived at your destination', landmark: 'Cardiology Department' }
];

const EnhancedARNavigator: React.FC<{ autoStart?: boolean; fullscreen?: boolean }> = ({ 
  autoStart = false, 
  fullscreen = false 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isNavigating, setIsNavigating] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Text-to-speech helper
  const speak = useCallback((msg: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  }, []);

  const cleanupStream = useCallback(() => {
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    } catch {}
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (preferredFacingMode: 'environment' | 'user') => {
    setError(null);
    setLoading(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Camera not supported in this browser.';
      setError(msg);
      toast({ title: 'Camera not available', description: msg, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!window.isSecureContext) {
      const msg = 'Camera requires HTTPS context.';
      setError(msg);
      toast({ title: 'Secure context required', description: msg, variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      // Stop existing stream first
      cleanupStream();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Fallback if preferred camera not available
      if (!stream || stream.getVideoTracks().length === 0) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      
      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.srcObject = stream;
        
        try {
          await video.play();
          setActive(true);
          setFacingMode(preferredFacingMode);
          
          // Only start navigation if camera is actually working
          if (autoStart && !isNavigating) {
            setTimeout(() => {
              if (active) { // Double-check camera is still active
                startNavigation();
              }
            }, 1000);
          }
        } catch (err) {
          console.warn('Video play blocked:', err);
          setActive(false); // Ensure active is false if video fails
          toast({ title: 'Camera blocked', description: 'Please tap the camera button to enable video.', variant: 'destructive' });
        }
      }
    } catch (error: any) {
      console.error('getUserMedia failed', error);
      let msg = error?.message || 'Unable to access camera.';
      
      if (error?.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access and try again.';
        setPermissionDenied(true);
      } else if (error?.name === 'NotFoundError') {
        msg = 'No camera found on this device.';
      } else if (error?.name === 'NotReadableError') {
        msg = 'Camera is already in use by another application.';
      }
      
      setError(msg);
      toast({ title: 'Camera Error', description: msg, variant: 'destructive' });
    }
    
    setLoading(false);
  }, [autoStart, cleanupStream, isNavigating]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newFacingMode);
    toast({ 
      title: 'Camera switched', 
      description: `Now using ${newFacingMode === 'environment' ? 'rear' : 'front'} camera` 
    });
  }, [facingMode, startCamera]);

  const startNavigation = useCallback(() => {
    if (!active) {
      toast({ title: 'Camera required', description: 'Please start the camera first to begin navigation.', variant: 'destructive' });
      return;
    }
    setIsNavigating(true);
    setCurrentDirection(0);
    setSimulatedProgress(0);
    speak(MOCK_DIRECTIONS[0].instruction);
    toast({ title: 'Navigation started', description: 'Follow the AR directions overlay.' });
  }, [active, speak]);

  const nextDirection = useCallback(() => {
    if (currentDirection < MOCK_DIRECTIONS.length - 1) {
      const next = currentDirection + 1;
      setCurrentDirection(next);
      speak(MOCK_DIRECTIONS[next].instruction);
      setSimulatedProgress(0);
    } else {
      setIsNavigating(false);
      speak('You have reached your destination. Thank you for using MOH Navigation.');
      toast({ title: 'Destination reached', description: 'Navigation complete!' });
    }
  }, [currentDirection, speak]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentDirection(0);
    setSimulatedProgress(0);
    window.speechSynthesis.cancel();
    cleanupStream();
    setActive(false);
    toast({ title: 'Navigation stopped', description: 'Camera has been turned off.' });
  }, [cleanupStream]);

  // Simulate progress for demonstration
  useEffect(() => {
    if (isNavigating && active) {
      const interval = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) {
            nextDirection();
            return 0;
          }
          return prev + 2;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isNavigating, active, nextDirection]);

  // Auto-start camera if specified
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (autoStart && !active && !loading && !error) {
      // Add a small delay to ensure component is mounted
      timeoutId = setTimeout(async () => {
        try {
          await startCamera(facingMode);
        } catch (err) {
          console.error('Auto-start camera failed:', err);
          // Don't show error immediately, let user manually start
        }
      }, 500); // Increased delay for better reliability
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cleanupStream();
      window.speechSynthesis.cancel();
    };
  }, [autoStart, active, loading, error, facingMode, startCamera, cleanupStream]);

  const getDirectionIcon = (type: string) => {
    switch (type) {
      case 'left': return '↰';
      case 'right': return '↱';
      case 'straight': return '↑';
      case 'destination': return '🎯';
      default: return '↑';
    }
  };

  const getDirectionColor = (type: string) => {
    switch (type) {
      case 'destination': return 'text-green-400';
      case 'left': case 'right': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-30">
        {/* Camera feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* AR Overlay */}
        {active && isNavigating && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Direction indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className={`text-8xl font-bold ${getDirectionColor(MOCK_DIRECTIONS[currentDirection]?.type)} drop-shadow-lg`}>
                {getDirectionIcon(MOCK_DIRECTIONS[currentDirection]?.type)}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-20 left-4 right-4">
              <div className="bg-black/70 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Navigation className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">
                    Step {currentDirection + 1} of {MOCK_DIRECTIONS.length}
                  </span>
                </div>
                <p className="text-white text-sm mb-3">
                  {MOCK_DIRECTIONS[currentDirection]?.instruction}
                </p>
                {MOCK_DIRECTIONS[currentDirection]?.landmark && (
                  <p className="text-blue-300 text-xs mb-3">
                    Landmark: {MOCK_DIRECTIONS[currentDirection].landmark}
                  </p>
                )}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${simulatedProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="absolute top-4 right-4 space-y-2 pointer-events-auto">
          {active && (
            <Button
              onClick={switchCamera}
              variant="outline"
              size="sm"
              className="bg-black/50 backdrop-blur border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={stopNavigation}
            variant="destructive"
            size="sm"
            className="bg-red-600/80 backdrop-blur hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 left-4 space-y-2 pointer-events-none">
          <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/20 text-white">
            <Camera className="h-3 w-3 mr-1" />
            {facingMode === 'environment' ? 'Rear' : 'Front'} Camera
          </Badge>
          
          {isNavigating && (
            <Badge variant="outline" className="bg-blue-600/80 backdrop-blur border-blue-300 text-white">
              <Navigation className="h-3 w-3 mr-1" />
              Navigating
            </Badge>
          )}
        </div>

        {/* Loading/Error states */}
        {loading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="max-w-sm mx-4">
              <CardContent className="p-6 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="font-medium">Starting camera...</p>
                <p className="text-sm text-muted-foreground mt-1">Please wait</p>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="max-w-sm mx-4">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="font-medium mb-2">Camera Error</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => startCamera(facingMode)} 
                    className="w-full"
                    disabled={loading}
                  >
                    Try Again
                  </Button>
                  {permissionDenied && (
                    <p className="text-xs text-muted-foreground">
                      Please enable camera permissions in your browser settings
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!active && !loading && !error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="max-w-sm mx-4">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">AR Navigation Ready</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tap to start camera and begin AR-guided navigation
                </p>
                <Button 
                  onClick={() => startCamera(facingMode)} 
                  className="w-full mb-3"
                  disabled={loading}
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {autoStart ? 'Tap to Start Camera' : 'Start Camera'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => startCamera('environment')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Rear
                  </Button>
                  <Button
                    onClick={() => startCamera('user')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    Front
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 opacity-80">
                  Camera permissions required for AR navigation
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Non-fullscreen version for testing/preview
  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />
        
        {active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl text-white drop-shadow-lg">
              {getDirectionIcon(MOCK_DIRECTIONS[currentDirection]?.type)}
            </div>
          </div>
        )}
        
        {!active && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => startCamera(facingMode)} 
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Starting...' : 'Start Camera'}
        </Button>
        
        {active && (
          <Button onClick={switchCamera} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        
        {active && !isNavigating && (
          <Button onClick={startNavigation} variant="outline">
            <Navigation className="h-4 w-4" />
          </Button>
        )}
        
        {isNavigating && (
          <Button onClick={nextDirection} variant="outline">
            Next
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedARNavigator;
