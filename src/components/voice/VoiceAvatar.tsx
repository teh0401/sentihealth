import React from 'react';
import { motion, Variants } from 'framer-motion';

interface VoiceAvatarProps {
  state: 'idle' | 'listening' | 'speaking' | 'pointing' | 'celebrating';
  size?: 'small' | 'medium' | 'large';
  volume?: number;
}

const VoiceAvatar: React.FC<VoiceAvatarProps> = ({ 
  state, 
  size = 'medium', 
  volume = 0 
}) => {
  const sizeMap = {
    small: { width: 40, height: 40, eyeSize: 2, mouthHeight: 3 },
    medium: { width: 60, height: 60, eyeSize: 3, mouthHeight: 4 },
    large: { width: 80, height: 80, eyeSize: 4, mouthHeight: 6 }
  };

  const { width, height, eyeSize, mouthHeight } = sizeMap[size];

  // Animation variants for different states
  const containerVariants: Variants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: [0.4, 0, 0.6, 1]
      }
    },
    listening: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    speaking: {
      scale: 1,
      rotate: [-2, 2, -2],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    pointing: {
      rotate: [0, 15, 0],
      x: [0, 5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    celebrating: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: {
        duration: 0.8,
        repeat: 2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  // Eye blinking animation
  const eyeVariants: Variants = {
    idle: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.15,
        repeat: Infinity,
        repeatDelay: 3,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    listening: {
      scaleY: 1,
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    speaking: { scaleY: 1 },
    pointing: { scaleY: 1 },
    celebrating: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.1,
        repeat: 8,
        ease: [0.4, 0, 0.6, 1]
      }
    }
  };

  // Mouth animation based on state and volume
  const getMouthHeight = () => {
    if (state === 'speaking') {
      return Math.max(mouthHeight, mouthHeight + volume * 15);
    }
    if (state === 'listening') {
      return mouthHeight * 0.7;
    }
    if (state === 'celebrating') {
      return mouthHeight * 2;
    }
    return mouthHeight;
  };

  const mouthVariants: Variants = {
    idle: {
      height: mouthHeight,
      borderRadius: mouthHeight / 2
    },
    listening: {
      height: mouthHeight * 0.7,
      width: [width * 0.2, width * 0.15, width * 0.2],
      borderRadius: mouthHeight / 2,
      transition: {
        width: {
          duration: 2,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    },
    speaking: {
      height: getMouthHeight(),
      width: [width * 0.15, width * 0.25, width * 0.15],
      borderRadius: [mouthHeight / 2, mouthHeight * 1.5, mouthHeight / 2],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    pointing: {
      height: mouthHeight,
      width: width * 0.1,
      borderRadius: mouthHeight / 2
    },
    celebrating: {
      height: mouthHeight * 2,
      width: width * 0.3,
      borderRadius: mouthHeight,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width, height }}
      variants={containerVariants}
      animate={state}
      initial="idle"
    >
      {/* Glow effect for listening/speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Main avatar circle */}
      <div 
        className="relative rounded-full bg-primary flex items-center justify-center"
        style={{ width: width * 0.9, height: height * 0.9 }}
      >
        {/* Face container */}
        <div className="relative">
          {/* Eyes */}
          <div className="flex gap-2 mb-2">
            <motion.div
              className="bg-primary-foreground rounded-full"
              style={{ width: eyeSize * 2, height: eyeSize * 2 }}
              variants={eyeVariants}
              animate={state}
            />
            <motion.div
              className="bg-primary-foreground rounded-full"
              style={{ width: eyeSize * 2, height: eyeSize * 2 }}
              variants={eyeVariants}
              animate={state}
            />
          </div>

          {/* Mouth */}
          <motion.div
            className="bg-primary-foreground mx-auto"
            style={{ 
              width: width * 0.2, 
              height: mouthHeight,
              borderRadius: mouthHeight / 2
            }}
            variants={mouthVariants}
            animate={state}
          />
        </div>

        {/* Pointing hand for pointing state */}
        {state === 'pointing' && (
          <motion.div
            className="absolute -right-2 top-1/2 text-primary-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              rotate: [0, 10, 0]
            }}
            transition={{
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            👉
          </motion.div>
        )}

        {/* Celebration particles */}
        {state === 'celebrating' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{
                  left: '50%',
                  top: '50%',
                  fontSize: '12px'
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceAvatar;