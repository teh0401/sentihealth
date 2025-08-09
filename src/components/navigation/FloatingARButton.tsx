import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Camera, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import ARNavigator from './ARNavigator';

interface FloatingARButtonProps {
  onVoiceTriggered?: boolean;
  onReset?: () => void;
  voiceDestination?: string;
  onHandoffComplete?: () => void;
}

const FloatingARButton: React.FC<FloatingARButtonProps> = ({ 
  onVoiceTriggered = false, 
  onReset,
  voiceDestination,
  onHandoffComplete
}) => {
  const [isARActive, setIsARActive] = useState(false);
  const [isVoiceActivated, setIsVoiceActivated] = useState(false);
  const [destination, setDestination] = useState<string>('');
  const [showHandoffAnimation, setShowHandoffAnimation] = useState(false);

  // Handle voice-triggered activation with handoff animation
  useEffect(() => {
    if (onVoiceTriggered && voiceDestination) {
      setIsVoiceActivated(true);
      setDestination(voiceDestination);
      setShowHandoffAnimation(true);
      
      // Show handoff animation, then start AR
      const handoffTimer = setTimeout(() => {
        setShowHandoffAnimation(false);
        setIsARActive(true);
        onHandoffComplete?.();
      }, 2000);
      
      return () => clearTimeout(handoffTimer);
    }
  }, [onVoiceTriggered, voiceDestination, onHandoffComplete]);

  const handleManualActivation = useCallback(() => {
    if (!isARActive) {
      setDestination('your destination');
      setIsARActive(true);
    }
  }, [isARActive]);

  const handleARComplete = useCallback(() => {
    setIsARActive(false);
    setIsVoiceActivated(false);
    setDestination('');
    onReset?.();
  }, [onReset]);

  if (isARActive) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="bg-card/90 backdrop-blur px-3 py-2 rounded-lg border shadow">
            <p className="text-sm font-medium">Navigating to {destination}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleARComplete}
            className="bg-card/90 backdrop-blur border shadow"
          >
            Exit AR
          </Button>
        </div>
        <ARNavigator />
        <div className="absolute bottom-6 left-4 right-4 flex justify-center">
          <Button 
            variant="hero" 
            onClick={handleARComplete}
            className="bg-primary/90 backdrop-blur"
          >
            I have arrived
          </Button>
        </div>
      </div>
    );
  }

  // Show handoff animation when voice triggers AR
  if (showHandoffAnimation) {
    return (
      <div className="fixed bottom-6 left-6 z-30">
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          {/* Pulsing connection line from voice agent to AR button */}
          <motion.div
            className="absolute bottom-0 left-0 w-screen h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* AR Button with enhanced glow */}
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 0.8,
              repeat: 2,
              ease: "easeInOut"
            }}
          >
            <Button
              size="lg"
              className={cn(
                "w-16 h-16 rounded-full shadow-lg transition-all duration-500",
                "bg-green-500 hover:bg-green-400 text-white",
                "ring-4 ring-green-400/50 animate-pulse"
              )}
              style={{
                boxShadow: "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear" }}
              >
                <Navigation className="w-6 h-6" />
              </motion.div>
            </Button>
            
            {/* Floating sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400 text-lg pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  fontSize: '16px'
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
                  x: Math.cos(i * 60 * Math.PI / 180) * 40,
                  y: Math.sin(i * 60 * Math.PI / 180) * 40
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
          
          {/* Handoff message */}
          <motion.div
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur px-4 py-2 rounded-lg border shadow-lg min-w-max"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-medium text-center">
              🤖 → 📍 Activating AR guidance...
            </p>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-30">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Button
          onClick={handleManualActivation}
          size="lg"
          className={cn(
            "w-16 h-16 rounded-full shadow-lg transition-all duration-500",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "hover:scale-110",
            isVoiceActivated && "ring-4 ring-primary/50 bg-green-500 animate-bounce"
          )}
          aria-label={isVoiceActivated ? `Navigate to ${destination}` : "Start AR Navigation"}
        >
          <AnimatePresence mode="wait">
            {isVoiceActivated ? (
              <motion.div
                key="voice-activated"
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Navigation className="w-6 h-6" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="manual"
                className="flex flex-col items-center gap-0.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MapPin className="w-5 h-5" />
                <Camera className="w-3 h-3 opacity-70" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      
      {isVoiceActivated && (
        <motion.div 
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur px-3 py-2 rounded-lg border shadow-lg min-w-max"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <p className="text-xs font-medium whitespace-nowrap">
            Ready to guide you to {destination}
          </p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FloatingARButton;