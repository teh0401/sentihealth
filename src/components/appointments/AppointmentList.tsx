import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppointmentVoice from "./AppointmentVoice";

interface Appointment {
  id: string;
  clinic_name: string;
  specialty: string;
  appointment_date: string;
  status: string; // Changed to string to match database
  notes?: string;
  created_at: string;
  clinic_id?: string;
  referral_letter_url?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'confirmed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your appointments.",
          variant: "destructive"
        });
        return;
      }

      // Ensure a default completed appointment exists for demo purposes
      await ensureDefaultPastAppointment(user.id);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Failed to load appointments",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ensureDefaultPastAppointment = async (userId: string) => {
    try {
      const defaultReport = `Doctor Summary Report\n\nEncounter Details\n- Facility: Hospital Kuala Lumpur (Cardiology Clinic)\n- Attending Physician: Dr. Sarah Lim, MD (Cardiology)\n- Encounter Type: Outpatient follow-up\n\nVitals\n- Blood Pressure: 138/86 mmHg\n- Heart Rate: 78 bpm (regular)\n- Temperature: 36.7°C\n- SpO₂: 98% (room air)\n- BMI: 27.4 kg/m²\n\nInvestigations Reviewed\n- 12‑lead ECG: Normal sinus rhythm; no acute ischemic changes\n- Prior Labs: Fasting glucose 6.1 mmol/L; Lipid profile pending\n- Prior Imaging: Chest X‑ray normal (if clinically indicated)\n\nAssessment / Diagnosis\n- Stable angina (non‑urgent) with cardiovascular risk factors (HTN, dyslipidemia).\n\nProcedures Performed Today\n- Focused cardiac examination\n- 12‑lead ECG performed and reviewed\n\nMedications Prescribed / Dispensed\n1) Aspirin 100 mg EC tablet — 1 tab orally once daily (morning) — 30 tablets dispensed\n2) Atorvastatin 20 mg tablet — 1 tab orally at night — 30 tablets dispensed\n3) Glyceryl trinitrate (GTN) 0.5 mg SL — 1 tab under tongue as needed for chest pain; may repeat every 5 minutes up to 3 doses — 10 tablets dispensed\n4) Omeprazole 20 mg — 1 cap orally once daily before breakfast (gastroprotection if dyspepsia) — 14 capsules dispensed\n\nAllergies\n- No known drug allergies (NKDA).\n\nDietary & Lifestyle Advice\n- Adopt DASH‑style diet:\n  • Sodium < 2 g/day (≈5 g salt).\n  • Emphasize fruits, vegetables, whole grains, legumes, nuts.\n  • Prefer lean proteins (fish, poultry); limit red/processed meats.\n  • Replace saturated fats with olive/canola oils; avoid trans‑fats.\n  • Limit sugar‑sweetened beverages and desserts.\n- Weight management: target 5–7% weight reduction over 3–6 months.\n- Physical activity: ≥150 minutes/week moderate‑intensity (e.g., brisk walking) spread across ≥5 days; include 2 sessions/week resistance training.\n- Smoking: complete cessation; offer counselling/quit‑line.\n- Alcohol: avoid or limit per national guidance.\n\nMonitoring Plan\n- Home blood pressure log (morning/evening, seated) for 2 weeks; bring records to next visit.\n- Symptom diary for chest pain episodes and GTN usage.\n\nInvestigations Ordered\n- Fasting lipid profile, fasting glucose/HbA1c, full blood count, renal function & electrolytes.\n- Exercise treadmill stress test (ETT) within 2–4 weeks unless symptoms worsen.\n\nFollow‑up Plan\n- Clinic review in 6 weeks with fasting lipids and BP log.\n- Earlier review if medication intolerance or lab abnormalities.\n\nRed‑Flag / Emergency Advice\n- Seek urgent care (nearest Emergency Department) if: chest pain >10 minutes not relieved by rest/GTN, severe shortness of breath, syncope, new neurologic deficits, or palpitations with dizziness.\n\nContact\n- Cardiology Clinic: 03‑1234 5678 (Mon–Fri, 8:00–17:00).\n\nPhysician\n- Dr. Sarah Lim, MD (MMC #12345)\n- Electronic signature on file.`;
      // If already present, do nothing
      const { data: existing, error: existingError } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', userId)
        .eq('clinic_id', 'mock-facility-1')
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing) {
        // Ensure notes are up to date with the comprehensive report
        await supabase
          .from('appointments')
          .update({ notes: defaultReport })
          .eq('id', existing.id);
        return;
      }

      const past = new Date();
      past.setDate(past.getDate() - 14); // 2 weeks ago
      past.setHours(10, 30, 0, 0);

      const demo = {
        user_id: userId,
        clinic_id: 'mock-facility-1',
        clinic_name: 'Hospital Kuala Lumpur',
        specialty: 'Cardiology',
        appointment_date: past.toISOString(),
        status: 'completed',
        notes: defaultReport,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(demo)
        .select()
        .single();

      if (error) throw error;

      // Prepend to local state if we already loaded
      setAppointments(prev => prev.length ? [data as Appointment, ...prev] : [data as Appointment]);
    } catch (error: any) {
      console.error('Error ensuring default appointment:', error);
      // Silent fail to avoid blocking UI
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId 
            ? { ...app, status: 'cancelled' } 
            : app
        )
      );

      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled successfully."
      });
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Failed to cancel appointment",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No appointments found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't booked any appointments yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Tap any appointment to view details.</div>

      {appointments.map((appointment) => (
        <Card key={appointment.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{appointment.clinic_name}</CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="mr-1">
                    {appointment.specialty}
                  </Badge>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {appointment.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(appointment);
                    setDetailsOpen(true);
                  }}
                >
                  {appointment.status === 'completed' ? 'View Report' : 'View Details'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(appointment.appointment_date).toLocaleDateString('en-MY', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(appointment.appointment_date).toLocaleTimeString('en-MY', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selected ? `${selected.clinic_name} • ${selected.specialty}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(selected.appointment_date).toLocaleString('en-MY', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                {selected.clinic_id && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Facility ID: {selected.clinic_id}
                  </div>
                )}
              </div>

              {selected.status === 'completed' && (
                <AppointmentVoice appointmentId={selected.id} notes={selected.notes || ''} />
              )}

              <Card>
                <CardContent className="max-h-[60vh] overflow-y-auto pr-1">
                  {selected.notes ? (
                    <div className="space-y-4 text-sm">
                      {/* Split sections by double newlines and render nicely */}
                      {selected.notes.split(/\n\n+/).map((block, idx) => {
                        // Headings are bare lines without colon in first part
                        const [maybeHeading, ...rest] = block.split("\n");
                        const isHeading = /^[A-Za-z].{0,60}$/.test(maybeHeading) && !maybeHeading.includes(":");
                        const body = isHeading ? rest.join("\n") : block;
                        const heading = isHeading ? maybeHeading : undefined;

                        return (
                          <section key={idx} className="space-y-2">
                            {heading && (
                              <h4 className="text-foreground font-semibold text-sm tracking-wide">
                                {heading}
                              </h4>
                            )}
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                              {body
                                .split(/\n|\u2022|\-/)
                                .map(s => s.trim())
                                .filter(Boolean)
                                .map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                            </ul>
                          </section>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No report provided.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
