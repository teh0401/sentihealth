import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AIAssistantAvatar from "../avatar/AIAssistantAvatar";
import { cn } from "@/lib/utils";
import { WebhookService } from "@/services/webhookService";
import { AudioRecorder, getCurrentUserId } from "@/services/audioRecorder";

// Simple browser-based voice agent (no API keys). Uses Web Speech API when available.
const hasSpeech = typeof window !== 'undefined' && (
  'speechSynthesis' in window || // TTS
  // @ts-ignore
  ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) // STT
);

const speak = (
  text: string,
  handlers: { onStart?: () => void; onEnd?: () => void; onBoundary?: () => void } = {}
) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onstart = () => handlers.onStart?.();
    u.onend = () => handlers.onEnd?.();
    // boundary fires on word/char; use it to animate mouth
    u.onboundary = () => handlers.onBoundary?.();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
};

interface EnhancedVoiceAgentProps {
  onNavigationTrigger?: (destination: string) => void;
}

const EnhancedVoiceAgent: React.FC<EnhancedVoiceAgentProps> = ({ 
  onNavigationTrigger 
}) => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'pointing' | 'celebrating'>('idle');
  const [speechText, setSpeechText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const navigate = useNavigate();

  const handleUnderstanding = useCallback(async (text: string, audioFile?: Blob) => {
    console.log('Voice input received:', text);
    
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
        speakWithAnim(response.response);
      }
      
      // Handle any actions returned by the webhook
      if (response.action) {
        const action = response.action.toLowerCase();
        
        if (action.includes('navigate') || action.includes('directions')) {
          setAvatarState('pointing');
          onNavigationTrigger?.(response.data?.destination || 'your destination');
          
          setTimeout(() => {
            navigate('/navigate');
          }, 1000);
        } else if (action.includes('appointments') || action.includes('booking')) {
          navigate(`/appointments?query=${encodeURIComponent(text)}`);
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
      speakWithAnim("I'm having trouble connecting to the AI service. I can still help with basic navigation and appointments.");
    }
  }, [navigate, onNavigationTrigger]);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = false;

      let latestTranscript = '';
      let recordedAudio: Blob | null = null;

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        latestTranscript = text;
        setTranscript(text);
      };

      recognitionRef.current.onend = async () => {
        setListening(false);
        setAvatarState('idle');
        stopMeter();
        
        // Stop audio recording
        if (audioRecorderRef.current?.isRecording()) {
          try {
            recordedAudio = await audioRecorderRef.current.stopRecording();
          } catch (error) {
            console.error('Error stopping audio recording:', error);
          }
        }
        
        if (latestTranscript.trim()) {
          handleUnderstanding(latestTranscript.trim(), recordedAudio || undefined);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        setAvatarState('idle');
        stopMeter();
      };
    }
  }, [handleUnderstanding]);

  // Microphone volume meter for reactive avatar
  const startMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        // RMS
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const val = Math.min(1, Math.max(0, rms * 4));
        setVolume(val);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.warn('Mic meter unavailable', e);
    }
  };

  const stopMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { mediaRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    mediaRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setVolume(0);
  };

  const speakWithAnim = (text: string) => {
    if (isMuted) return;
    
    setSpeechText(text); // Set text for lip sync
    speak(text, {
      onStart: () => { 
        setSpeaking(true); 
        setAvatarState('speaking');
      },
      onBoundary: () => setVolume(Math.random() * 0.8 + 0.2), // Simulate mouth movement
      onEnd: () => { 
        setSpeaking(false); 
        setAvatarState('idle');
        setVolume(0);
        setSpeechText(''); // Clear text when done
      },
    });
  };

  const start = async () => {
    setTranscript("");
    if (recognitionRef.current) {
      try {
        // Initialize audio recorder
        if (!audioRecorderRef.current) {
          audioRecorderRef.current = new AudioRecorder();
        }
        
        // Start audio recording
        await audioRecorderRef.current.startRecording();
        
        // Start volume meter and speech recognition
        await startMeter();
        recognitionRef.current.start();
        setListening(true);
        setAvatarState('listening');
        setIsExpanded(true);
        speakWithAnim("I'm listening. Tell me your symptoms or ask for directions.");
      } catch (error) {
        console.error('Error starting voice recording:', error);
        speakWithAnim("Could not access microphone. Please check your permissions.");
      }
    } else {
      speakWithAnim("Voice recognition not available. Please type your query on the Appointments page.");
    }
  };

  const stop = async () => {
    if (recognitionRef.current && listening) recognitionRef.current.stop();
    
    // Stop audio recording if active
    if (audioRecorderRef.current?.isRecording()) {
      try {
        await audioRecorderRef.current.stopRecording();
      } catch (error) {
        console.error('Error stopping audio recording:', error);
      }
    }
    
    setListening(false);
    setAvatarState('idle');
    stopMeter();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setAvatarState(listening ? 'listening' : 'idle');
    }
  };

  // Floating button (collapsed state)
  if (!isExpanded) {
    return (
      <motion.div 
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 blur-md"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <Button
            onClick={start}
            variant="hero"
            size="icon"
            className="relative w-16 h-16 rounded-full shadow-lg overflow-hidden"
            aria-label="Start voice assistant"
          >
            <div className="w-full h-full rounded-full overflow-hidden">
              <AIAssistantAvatar 
                avatarUrl="https://models.readyplayer.me/6896e289f1074e9697938176.glb"
                isListening={false}
                isSpeaking={false}
                speechText=""
                volume={0}
                className="w-full h-full scale-150"
              />
            </div>
          </Button>

          {/* Pulse indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Expanded popover state
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        <motion.div
          className="bg-card/95 backdrop-blur-md border shadow-2xl rounded-2xl p-4 min-w-[320px]"
          initial={{ scale: 0, opacity: 0, originX: 1, originY: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <AIAssistantAvatar 
                  avatarUrl="https://models.readyplayer.me/6896e289f1074e9697938176.glb"
                  isListening={avatarState === 'listening'}
                  isSpeaking={avatarState === 'speaking'}
                  speechText={speechText}
                  volume={volume}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {speaking ? 'Speaking...' : listening ? 'Listening...' : 'Ready to help'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Minimize"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg min-h-[60px]">
            <p className="text-sm text-muted-foreground mb-1">
              {listening ? "Listening..." : "Last heard:"}
            </p>
            <p className="text-sm font-medium">
              {transcript || "Ask for directions or book an appointment."}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {listening ? (
                <Button
                  onClick={stop}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MicOff className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={start}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={speaking}
                >
                  <Mic className="h-4 w-4" />
                  Listen
                </Button>
              )}
            </div>

            {/* Volume indicator */}
            {listening && (
              <div className="flex items-center gap-1">
                <div className="text-xs text-muted-foreground mr-2">Volume:</div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-1 h-4 rounded-full bg-primary/30",
                        volume * 5 > i && "bg-primary"
                      )}
                      animate={{
                        scaleY: volume * 5 > i ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: 0.1,
                        repeat: volume * 5 > i ? Infinity : 0
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedVoiceAgent;