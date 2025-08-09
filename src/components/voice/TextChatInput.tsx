import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { WebhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";

interface TextChatInputProps {
  onResponse?: (response: string) => void;
  onAction?: (action: string, data?: any) => void;
  placeholder?: string;
  className?: string;
}

const TextChatInput: React.FC<TextChatInputProps> = ({
  onResponse,
  onAction,
  placeholder = "Type your message...",
  className = ""
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      console.log('Sending text message:', userMessage);
      const response = await WebhookService.sendTextMessage(userMessage);
      
      console.log('Received response:', response);
      
      // Handle text response
      if (response.response) {
        onResponse?.(response.response);
        
        // Show success toast
        toast({
          title: "AI Response",
          description: response.response,
        });
      }
      
      // Handle actions
      if (response.action) {
        onAction?.(response.action, response.data);
      }
      
      // Handle audio response
      if (response.audio_response) {
        try {
          await WebhookService.playAudioResponse(response.audio_response);
        } catch (audioError) {
          console.error('Error playing audio response:', audioError);
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        size="icon"
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default TextChatInput;