import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Sphere, Box } from '@react-three/drei';
import { Group, AnimationMixer, Vector3, MeshStandardMaterial } from 'three';
import { motion } from 'framer-motion';
import LipSync from './LipSync';

interface AIAssistantAvatarProps {
  avatarUrl?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  speechText?: string;
  volume?: number;
  className?: string;
}

interface AvatarModelProps {
  avatarUrl: string;
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  onLoadError: () => void;
  onVisemeChange?: (viseme: string, intensity: number) => void;
}

interface FallbackAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  onVisemeChange?: (viseme: string, intensity: number) => void;
}

// Fallback 3D head model using basic geometry
function FallbackAvatar({ isListening, isSpeaking, volume, onVisemeChange }: FallbackAvatarProps) {
  const headRef = useRef<Group>(null);
  const mouthRef = useRef<Group>(null);
  const leftEyeRef = useRef<Group>(null);
  const rightEyeRef = useRef<Group>(null);
  const [blinkTime, setBlinkTime] = useState(0);

  // Blinking animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Natural blinking every 3-5 seconds
    if (time - blinkTime > 3 + Math.random() * 2) {
      setBlinkTime(time);
    }
    
    const isBlinking = time - blinkTime < 0.15;
    
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScale = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = eyeScale;
      rightEyeRef.current.scale.y = eyeScale;
    }

    // Head movement for attention
    if (headRef.current) {
      if (isListening) {
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        headRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
      } else {
        headRef.current.rotation.y = Math.sin(time * 0.2) * 0.02;
        headRef.current.rotation.x = Math.sin(time * 0.15) * 0.01;
      }
    }

    // Mouth animation based on speaking and volume
    if (mouthRef.current && isSpeaking) {
      const mouthScale = 1 + (volume * 0.3) + Math.sin(time * 8) * 0.1;
      mouthRef.current.scale.setScalar(mouthScale);
    } else if (mouthRef.current) {
      mouthRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={headRef} position={[0, 0, 0]}>
      {/* Head */}
      <Sphere args={[1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#f4c2a1" />
      </Sphere>
      
      {/* Neck */}
      <Box args={[0.6, 0.8, 0.6]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#f4c2a1" />
      </Box>
      
      {/* Shoulders */}
      <Box args={[2.2, 0.6, 1]} position={[0, -1.1, 0]}>
        <meshStandardMaterial color="#4a90e2" />
      </Box>
      
      {/* Eyes */}
      <group ref={leftEyeRef}>
        <Sphere args={[0.12]} position={[-0.25, 0.65, 0.7]}>
          <meshStandardMaterial color="#333" />
        </Sphere>
      </group>
      <group ref={rightEyeRef}>
        <Sphere args={[0.12]} position={[0.25, 0.65, 0.7]}>
          <meshStandardMaterial color="#333" />
        </Sphere>
      </group>
      
      {/* Mouth */}
      <group ref={mouthRef}>
        <Sphere args={[0.08, 0.04, 0.04]} position={[0, 0.35, 0.8]}>
          <meshStandardMaterial color="#e74c3c" />
        </Sphere>
      </group>
    </group>
  );
}

// Ready Player Me avatar component
function ReadyPlayerMeAvatar({ avatarUrl, isListening, isSpeaking, volume, onLoadError, onVisemeChange }: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [blinkTime, setBlinkTime] = useState(0);

  // Load the GLTF model with error handling
  let scene;
  try {
    const gltfResult = useGLTF(avatarUrl);
    scene = gltfResult.scene;
  } catch (error) {
    console.error('Error loading GLTF model:', error);
    onLoadError();
    return null;
  }

  useEffect(() => {
    // Set a timeout to fallback if loading takes too long
    const timeout = setTimeout(() => {
      console.warn('Avatar loading timeout, switching to fallback');
      onLoadError();
    }, 5000);
    setLoadingTimeout(timeout);

    if (!scene) {
      onLoadError();
      return;
    }

    const setupAvatar = async () => {
      try {
        console.log('Setting up Ready Player Me avatar:', avatarUrl);
        const clonedScene = scene.clone();
        
        if (groupRef.current) {
          groupRef.current.clear();
          groupRef.current.add(clonedScene);
          
          // Position for head-and-shoulders view - much closer and larger
          clonedScene.position.set(0, -2.5, 0);
          clonedScene.scale.setScalar(8);
          
          mixerRef.current = new AnimationMixer(clonedScene);
        }
        
        console.log('Avatar setup successful');
        setIsLoaded(true);
        if (loadingTimeout) clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error setting up avatar:', error);
        onLoadError();
      }
    };

    setupAvatar();

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [scene, onLoadError, avatarUrl]);

  // Animation logic
  useFrame((state) => {
    if (!isLoaded || !groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Natural blinking and head movement
    if (time - blinkTime > 3 + Math.random() * 2) {
      setBlinkTime(time);
    }
    
    // Head movement for attention
    if (isListening) {
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.08;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.04;
    } else {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.015;
      groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.008;
    }

    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(0.016);
    }
  });

  if (!isLoaded) {
    return (
      <Html center>
        <div className="text-foreground/60 text-sm animate-pulse">Loading avatar...</div>
      </Html>
    );
  }

  return <group ref={groupRef} />;
}

const AIAssistantAvatar: React.FC<AIAssistantAvatarProps> = ({
  avatarUrl = 'https://models.readyplayer.me/6896e289f1074e9697938176.glb',
  isListening = false,
  isSpeaking = false,
  speechText = '',
  volume = 0,
  className = ''
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [visemeData, setVisemeData] = useState<{ viseme: string; intensity: number }>({ viseme: '', intensity: 0 });

  const handleLoadError = useCallback(() => {
    setUseFallback(true);
  }, []);

  const handleVisemeChange = useCallback((viseme: string, intensity: number) => {
    setVisemeData({ viseme, intensity });
  }, []);

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <style>{`#avatar-canvas canvas {width: 100% !important;height: 100% !important;}`}</style>
      {/* Background with gradient and shadow */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-sm rounded-lg shadow-2xl" />
      
      {/* 3D Canvas */}
      <div
        className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
        id="avatar-canvas"
      >
        <img
          className="_7_i_XA"
          style={{
            width: "200px",
            height: "150px",
            transform: "translate(0px, 0px) rotate(0deg)",
          }}
          crossOrigin="anonymous"
          draggable={false}
          alt="Illustration of a Smiling Female Nurse"
          src="https://media-public.canva.com/abu_Y/MAF-OWabu_Y/1/tl.png"
        />
      </div>

      {/* Lip Sync Component */}
      <LipSync
        text={speechText}
        isPlaying={isSpeaking}
        onVisemeChange={handleVisemeChange}
      />

      {/* Status indicators */}
      {(isListening || isSpeaking) && (
        <motion.div
          className="absolute top-2 right-2 flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {isListening && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/80 text-white text-xs rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Listening
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/80 text-white text-xs rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Speaking
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIAssistantAvatar;