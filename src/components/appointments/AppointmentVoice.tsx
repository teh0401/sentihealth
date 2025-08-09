import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentVoiceProps {
  appointmentId: string;
  notes: string;
  webhookUrl?: string; // Falls back to env var
}

const AppointmentVoice: React.FC<AppointmentVoiceProps> = ({ appointmentId, notes, webhookUrl }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);

  const effectiveWebhook = webhookUrl || (import.meta as any).env?.VITE_N8N_WEBHOOK_URL || "";

  useEffect(() => () => stopTimer(), []);

  const startTimer = () => {
    stopTimer();
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        chunksRef.current = [];
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err: any) {
      console.error("Mic error", err);
      toast({ title: "Microphone error", description: err?.message || "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } finally {
      setIsRecording(false);
      stopTimer();
    }
  };

  const formatTime = (total: number) =>
    `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;

  const sendToWebhook = async () => {
    if (!effectiveWebhook) {
      toast({ title: "Webhook not configured", description: "Set VITE_N8N_WEBHOOK_URL or pass webhookUrl.", variant: "destructive" });
      return;
    }
    if (!audioBlob) {
      toast({ title: "No recording", description: "Please record a message first." });
      return;
    }
    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", description: "Sign in to use voice assistant.", variant: "destructive" });
        return;
      }

      // Prepare multipart form with audio and metadata
      const form = new FormData();
      form.append("appointment_id", appointmentId);
      form.append("user_id", user.id);
      form.append("notes", notes);
      form.append("audio", audioBlob, `recording_${Date.now()}.webm`);

      const res = await fetch(effectiveWebhook, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);

      toast({ title: "Sent to assistant", description: "Your message was sent successfully." });
    } catch (err: any) {
      console.error("Webhook error", err);
      toast({ title: "Failed to send", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Voice Assistant
          <Badge variant={isRecording ? "default" : "secondary"} className="ml-1">
            {isRecording ? `Recording ${formatTime(seconds)}` : audioBlob ? "Recorded" : "Idle"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        {!isRecording ? (
          <Button onClick={startRecording} className="gap-2" variant="default">
            <Mic className="w-4 h-4" /> Start
          </Button>
        ) : (
          <Button onClick={stopRecording} className="gap-2" variant="destructive">
            <Square className="w-4 h-4" /> Stop
          </Button>
        )}
        <Button onClick={sendToWebhook} disabled={!audioBlob || isSending} variant="outline" className="gap-2">
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
        </Button>
        {audioBlob && (
          <audio className="ml-auto" controls src={URL.createObjectURL(audioBlob)} />
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentVoice;


