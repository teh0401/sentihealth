import { useEffect, useRef, useCallback } from 'react';

interface LipSyncProps {
  text: string;
  isPlaying: boolean;
  onVisemeChange?: (viseme: string, intensity: number) => void;
}

// Basic viseme mapping for lip sync
const VISEME_MAP: Record<string, string> = {
  'a': 'aa',
  'e': 'E',
  'i': 'ih',
  'o': 'oh',
  'u': 'ou',
  'b': 'pp',
  'p': 'pp',
  'm': 'pp',
  'f': 'FF',
  'v': 'FF',
  'th': 'TH',
  'd': 'DD',
  't': 'DD',
  'n': 'DD',
  'l': 'DD',
  's': 'SS',
  'z': 'SS',
  'sh': 'SS',
  'ch': 'SS',
  'j': 'SS',
  'k': 'kk',
  'g': 'kk',
  'ng': 'kk',
  'r': 'RR',
  'w': 'ou',
  'y': 'ih'
};

const LipSync: React.FC<LipSyncProps> = ({ text, isPlaying, onVisemeChange }) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const analyzeText = useCallback((text: string) => {
    // Simple phoneme extraction - replace with more sophisticated analysis
    const words = text.toLowerCase().split(' ');
    const phonemes: Array<{ phoneme: string; duration: number }> = [];
    
    words.forEach(word => {
      // Basic phoneme mapping - this is simplified
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const nextChar = word[i + 1];
        let phoneme = char;
        let duration = 120; // Base duration in ms
        
        // Handle digraphs
        if (char === 't' && nextChar === 'h') {
          phoneme = 'th';
          i++; // Skip next character
        } else if (char === 's' && nextChar === 'h') {
          phoneme = 'sh';
          i++;
        } else if (char === 'c' && nextChar === 'h') {
          phoneme = 'ch';
          i++;
        } else if (char === 'n' && nextChar === 'g') {
          phoneme = 'ng';
          i++;
        }
        
        // Adjust duration based on phoneme type
        if ('aeiou'.includes(char)) {
          duration = 150; // Vowels are longer
        } else if ('bcdfghjklmnpqrstvwxyz'.includes(char)) {
          duration = 100; // Consonants are shorter
        }
        
        phonemes.push({ phoneme, duration });
      }
      
      // Add pause between words
      phonemes.push({ phoneme: 'sil', duration: 80 });
    });
    
    return phonemes;
  }, []);

  const playLipSync = useCallback((phonemes: Array<{ phoneme: string; duration: number }>) => {
    let currentTime = 0;
    
    phonemes.forEach(({ phoneme, duration }) => {
      timeoutRef.current = setTimeout(() => {
        const viseme = VISEME_MAP[phoneme] || 'sil';
        const intensity = phoneme === 'sil' ? 0 : Math.random() * 0.5 + 0.5; // Random intensity for variation
        onVisemeChange?.(viseme, intensity);
      }, currentTime);
      
      currentTime += duration;
    });
    
    // Close mouth at the end
    timeoutRef.current = setTimeout(() => {
      onVisemeChange?.('sil', 0);
    }, currentTime);
  }, [onVisemeChange]);

  const playAmplitudeBasedSync = useCallback(() => {
    // Fallback: simple amplitude-based mouth movement
    let phase = 0;
    
    intervalRef.current = setInterval(() => {
      const intensity = Math.abs(Math.sin(phase)) * 0.8;
      const viseme = intensity > 0.3 ? 'aa' : 'sil';
      onVisemeChange?.(viseme, intensity);
      phase += 0.4;
    }, 100);
    
    // Stop after reasonable duration
    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        onVisemeChange?.('sil', 0);
      }
    }, text.length * 80); // Rough estimation based on text length
  }, [text, onVisemeChange]);

  useEffect(() => {
    if (isPlaying && text) {
      const phonemes = analyzeText(text);
      if (phonemes.length > 0) {
        playLipSync(phonemes);
      } else {
        // Fallback to amplitude-based sync
        playAmplitudeBasedSync();
      }
    } else {
      // Stop lip sync
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      onVisemeChange?.('sil', 0);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, text, analyzeText, playLipSync, playAmplitudeBasedSync, onVisemeChange]);

  return null; // This component doesn't render anything
};

export default LipSync;