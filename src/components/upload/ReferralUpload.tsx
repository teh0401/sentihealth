import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, Brain, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analyzeReferralLetter, getSuggestedDoctors, type ReferralAnalysis, type DoctorSuggestion } from "@/services/referralAnalysis";
import DoctorSuggestions from "@/components/doctors/DoctorSuggestions";

interface ReferralUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  onFileSelect?: (file: File) => void;
  currentFile?: string;
  isProcessing?: boolean;
  onAnalysisComplete?: (analysis: ReferralAnalysis, suggestions: DoctorSuggestion[]) => void;
}

const ReferralUpload: React.FC<ReferralUploadProps> = ({ 
  onUploadComplete, 
  onFileSelect, 
  currentFile, 
  isProcessing,
  onAnalysisComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  // Store a human-friendly display name separately from the actual URL
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(currentFile || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReferralAnalysis | null>(null);
  const [doctorSuggestions, setDoctorSuggestions] = useState<DoctorSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: derive a readable file name from a URL or path
  const getDisplayNameFromPath = (value: string): string => {
    try {
      // If it's a full URL, take the last path segment
      const asUrl = new URL(value);
      const last = asUrl.pathname.split("/").filter(Boolean).pop() || value;
      return decodeURIComponent(last);
    } catch {
      // Not a URL; if it's a path, take file name; otherwise return as-is
      const parts = value.split("/");
      return decodeURIComponent(parts[parts.length - 1] || value);
    }
  };

  // Initialize display name from provided currentFile (which may be a URL)
  React.useEffect(() => {
    if (currentFile) {
      setUploadedFile(getDisplayNameFromPath(currentFile));
    }
  }, [currentFile]);

  // Ensure we have a Supabase auth user; if not, try to create an anonymous session
  async function ensureSupabaseUser(): Promise<{ id: string }> {
    try {
      // First check if we already have a session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return { id: user.id };

      // Try anonymous sign-in for unauthenticated users
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Auth error:', error);
        throw new Error('Authentication required. Please sign in with MyDigital ID first.');
      }

      if (data.user) {
        return { id: data.user.id };
      }

      throw new Error('Could not establish a session. Please try signing in again.');
    } catch (err: any) {
      console.error('Auth error:', err);
      throw new Error(err?.message || 'Authentication required. Please sign in with MyDigital ID first.');
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Ensure Supabase session and get user id
      const { id: userId } = await ensureSupabaseUser();

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('referral-letters')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL (note: bucket is private by default; use signed URLs in real use)
      const { data: urlData } = supabase.storage
        .from('referral-letters')
        .getPublicUrl(data.path);

      // Call AI extraction if callback is provided
      if (onFileSelect) {
        onFileSelect(file);
      }

      setUploadedFile(file.name);
      setUploadedFileUrl(urlData.publicUrl);
      onUploadComplete(urlData.publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Your referral letter has been uploaded successfully.",
      });

      // Start AI analysis
      await startAIAnalysis(urlData.publicUrl, userId);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const startAIAnalysis = async (fileUrl: string, userId: string) => {
    try {
      setAnalyzing(true);
      
      toast({
        title: "AI Analysis Started",
        description: "Analyzing your referral letter to suggest the best doctors...",
      });

      // Analyze the referral letter
      const analysisResult = await analyzeReferralLetter(fileUrl, userId);
      setAnalysis(analysisResult);

      // Get doctor suggestions based on analysis
      const suggestions = await getSuggestedDoctors(analysisResult.id);
      setDoctorSuggestions(suggestions);
      setShowSuggestions(true);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult, suggestions);
      }

      toast({
        title: "Analysis Complete",
        description: `Found ${suggestions.length} recommended doctors for your condition.`,
      });
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze referral letter. You can still book appointments manually.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setAnalysis(null);
    setDoctorSuggestions([]);
    setShowSuggestions(false);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBookAppointment = async (doctorId: string, slot: { date: string; startTime: string; endTime: string }) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        });
        return;
      }

      // Find the selected doctor
      const selectedDoctor = doctorSuggestions.find(s => s.doctor.id === doctorId);
      if (!selectedDoctor) {
        toast({
          title: "Doctor not found",
          description: "Unable to find the selected doctor.",
          variant: "destructive",
        });
        return;
      }

      // Resolve facility from the doctor's primary or first location
      const primaryLocation = selectedDoctor.locations.find(l => l.is_primary) || selectedDoctor.locations[0];
      if (!primaryLocation) {
        toast({
          title: "Facility not found",
          description: "The selected doctor has no associated facility.",
          variant: "destructive",
        });
        return;
      }

      // Create appointment record
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          clinic_id: primaryLocation.facility.id,
          clinic_name: primaryLocation.facility.name,
          specialty: selectedDoctor.specialty.name,
          appointment_date: `${slot.date}T${slot.startTime}:00`,
          status: 'pending',
          notes: `Appointment booked based on AI referral analysis. Condition: ${analysis?.suggestedSpecialty}`,
          // Use the actual uploaded file URL, not the display name
          referral_letter_url: uploadedFileUrl ? uploadedFileUrl : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Appointment Booked Successfully",
        description: `Your appointment with ${selectedDoctor.doctor.title} ${selectedDoctor.doctor.name} is scheduled for ${new Date(slot.date).toLocaleDateString()} at ${slot.startTime}.`,
      });

      // You could navigate to appointments page here
      // navigate('/appointments');
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Referral Letter from Klinik Kesihatan
          </CardTitle>
          <CardDescription>
            Upload your referral letter to proceed with hospital appointment booking.
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Click to upload or drag and drop your referral letter
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="referral-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Choose File"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm break-all sm:truncate sm:max-w-[420px]">
                      {uploadedFile}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {analyzing ? (
                        <>
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analyzing...
                        </>
                      ) : analysis ? (
                        "Analysis Complete"
                      ) : (
                        "Uploaded successfully"
                      )}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  disabled={analyzing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>


            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Suggestions */}
      {showSuggestions && (
        <DoctorSuggestions
          suggestions={doctorSuggestions}
          onBookAppointment={handleBookAppointment}
          isLoading={analyzing}
        />
      )}
    </div>
  );
};

export default ReferralUpload;