import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReferralUpload from "@/components/upload/ReferralUpload";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distanceKm: number;
}

const MOCK_CLINICS: Clinic[] = [
  { id: '1', name: 'CityCare Hospital', specialty: 'Cardiology', rating: 4.7, distanceKm: 1.2 },
  { id: '2', name: 'GreenCross Clinic', specialty: 'Dermatology', rating: 4.4, distanceKm: 2.3 },
  { id: '3', name: 'Sunrise Medical Center', specialty: 'Orthopedics', rating: 4.6, distanceKm: 3.5 },
  { id: '4', name: 'Riverside Health', specialty: 'Pediatrics', rating: 4.5, distanceKm: 0.8 },
  { id: '5', name: 'Harmony Care', specialty: 'ENT', rating: 4.2, distanceKm: 4.1 },
];

const Appointments = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('query') || '');
  const [referralLetterUrl, setReferralLetterUrl] = useState<string>('');

  useEffect(() => {
    if (params.get('query')) setQuery(params.get('query') || '');
  }, [params]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_CLINICS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q)
    ).sort((a,b) => b.rating - a.rating);
  }, [query]);

  const book = async (clinic: Clinic) => {
    if (!referralLetterUrl) {
      toast({ 
        title: 'Referral letter required', 
        description: 'Please upload your referral letter from Klinik Kesihatan before booking.',
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book an appointment.",
          variant: "destructive"
        });
        return;
      }

      // Save appointment to database
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          clinic_id: clinic.id,
          clinic_name: clinic.name,
          specialty: clinic.specialty,
          referral_letter_url: referralLetterUrl,
          status: 'pending'
        });

      if (error) throw error;

      // Also save to localStorage for backward compatibility
      const booking = { id: crypto.randomUUID(), clinic, ts: Date.now(), referralLetterUrl };
      const prev = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([booking, ...prev]));
      
      toast({ 
        title: 'Appointment booked', 
        description: `${clinic.name} • ${clinic.specialty}. Your referral letter has been submitted.` 
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Find and Book Appointments</h1>
        <p className="text-muted-foreground text-sm">Search by symptom, specialty, or clinic name.</p>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., knee pain, cardiology, CityCare" />
          <Button variant="hero" onClick={() => setQuery(query)}>Search</Button>
        </div>
      </section>

      {/* Referral Letter Upload Section */}
      <section>
        <ReferralUpload 
          onUploadComplete={setReferralLetterUrl}
          currentFile={referralLetterUrl}
        />
      </section>

      <section className="grid gap-4">
        {results.map((c) => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{c.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{c.specialty}</Badge>
                  <Badge>⭐ {c.rating.toFixed(1)}</Badge>
                  <Badge variant="outline">{c.distanceKm.toFixed(1)} km</Badge>
                </div>
              </CardTitle>
              <CardDescription>Trusted care near you</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {referralLetterUrl ? "✓ Referral letter uploaded" : "⚠️ Upload referral letter to book"}
              </div>
              <Button 
                variant="hero" 
                onClick={() => book(c)}
                disabled={!referralLetterUrl}
              >
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && (
          <p className="text-muted-foreground">No clinics found. Try a different search.</p>
        )}
      </section>
    </main>
  );
};

export default Appointments;
