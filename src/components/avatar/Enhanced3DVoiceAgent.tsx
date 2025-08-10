import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import AIAssistantAvatar from "./AIAssistantAvatar";
import LipSync from "./LipSync";
import { WebhookService } from "@/services/webhookService";
import { AudioRecorder, getCurrentUserId } from "@/services/audioRecorder";

// Check for speech support
const hasSpeech = typeof window !== 'undefined' && 
  'speechSynthesis' in window && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

// Type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Speech synthesis helper
const speak = (text: string, onStart?: () => void, onEnd?: () => void) => {
  if (!window.speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  
  window.speechSynthesis.speak(utterance);
};

interface Enhanced3DVoiceAgentProps {
  onNavigationTrigger?: (destination: string) => void;
  variant?: 'realistic' | 'cartoon';
}

const Enhanced3DVoiceAgent: React.FC<Enhanced3DVoiceAgentProps> = ({ 
  onNavigationTrigger,
  variant = 'realistic'
}) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState("");
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'pointing' | 'guiding' | 'celebrating'>('idle');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  // Handle understanding and responses
  const handleUnderstanding = useCallback(async (text: string, audioFile?: Blob) => {
    console.log('Voice input received:', text);
    
    const lowerText = text.toLowerCase().trim();
    
    // Enhanced navigation detection patterns
    const navigationPatterns = [
      /(?:navigate|direct|guide|take|show)\s+(?:me\s+)?(?:to|the\s+way\s+to)\s+(.+)/i,
      /(?:where\s+is|find|locate)\s+(?:the\s+)?(.+?)(?:\s+(?:room|ward|department|office|clinic))?$/i,
      /(?:go\s+to|head\s+to|walk\s+to)\s+(.+)/i,
      /(?:directions?\s+to|route\s+to|path\s+to)\s+(.+)/i,
      /(?:how\s+do\s+i\s+get\s+to)\s+(.+)/i
    ];

    let isNavigationCommand = false;
    let destination = '';

    // Check each pattern
    for (const pattern of navigationPatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        destination = match[1].trim();
        
        // Additional validation: must contain location-related keywords
        const locationKeywords = ['room', 'ward', 'department', 'office', 'clinic', 'pharmacy', 'lab', 'radiology', 'emergency', 'reception', 'toilet', 'cafeteria', 'exit', 'entrance', 'floor', 'wing'];
        const hasLocationKeyword = locationKeywords.some(keyword => 
          destination.includes(keyword) || lowerText.includes(keyword)
        );
        
        // Or contains numbers (likely room numbers)
        const hasNumbers = /\d/.test(destination);
        
        if (hasLocationKeyword || hasNumbers || destination.length > 2) {
          isNavigationCommand = true;
          break;
        }
      }
    }
    
    if (isNavigationCommand && destination) {
      console.log('Navigation command detected with destination:', destination);
      await speakWithAnim(`Starting navigation to ${destination}. Opening camera view now.`);
      
      // Close the dialog immediately
      setIsExpanded(false);
      
      setTimeout(() => {
        console.log('Navigating to /navigate page with destination:', destination);
        // Navigate directly to the /navigate page with parameters
        navigate(`/navigate?fromVoice=true&destination=${encodeURIComponent(destination)}`);
        setAvatarState('guiding');
        
        // Also call the callback if provided
        onNavigationTrigger?.(destination);
      }, 1000);
      return;
    }

    try {
      // Get current user ID
      const userId = await getCurrentUserId();
      
      // Send both audio file and transcript to webhook
      const response = await WebhookService.sendVoiceMessage(
        audioFile,
        undefined, // no base64 audio data needed since we have file
        text,
        userId || undefined
      );
      
      // Handle the response
      if (response.response) {
        setAvatarState('speaking');
        speakWithAnim(response.response);
      }
      
      // Handle any actions returned by the webhook
      if (response.action) {
        const action = response.action.toLowerCase();
        
        if (action.includes('navigate') || action.includes('directions')) {
          setAvatarState('pointing');
          setTimeout(() => {
            onNavigationTrigger?.(response.data?.destination || 'your destination');
            setAvatarState('guiding');
          }, 2000);
        } else if (action.includes('appointments') || action.includes('booking')) {
          setAvatarState('celebrating');
        }
      }
      
      // Play audio response if provided
      if (response.audio_response) {
        try {
          await WebhookService.playAudioResponse(response.audio_response);
        } catch (audioError) {
          console.error('Error playing audio response:', audioError);
        }
      }
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      // Always provide a response even if webhook fails
      setAvatarState('speaking');
      speakWithAnim("I'm having trouble connecting to the AI service. I can still help with basic navigation and appointments.");
    }
  }, [onNavigationTrigger, navigate]);

  // Initialize speech recognition
  useEffect(() => {
    if (!hasSpeech) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onend = async () => {
      setIsListening(false);
      setAvatarState('idle');
      stopMeter();
      
      let recordedAudio: Blob | null = null;
      
      // Stop audio recording
      if (audioRecorderRef.current?.isRecording()) {
        try {
          recordedAudio = await audioRecorderRef.current.stopRecording();
        } catch (error) {
          console.error('Error stopping audio recording:', error);
        }
      }
      
      if (transcript.trim()) {
        handleUnderstanding(transcript.trim(), recordedAudio || undefined);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
  }, [handleUnderstanding]);

  // Volume monitoring
  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);
        
        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, [isListening]);

  const stopMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setVolume(0);
  }, []);

  // Speech with animation
  const speakWithAnim = useCallback((text: string) => {
    if (isMuted) return;
    
    setIsSpeaking(true);
    setCurrentSpeechText(text);
    setAvatarState('speaking');
    
    speak(text, 
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
        setCurrentSpeechText("");
        setAvatarState('idle');
      }
    );
  }, [isMuted]);

  // Control functions
  const start = useCallback(async () => {
    if (!recognitionRef.current) return;
    
    try {
      // Initialize audio recorder
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }
      
      // Start audio recording
      await audioRecorderRef.current.startRecording();
      
      setIsListening(true);
      setAvatarState('listening');
      recognitionRef.current.start();
      startMeter();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      speakWithAnim("Could not access microphone. Please check your permissions.");
    }
  }, [startMeter]);

  const stop = useCallback(async () => {
    if (!recognitionRef.current) return;
    
    // Stop audio recording if active
    if (audioRecorderRef.current?.isRecording()) {
      try {
        await audioRecorderRef.current.stopRecording();
      } catch (error) {
        console.error('Error stopping audio recording:', error);
      }
    }
    
    setIsListening(false);
    setAvatarState('idle');
    recognitionRef.current.stop();
    stopMeter();
  }, [stopMeter]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeechText("");
      setAvatarState('idle');
    }
  }, [isMuted, isSpeaking]);

  // Handle viseme changes from lip sync
  const handleVisemeChange = useCallback((viseme: string, intensity: number) => {
    // This would be used to update the 3D avatar's mouth shape
    // For now, we'll use it to adjust the volume prop for mouth animation
    if (isSpeaking) {
      setVolume(intensity);
    }
  }, [isSpeaking]);

  if (!hasSpeech) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg">
        Speech recognition not supported
      </div>
    );
  }

  return (
    <>
      <LipSync
        text={currentSpeechText}
        isPlaying={isSpeaking}
        onVisemeChange={handleVisemeChange}
      />
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed bottom-4 right-4 z-50 max-h-[calc(100vh-2rem)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="w-80 h-[400px] p-4 bg-background/95 backdrop-blur-sm border shadow-2xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">AI Assistant</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      className="h-8 w-8 p-0"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsExpanded(false)}
                      className="h-8 w-8 p-0"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 3D Avatar Viewport */}
                <div className="h-40 mb-3 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg overflow-hidden border">
                  <AIAssistantAvatar
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    speechText={currentSpeechText}
                    volume={volume}
                    className="w-full h-full"
                  />
                </div>

                {/* Status and content area */}
                <div className="flex-1 flex flex-col space-y-3 min-h-0">
                  {(isSpeaking || isListening) && (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        isSpeaking ? 'bg-green-500' : 'bg-blue-500'
                      } animate-pulse`} />
                      <span className="text-sm text-muted-foreground">
                        {isSpeaking ? 'Speaking...' : 'Listening...'}
                      </span>
                    </motion.div>
                  )}

                  {transcript && (
                    <div className="p-2 bg-muted/50 rounded text-sm max-h-16 overflow-y-auto">
                      <strong>You said:</strong> {transcript}
                    </div>
                  )}

                  {/* Volume meter */}
                  {isListening && (
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-primary" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${volume * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Controls - Fixed at bottom */}
                  <div className="mt-auto pt-2">
                    <Button
                      onClick={isListening ? stop : start}
                      className="w-full"
                      variant={isListening ? "destructive" : "default"}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        className="fixed bottom-4 right-4 sm:bottom-4 sm:right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg z-40 flex items-center justify-center hidden sm:flex"
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          scale: {
            duration: 1,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <MicOff className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Mic className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse indicator */}
        {(isListening || isSpeaking) && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.button>
    </>
  );
};

export default Enhanced3DVoiceAgent;
