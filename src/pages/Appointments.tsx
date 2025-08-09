import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReferralUpload from "@/components/upload/ReferralUpload";
import { useGeolocation } from "@/hooks/use-geolocation";
import { sortByDistance, formatDistance } from "@/lib/distance";
import { MapPin, Navigation, Loader2, Brain, FileText, User, Stethoscope, Calendar, AlertCircle, ClipboardList } from "lucide-react";
import AppointmentList from "@/components/appointments/AppointmentList";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
  address: string;
}

const MOCK_CLINICS: Clinic[] = [
  { 
    id: '1', 
    name: 'Hospital Kuala Lumpur', 
    specialty: 'Cardiology', 
    rating: 4.8, 
    distanceKm: 1.2,
    latitude: 3.1598, 
    longitude: 101.7132,
    address: 'Jalan Pahang, 53000 Kuala Lumpur'
  },
  { 
    id: '2', 
    name: 'Klinik Kesihatan Cheras', 
    specialty: 'Dermatology', 
    rating: 4.6, 
    distanceKm: 2.3,
    latitude: 3.1247, 
    longitude: 101.7258,
    address: 'Jalan Yaacob Latif, Cheras, 56000 Kuala Lumpur'
  },
  { 
    id: '3', 
    name: 'Hospital Selayang', 
    specialty: 'Orthopedics', 
    rating: 4.7, 
    distanceKm: 3.5,
    latitude: 3.2671, 
    longitude: 101.6576,
    address: 'Lebuhraya Selayang-Kepong, 68100 Batu Caves, Selangor'
  },
  { 
    id: '4', 
    name: 'Hospital Pediatrik Putrajaya', 
    specialty: 'Pediatrics', 
    rating: 4.8, 
    distanceKm: 0.8,
    latitude: 2.9254, 
    longitude: 101.6964,
    address: 'Presint 18, 62250 Putrajaya'
  },
  { 
    id: '5', 
    name: 'Hospital Sungai Buloh', 
    specialty: 'ENT', 
    rating: 4.5, 
    distanceKm: 4.1,
    latitude: 3.2176, 
    longitude: 101.5670,
    address: 'Jalan Hospital, 47000 Sungai Buloh, Selangor'
  },
  { 
    id: '6', 
    name: 'Hospital Bahagia Ulu Kinta', 
    specialty: 'Psychiatry', 
    rating: 4.6, 
    distanceKm: 2.8,
    latitude: 4.6286, 
    longitude: 101.1210,
    address: 'Ulu Kinta, 31250 Tanjung Rambutan, Perak'
  },
];

const Appointments = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('query') || '');
  const [referralLetterUrl, setReferralLetterUrl] = useState<string>('');
  const [sortByLocation, setSortByLocation] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showReferralUpload, setShowReferralUpload] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBookedAppointments, setShowBookedAppointments] = useState(false);
  
  const geolocation = useGeolocation();

  useEffect(() => {
    if (params.get('query')) setQuery(params.get('query') || '');
  }, [params]);

  // AI Extraction simulation
  const extractReferralInfo = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted information
    const mockExtractedData = {
      patientName: "Ahmad Bin Abdullah",
      icNumber: "123456-78-9012",
      referringDoctor: "Dr. Sarah Lim",
      referringClinic: "Klinik Kesihatan Cheras",
      medicalCondition: "Chest pain, suspected angina",
      recommendedSpecialty: "Cardiology",
      urgency: "Non-urgent",
      symptoms: ["Chest discomfort", "Shortness of breath", "Fatigue"],
      medications: ["Aspirin 100mg", "Metformin 500mg"],
      allergies: ["Penicillin"],
      previousTests: ["ECG - Normal", "Blood pressure - 140/90"],
      referralDate: new Date().toLocaleDateString(),
      notes: "Patient requires cardiology consultation for chest pain evaluation"
    };
    
    setExtractedInfo(mockExtractedData);
    setIsProcessing(false);
    
    toast({
      title: "Referral Analysis Complete",
      description: "AI has successfully extracted information from your referral letter.",
    });
  };

  const results = useMemo(() => {
    const q = query.toLowerCase();
    let filteredClinics = MOCK_CLINICS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q)
    );

    // Sort by location if enabled and location is available
    if (sortByLocation && geolocation.hasLocation) {
      const clinicsWithDistance = sortByDistance(
        filteredClinics,
        geolocation.latitude!,
        geolocation.longitude!
      );
      return clinicsWithDistance.map(clinic => ({
        ...clinic,
        distanceKm: clinic.calculatedDistance
      }));
    }

    // Default sort by rating
    return filteredClinics.sort((a,b) => b.rating - a.rating);
  }, [query, sortByLocation, geolocation.hasLocation, geolocation.latitude, geolocation.longitude]);

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowReferralUpload(true);
  };

  const book = async (clinic: Clinic) => {
    if (!referralLetterUrl || !extractedInfo) {
      toast({ 
        title: 'Referral letter required', 
        description: 'Please upload and process your referral letter before booking.',
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

      // Mock appointment date (you should replace this with actual selected date)
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 3); // Mock: 3 days from now
      appointmentDate.setHours(14, 0, 0, 0); // Mock: 2:00 PM

      // Save appointment to database
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          clinic_id: clinic.id,
          clinic_name: clinic.name,
          specialty: clinic.specialty,
          referral_letter_url: referralLetterUrl,
          appointment_date: appointmentDate.toISOString(),
          status: 'pending',
          notes: extractedInfo.notes
        });

      if (error) throw error;

      // Also save to localStorage for backward compatibility
      const booking = { 
        id: crypto.randomUUID(), 
        clinic, 
        ts: Date.now(), 
        referralLetterUrl,
        appointmentDate: appointmentDate.toISOString()
      };
      const prev = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([booking, ...prev]));
      
      toast({ 
        title: 'Appointment booked', 
        description: `${clinic.name} • ${clinic.specialty} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}. Your referral letter has been submitted.` 
      });

      // Close the dialog and show the appointments list after booking
      setShowReferralUpload(false);
      setSelectedClinic(null);
      setExtractedInfo(null);
      setShowBookedAppointments(true);
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
    <main className="max-w-screen-xl mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24">
      {/* Page Header */}
      <section className="border-b pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Book Medical Appointments</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Schedule appointments with healthcare providers across our network of government medical facilities.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowBookedAppointments(!showBookedAppointments)}
              className="hidden sm:flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              {showBookedAppointments ? 'Hide My Appointments' : 'View My Appointments'}
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile View Appointments Button */}
      <Button
        variant="outline"
        onClick={() => setShowBookedAppointments(!showBookedAppointments)}
        className="sm:hidden w-full mb-4 gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        {showBookedAppointments ? 'Hide My Appointments' : 'View My Appointments'}
      </Button>

      {/* Booked Appointments List */}
      {showBookedAppointments && (
        <section className="space-y-3 sm:space-y-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            My Appointments
          </h2>
          <AppointmentList />
        </section>
      )}

      {/* Location Services Section */}
      <section className="bg-card border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold mb-1">Find Nearest Facilities</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enable location services to see facilities sorted by distance from your current location.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!geolocation.hasLocation && !geolocation.loading && (
              <Button 
                onClick={geolocation.getCurrentPosition}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                disabled={geolocation.loading}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Enable Location</span>
                <span className="sm:hidden">Location</span>
              </Button>
            )}
            
            {geolocation.loading && (
              <Button variant="outline" disabled className="gap-2 w-full sm:w-auto">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Getting Location...</span>
                <span className="sm:hidden">Loading...</span>
              </Button>
            )}
            
            {geolocation.hasLocation && (
              <Button 
                onClick={() => setSortByLocation(!sortByLocation)}
                variant={sortByLocation ? "default" : "outline"}
                className="gap-2 w-full sm:w-auto"
              >
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {sortByLocation ? 'Sort by Distance' : 'Sort by Rating'}
                </span>
                <span className="sm:hidden">
                  {sortByLocation ? 'Distance' : 'Rating'}
                </span>
              </Button>
            )}
          </div>
        </div>
        
        {geolocation.error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs sm:text-sm text-destructive">{geolocation.error}</p>
          </div>
        )}
        
        {geolocation.hasLocation && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs sm:text-sm text-green-700">
              ✓ Location enabled. {sortByLocation ? 'Facilities are sorted by distance.' : 'Click "Sort by Distance" to see nearest facilities first.'}
            </p>
          </div>
        )}
      </section>

      {/* Medical Facilities */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Available Medical Facilities</h2>
        <div className="grid gap-3 sm:gap-4">
          {results.map((c) => (
            <Card key={c.id} className="hover:shadow-formal transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-base sm:text-lg font-semibold text-foreground block">{c.name}</span>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        {c.specialty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatDistance(c.distanceKm)} away
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded text-sm self-start">
                    <span className="text-primary">★</span>
                    <span className="font-medium">{c.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/5.0</span>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  {c.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      {referralLetterUrl ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                          <span>Referral letter uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <span className="h-2 w-2 bg-amber-600 rounded-full"></span>
                          <span className="hidden sm:inline">Referral letter required for booking</span>
                          <span className="sm:hidden">Referral required</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Next available: Today • Emergency services available 24/7</span>
                      <span className="sm:hidden">Available today • 24/7 emergency</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleSelectClinic(c)}
                    size="lg"
                    className="px-4 sm:px-6 w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Select Hospital</span>
                    <span className="sm:hidden">Select</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="text-base sm:text-lg">No medical facilities found for your search.</p>
              <p className="text-xs sm:text-sm mt-1">Try searching for a different specialty or facility name.</p>
            </div>
          )}
        </div>
      </section>

      {/* Referral Upload Modal */}
      {showReferralUpload && selectedClinic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Upload Referral Letter</h2>
                  <p className="text-muted-foreground">Selected: {selectedClinic.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReferralUpload(false);
                    setSelectedClinic(null);
                    setExtractedInfo(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <ReferralUpload
                  onUploadComplete={setReferralLetterUrl}
                  onFileSelect={extractReferralInfo}
                  currentFile={referralLetterUrl}
                  isProcessing={isProcessing}
                />

                {isProcessing && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                        <div>
                          <p className="font-medium text-blue-900">AI Processing Referral Letter</p>
                          <p className="text-sm text-blue-700">Extracting medical information and patient details...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {extractedInfo && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Brain className="h-5 w-5" />
                        AI Extraction Complete
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Information extracted from your referral letter
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Patient Name</p>
                              <p className="text-sm text-green-800">{extractedInfo.patientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">IC Number</p>
                              <p className="text-sm text-green-800">{extractedInfo.icNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Referring Doctor</p>
                              <p className="text-sm text-green-800">{extractedInfo.referringDoctor}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Medical Condition</p>
                              <p className="text-sm text-green-800">{extractedInfo.medicalCondition}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Recommended Specialty</p>
                              <p className="text-sm text-green-800">{extractedInfo.recommendedSpecialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Urgency</p>
                              <Badge variant={extractedInfo.urgency === 'Urgent' ? 'destructive' : 'secondary'}>
                                {extractedInfo.urgency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {extractedInfo.symptoms?.map((symptom: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">Notes:</p>
                        <p className="text-sm text-green-800 bg-white p-3 rounded border">
                          {extractedInfo.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {extractedInfo && referralLetterUrl && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => book(selectedClinic)}
                      className="flex-1"
                      size="lg"
                    >
                      Confirm Appointment Booking
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReferralUpload(false);
                        setSelectedClinic(null);
                        setExtractedInfo(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Appointments;
