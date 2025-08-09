import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Navigation, RotateCcw } from 'lucide-react';
import Avatar3D from '../avatar/Avatar3D';

// Simulated BLE positioning data
interface Position {
  x: number;
  y: number;
  z: number;
  heading?: number;
}

interface RouteNode {
  id: string;
  position: Vector3;
  type: 'waypoint' | 'turn' | 'destination';
  instruction?: string;
}

// Simple indoor routing graph
const INDOOR_GRAPH: Record<string, RouteNode[]> = {
  'entrance_to_conference': [
    { id: 'start', position: new Vector3(0, 0, 0), type: 'waypoint' },
    { id: 'hallway1', position: new Vector3(5, 0, 0), type: 'waypoint', instruction: 'Go straight ahead' },
    { id: 'turn1', position: new Vector3(5, 0, 5), type: 'turn', instruction: 'Turn left here' },
    { id: 'hallway2', position: new Vector3(0, 0, 5), type: 'waypoint', instruction: 'Continue straight' },
    { id: 'conference', position: new Vector3(-3, 0, 5), type: 'destination', instruction: 'Conference room ahead' }
  ],
  'entrance_to_cafeteria': [
    { id: 'start', position: new Vector3(0, 0, 0), type: 'waypoint' },
    { id: 'hallway1', position: new Vector3(5, 0, 0), type: 'waypoint', instruction: 'Go straight ahead' },
    { id: 'turn1', position: new Vector3(5, 0, -5), type: 'turn', instruction: 'Turn right here' },
    { id: 'cafeteria', position: new Vector3(8, 0, -5), type: 'destination', instruction: 'Cafeteria entrance' }
  ]
};

// TTS helper
const say = (msg: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

interface AR3DNavigatorProps {
  autoStart?: boolean;
  fullscreen?: boolean;
  destination?: string;
}

// 3D Arrow component
function DirectionalArrow({ direction, distance }: { direction: Vector3; distance: number }) {
  const groupRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.atan2(direction.x, direction.z);
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, -2]}>
      <mesh>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-sm">
          {distance.toFixed(1)}m
        </div>
      </Html>
    </group>
  );
}

// 3D Guide Avatar in AR space
function GuideAvatar({ position, state }: { position: Vector3; state: any }) {
  return (
    <group position={[position.x, position.y + 1, position.z]}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.7} />
      </mesh>
      <Html position={[0, 1, 0]} center>
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
          AI Guide
        </div>
      </Html>
    </group>
  );
}

const AR3DNavigator: React.FC<AR3DNavigatorProps> = ({ 
  autoStart = false, 
  fullscreen = false,
  destination = 'Conference Room'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
  const [route, setRoute] = useState<RouteNode[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  // Clean up camera stream
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Calculate route using simple pathfinding
  const calculateRoute = useCallback((dest: string) => {
    const routeKey = dest.toLowerCase().includes('conference') 
      ? 'entrance_to_conference'
      : 'entrance_to_cafeteria';
    
    const routeNodes = INDOOR_GRAPH[routeKey] || INDOOR_GRAPH['entrance_to_conference'];
    setRoute(routeNodes);
    setCurrentStepIndex(0);
    return routeNodes;
  }, []);

  // Helper to start a camera stream with a preferred facing mode, with fallbacks
  const startStreamWithFacing = useCallback(async (facing: 'environment' | 'user'): Promise<MediaStream> => {
    // Try preferred facing with constraints
    const preferredConstraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
      }
    } as any;
    try {
      return await navigator.mediaDevices.getUserMedia(preferredConstraints);
    } catch (err: any) {
      // Fallback to simple facing string
      try {
        return await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
      } catch {
        // Final fallback to any camera
        return await navigator.mediaDevices.getUserMedia({ video: true });
      }
    }
  }, []);

  // Start AR guidance
  const startGuidance = useCallback(async () => {
    if (active) return;
    
    console.log('🚀 AR Navigation: Starting guidance process...');
    console.log('🔍 Current state:', { active, loading, error, permissionDenied });
    
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      console.log('📷 Checking camera availability...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not supported in this browser');
        throw new Error('Camera API not supported in this browser');
      }
      
      console.log('✅ Camera API is available');
      console.log('🔒 Secure context check:', window.isSecureContext);
      console.log('🌐 Navigator details:', {
        userAgent: navigator.userAgent,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices.getUserMedia
      });

      // Calculate route first
      const routeNodes = calculateRoute(destination);
      
      console.log('📡 Requesting camera permission. Preferred facing:', cameraFacing);
      const stream = await startStreamWithFacing(cameraFacing);
      streamRef.current = stream;
      
      console.log('✅ Camera stream obtained:', {
        stream,
        videoTracks: stream.getVideoTracks(),
        trackCount: stream.getVideoTracks().length,
        active: stream.active,
        firstTrackSettings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      if (videoRef.current) {
        console.log('📺 Setting up video element...', {
          videoElement: videoRef.current,
          videoElementSize: {
            width: videoRef.current.offsetWidth,
            height: videoRef.current.offsetHeight
          }
        });
        
        videoRef.current.srcObject = stream;
        console.log('🔗 Stream assigned to video element');
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              readyState: videoRef.current?.readyState,
              currentTime: videoRef.current?.currentTime
            });
            resolve(true);
          };
          
          videoRef.current.onerror = (e) => {
            console.error('❌ Video error:', e);
            reject(new Error('Video playback failed'));
          };
          
          videoRef.current.onloadstart = () => {
            console.log('⏳ Video loading started');
          };
          
          videoRef.current.oncanplay = () => {
            console.log('▶️ Video can start playing');
          };
          
          // Also try to play immediately
          console.log('🎬 Attempting to play video...');
          videoRef.current.play().catch((playError) => {
            console.error('❌ Video play failed:', playError);
            reject(playError);
          });
        });
        
        console.log('🎥 Video is playing successfully');
      } else {
        console.error('❌ Video ref is null');
      }

      setActive(true);
      setLoading(false);
      
      // Start navigation instructions
      say(`Starting navigation to ${destination}. Look for the green arrow to guide you.`);
      
      // Simulate position updates
      simulatePositionUpdates();
      
    } catch (err: any) {
      console.error('❌ Camera access error:', {
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack,
        constraint: err.constraint
      });
      setLoading(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        console.error('🚫 Permission denied for camera access');
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
       } else if (err.name === 'NotFoundError') {
        console.error('📷 No camera found on device');
        setError('No camera found. Please ensure your device has a working camera.');
      } else if (err.name === 'NotSupportedError') {
        console.error('🚫 Camera not supported in browser');
        setError('Camera not supported in this browser. Try using Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError') {
        console.error('🔒 Camera in use by another application');
        setError('Camera is being used by another application. Please close other apps using the camera.');
       } else if (err.name === 'OverconstrainedError') {
        console.error('⚙️ Camera constraints too restrictive, trying fallback...');
        // Try with less restrictive constraints
        console.log('Constraints too restrictive, trying with basic constraints...');
        try {
          console.log('🔄 Attempting basic camera access...');
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = basicStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            await videoRef.current.play();
          }
          
          setActive(true);
          setLoading(false);
          say(`Starting navigation to ${destination}. Look for the green arrow to guide you.`);
          simulatePositionUpdates();
          return;
        } catch (basicErr) {
          setError('Camera constraints not supported. Please try a different device or browser.');
        }
      } else {
        setError(err.message || 'Failed to access camera. Please check your browser permissions and try again.');
      }
    }
  }, [active, destination, calculateRoute]);

  // Simulate BLE positioning updates
  const simulatePositionUpdates = useCallback(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step < route.length) {
        const targetNode = route[step];
        setCurrentPosition({
          x: targetNode.position.x,
          y: targetNode.position.y,
          z: targetNode.position.z
        });
        
        if (targetNode.instruction) {
          say(targetNode.instruction);
        }
        
        setCurrentStepIndex(step);
        step++;
        
        if (step >= route.length) {
          setArrived(true);
          say(`You have arrived at ${destination}!`);
          clearInterval(interval);
        }
      }
    }, 3000); // Move to next waypoint every 3 seconds
    
    return () => clearInterval(interval);
  }, [route, destination]);

  // Auto-start if requested (prevent multiple calls)
  useEffect(() => {
    console.log('🔄 Auto-start effect triggered:', {
      autoStart,
      active,
      loading,
      error,
      permissionDenied
    });
    
    if (autoStart && !active && !loading && !error && !permissionDenied) {
      console.log('🚀 Auto-starting AR navigation...');
      startGuidance();
    }
    
    return cleanupStream;
  }, [autoStart]); // Simplified dependencies to prevent loops

  // Calculate direction to next waypoint
  const getDirectionToNext = useCallback(() => {
    if (currentStepIndex >= route.length - 1) return new Vector3(0, 0, 0);
    
    const current = route[currentStepIndex];
    const next = route[currentStepIndex + 1];
    
    return next.position.clone().sub(current.position).normalize();
  }, [route, currentStepIndex]);

  // Calculate distance to next waypoint
  const getDistanceToNext = useCallback(() => {
    if (currentStepIndex >= route.length - 1) return 0;
    
    const current = route[currentStepIndex];
    const next = route[currentStepIndex + 1];
    
    return current.position.distanceTo(next.position);
  }, [route, currentStepIndex]);

  if (error && !active) {
    return (
      <div className={`${fullscreen ? 'fixed inset-0' : 'relative w-full h-96'} bg-background flex items-center justify-center`}>
        <div className="text-center p-6 max-w-md">
          <div className="text-destructive mb-4 text-sm">{error}</div>
          {permissionDenied && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                To enable camera access:
                <br />1. Click the camera icon in your browser's address bar
                <br />2. Select "Allow" for camera permissions
                <br />3. Refresh the page and try again
              </div>
              <Button onClick={startGuidance} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          {!permissionDenied && (
            <Button onClick={startGuidance} variant="outline">
              Retry Camera Access
            </Button>
          )}
        </div>
      </div>
    );
  }

  const flipCamera = useCallback(async () => {
    try {
      const next = cameraFacing === 'environment' ? 'user' : 'environment';
      cleanupStream();
      const stream = await startStreamWithFacing(next);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraFacing(next);
    } catch (err) {
      console.error('Flip camera failed', err);
      setError('Failed to switch camera.');
    }
  }, [cameraFacing, startStreamWithFacing, cleanupStream]);

  return (
    <div className={`${fullscreen ? 'fixed inset-0' : 'relative w-full h-96'} bg-black overflow-hidden`}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ 
          backgroundColor: '#000',
          zIndex: 5,
          transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' // Mirror only front camera
        }}
      />

      {/* 3D AR Overlays */}
      {active && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 1.5, 0], fov: 75 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, preserveDrawingBuffer: true }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />

            {/* Directional arrow */}
            {!arrived && route.length > 0 && (
              <DirectionalArrow 
                direction={getDirectionToNext()} 
                distance={getDistanceToNext()} 
              />
            )}

            {/* Guide avatar */}
            {route.length > 0 && currentStepIndex < route.length && (
              <GuideAvatar 
                position={route[currentStepIndex].position}
                state={arrived ? 'celebrating' : 'guiding'}
              />
            )}

            {/* Destination marker */}
            {route.length > 0 && (
              <group position={[route[route.length - 1].position.x, 1, route[route.length - 1].position.z]}>
                <mesh>
                  <cylinderGeometry args={[0.5, 0.5, 2]} />
                  <meshBasicMaterial color="#ff4444" transparent opacity={0.6} />
                </mesh>
                <Text
                  position={[0, 2, 0]}
                  fontSize={0.5}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {destination}
                </Text>
              </group>
            )}
          </Canvas>
        </div>
      )}

      {/* UI Overlays */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            Starting AR Navigation...
          </div>
        </div>
      )}

      {/* Navigation info */}
      {active && (
        <motion.div
          className="absolute top-4 left-4 right-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ zIndex: 20 }}
        >
          <div className="bg-black/80 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                AR Navigation
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActive(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
              <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Camera Active
              </div>
              <div>Destination: {destination}</div>
              {route.length > 0 && currentStepIndex < route.length && (
                <div>
                  Step {currentStepIndex + 1} of {route.length}: {route[currentStepIndex].instruction || 'Continue forward'}
                </div>
              )}
              {arrived && (
                <div className="text-green-400 font-semibold">🎉 You have arrived!</div>
              )}
                <div className="pt-2 flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={flipCamera} className="text-black">
                    <RotateCcw className="h-4 w-4 mr-1" /> Flip Camera
                  </Button>
                  <span className="opacity-70 text-xs">Using: {cameraFacing === 'environment' ? 'Back' : 'Front'} camera</span>
                </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Start button */}
      {!active && !loading && !error && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
          <Button onClick={startGuidance} size="lg" className="text-lg px-8">
            Start AR Navigation
          </Button>
          <div className="text-white text-sm text-center max-w-sm opacity-75">
            This will request camera access to show AR navigation overlays
          </div>
        </div>
      )}
    </div>
  );
};

export default AR3DNavigator;