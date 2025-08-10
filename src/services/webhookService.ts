// Webhook service for healthcare AI assistant
const WEBHOOK_TEXT_URL = "https://kaisan.app.n8n.cloud/webhook/healthcare-message";
const WEBHOOK_VOICE_URL = "https://kaisan.app.n8n.cloud/webhook/healthcare-message";

interface TextMessage {
  message: string;
  timestamp?: string;
  user_id?: string;
}

interface VoiceMessage {
  audio_file?: Blob; // actual audio file
  audio_data?: string; // base64 encoded audio (fallback)
  transcript?: string; // text from speech recognition
  timestamp?: string;
  user_id?: string;
}

interface WebhookResponse {
  response: string;
  audio_response?: string; // base64 encoded audio response
  action?: string;
  data?: any;
}

export class WebhookService {
  static async sendTextMessage(message: string, userId?: string): Promise<WebhookResponse> {
    try {
      const payload: TextMessage = {
        message,
        timestamp: new Date().toISOString(),
        user_id: userId
      };

      console.log('Sending text message to webhook:', payload);
      
      const response = await fetch(WEBHOOK_TEXT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook text response:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending text message to webhook:', error);
      // Return fallback response instead of throwing
      return {
        response: "I'm having trouble connecting to the AI service. Please try again later.",
        action: "",
        data: null
      };
    }
  }

  static async sendVoiceMessage(
    audioFile?: Blob,
    audioData?: string, 
    transcript?: string, 
    userId?: string
  ): Promise<WebhookResponse> {
    try {
      const payload = {
        user_id: userId,
        message: transcript
      };

      console.log('Sending voice message to webhook:', payload);
      
      const response = await fetch(WEBHOOK_VOICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook voice response:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending voice message to webhook:', error);
      // Return fallback response instead of throwing
      return {
        response: "I'm having trouble connecting to the AI service. Please try again later.",
        action: "",
        data: null
      };
    }
  }

  // Helper method to convert audio blob to base64
  static async audioBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:audio/wav;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper method to convert Float32Array audio to base64
  static audioFloat32ToBase64(audioData: Float32Array): string {
    // Convert Float32Array to 16-bit PCM
    const int16Array = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  // Helper method to play audio response from base64
  static async playAudioResponse(base64Audio: string): Promise<void> {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      
      // Create audio URL and play
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play();
      });
    } catch (error) {
      console.error('Error playing audio response:', error);
      throw error;
    }
  }
}