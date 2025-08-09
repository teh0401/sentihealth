import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Group, AnimationMixer, LoopRepeat, Vector3 } from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { motion } from 'framer-motion';

interface Avatar3DProps {
  state: 'idle' | 'listening' | 'speaking' | 'pointing' | 'guiding' | 'celebrating';
  variant: 'realistic' | 'cartoon';
  volume?: number;
  position?: Vector3;
  scale?: number;
  onAnimationComplete?: () => void;
}

interface AvatarModelProps {
  state: Avatar3DProps['state'];
  variant: Avatar3DProps['variant'];
  volume: number;
  scale: number;
  onAnimationComplete?: () => void;
}

// Ready Player Me avatar URLs for different variants
const AVATAR_URLS = {
  realistic: 'https://models.readyplayer.me/6896e289f1074e9697938176.glb',
  cartoon: 'https://models.readyplayer.me/6896e289f1074e9697938176.glb' // Same for now, can be different
};

function AvatarModel({ state, variant, volume, scale, onAnimationComplete }: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the GLTF model
  const { scene, animations } = useGLTF(AVATAR_URLS[variant]);

  useEffect(() => {
    if (!scene) return;

    const setupVRM = async () => {
      try {
        // Clone the scene to avoid sharing between instances
        const clonedScene = scene.clone();
        
        // Look for VRM in the scene
        let vrm: VRM | null = null;
        clonedScene.traverse((object: any) => {
          if (object.userData.vrm) {
            vrm = object.userData.vrm;
          }
        });

        if (vrm) {
          vrmRef.current = vrm;
          
          // Setup animation mixer
          mixerRef.current = new AnimationMixer(vrm.scene);
          
          // Add the VRM scene to our group
          if (groupRef.current) {
            groupRef.current.clear();
            groupRef.current.add(vrm.scene);
          }
        } else {
          // Fallback: use the scene directly if no VRM found
          if (groupRef.current) {
            groupRef.current.clear();
            groupRef.current.add(clonedScene);
            mixerRef.current = new AnimationMixer(clonedScene);
          }
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error setting up VRM:', error);
        // Fallback: use the scene directly
        if (groupRef.current) {
          groupRef.current.clear();
          groupRef.current.add(scene.clone());
          mixerRef.current = new AnimationMixer(scene);
        }
        setIsLoaded(true);
      }
    };

    setupVRM();
  }, [scene]);

  // Animation logic based on state
  useEffect(() => {
    if (!mixerRef.current || !isLoaded) return;

    const mixer = mixerRef.current;
    
    // Clear existing animations
    mixer.stopAllAction();

    // Create basic animations based on state
    const animateState = () => {
      switch (state) {
        case 'listening':
          // Subtle head movement
          if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(Date.now() * 0.002) * 0.1;
          }
          break;
        case 'speaking':
          // Head bobbing and mouth movement simulation
          if (groupRef.current) {
            groupRef.current.rotation.x = Math.sin(Date.now() * 0.01) * 0.05;
            groupRef.current.scale.setScalar(scale + volume * 0.02);
          }
          break;
        case 'pointing':
          // Point gesture - rotate towards direction
          if (groupRef.current) {
            groupRef.current.rotation.y = 0.3;
          }
          break;
        case 'guiding':
          // Walking animation simulation
          if (groupRef.current) {
            groupRef.current.position.z = Math.sin(Date.now() * 0.005) * 0.1;
            groupRef.current.rotation.y = Math.sin(Date.now() * 0.003) * 0.05;
          }
          break;
        case 'celebrating':
          // Celebration movement
          if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(Date.now() * 0.01) * 0.2;
            groupRef.current.position.y = Math.abs(Math.sin(Date.now() * 0.008)) * 0.2;
          }
          setTimeout(() => onAnimationComplete?.(), 2000);
          break;
        default:
          // Idle breathing animation
          if (groupRef.current) {
            groupRef.current.scale.setScalar(scale + Math.sin(Date.now() * 0.003) * 0.01);
          }
          break;
      }
    };

    const interval = setInterval(animateState, 16); // ~60fps
    return () => clearInterval(interval);
  }, [state, volume, scale, isLoaded, onAnimationComplete]);

  // Update mixer
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {!isLoaded && (
        <Html center>
          <div className="text-primary text-sm animate-pulse">Loading avatar...</div>
        </Html>
      )}
    </group>
  );
}

// Preload the models
useGLTF.preload(AVATAR_URLS.realistic);
useGLTF.preload(AVATAR_URLS.cartoon);

const Avatar3D: React.FC<Avatar3DProps> = ({
  state,
  variant = 'realistic',
  volume = 0,
  position = new Vector3(0, -1, 0),
  scale = 1,
  onAnimationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.4} />
        
        <AvatarModel
          state={state}
          variant={variant}
          volume={volume}
          scale={scale}
          onAnimationComplete={onAnimationComplete}
        />
        
        {/* Enable controls for debugging - can be removed */}
        {process.env.NODE_ENV === 'development' && (
          <OrbitControls enableZoom={true} enablePan={false} />
        )}
      </Canvas>

      {/* State indicator overlay */}
      <motion.div
        className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded-md text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: state !== 'idle' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {state}
      </motion.div>
    </motion.div>
  );
};

export default Avatar3D;