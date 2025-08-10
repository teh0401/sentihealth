import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Enhanced3DVoiceAgent from '../avatar/Enhanced3DVoiceAgent';

interface VoiceARIntegrationProps {
  className?: string;
}

const VoiceARIntegration: React.FC<VoiceARIntegrationProps> = ({ className }) => {
  const [destination, setDestination] = useState<string>('');
  const [showHandoffEffect, setShowHandoffEffect] = useState(false);
  const navigate = useNavigate();

  const handleNavigationTrigger = useCallback((dest: string) => {
    setDestination(dest);
    setShowHandoffEffect(true);
    
    // Navigate to AR page after animation with parameters
    setTimeout(() => {
      navigate(`/navigate?fromVoice=true&destination=${encodeURIComponent(dest)}`);
      setShowHandoffEffect(false);
    }, 2500);
  }, [navigate]);

  return (
    <div className={className}>
      {/* Enhanced 3D Voice Agent */}
      <Enhanced3DVoiceAgent onNavigationTrigger={handleNavigationTrigger} />

      {/* Handoff Effect Overlay */}
      <AnimatePresence>
        {showHandoffEffect && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Connecting line animation flowing to navigation */}
            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                d="M 90vw 85vh Q 70vw 60vh Q 50vw 40vh Q 30vw 20vh 10vw 10vh"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10,5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
              
              {/* Animated dots along the path */}
              <motion.circle
                r="6"
                fill="hsl(var(--primary))"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  offsetDistance: ["0%", "100%"]
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ offsetPath: "path('M 90vw 85vh Q 70vw 60vh Q 50vw 40vh Q 30vw 20vh 10vw 10vh')" }}
              />
            </svg>

            {/* AR portal indicator at destination */}
            <motion.div
              className="absolute top-20 left-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.8]
              }}
              transition={{ 
                delay: 1.5,
                duration: 1,
                ease: "easeOut"
              }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  className="text-3xl"
                >
                  🎯
                </motion.div>
              </div>
            </motion.div>

            {/* Voice agent pointing gesture indicator */}
            <motion.div
              className="absolute bottom-6 right-6"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -45, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <motion.div
                  animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="text-2xl"
                >
                  👉
                </motion.div>
              </div>
            </motion.div>

            {/* Floating message */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="bg-card/95 backdrop-blur border rounded-2xl p-6 shadow-2xl max-w-sm text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear", repeat: 1 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  🚀
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">Handing off to AR</h3>
                <p className="text-sm text-muted-foreground">
                  Your voice assistant is transferring you to AR guidance for {destination}
                </p>
              </div>
            </motion.div>

            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400 text-xl pointer-events-none"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                }}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: [0, 180],
                  y: [0, -30]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceARIntegration;