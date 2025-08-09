import { supabase } from '@/integrations/supabase/client';

export interface ReferralAnalysis {
  id: string;
  extractedText: string | null;
  suggestedSpecialty: string | null;
  symptoms: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  keywords: string[];
  confidenceScore: number;
  aiAnalysisJson: any;
}

export interface DoctorSuggestion {
  doctor: {
    id: string;
    name: string;
    title: string;
    experienceYears: number;
    consultationFee: number;
    bio: string;
    languages: string[];
    qualifications: string[];
    profileImageUrl?: string;
  };
  specialty: {
    id: string;
    name: string;
    description: string;
  };
  locations: DoctorLocation[];
  availableSlots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  matchScore: number;
  matchReason: string;
}

// Mock AI analysis function - In production, this would call a real AI service
export async function analyzeReferralLetter(
  fileUrl: string,
  userId?: string
): Promise<ReferralAnalysis> {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock extraction and analysis - In real implementation, you'd use:
    // - OCR services like Google Vision API, AWS Textract, or Azure Form Recognizer
    // - NLP services like OpenAI GPT, Google Cloud Natural Language API
    // - Medical text analysis services
    
    const mockAnalysis = {
      extractedText: generateMockExtractedText(),
      suggestedSpecialty: 'Cardiology',
      symptoms: ['chest pain', 'shortness of breath', 'palpitations', 'fatigue'],
      urgencyLevel: 'medium' as const,
      keywords: ['cardiac', 'ECG', 'hypertension', 'chest pain', 'cardiovascular'],
      confidenceScore: 0.85,
      aiAnalysisJson: {
        medicalTerms: ['myocardial infarction', 'ECG abnormalities', 'hypertension'],
        procedures: ['ECG', 'chest X-ray'],
        medications: ['aspirin', 'metoprolol'],
        conditions: ['suspected coronary artery disease'],
        urgencyIndicators: ['chest pain', 'ECG changes'],
        recommendations: ['urgent cardiology consultation', 'stress test evaluation']
      }
    };

    // Store analysis in database
    const { data, error } = await supabase
      .from('referral_analyses')
      .insert({
        user_id: userId,
        referral_letter_url: fileUrl,
        extracted_text: mockAnalysis.extractedText,
        suggested_specialty: mockAnalysis.suggestedSpecialty,
        symptoms: mockAnalysis.symptoms,
        urgency_level: mockAnalysis.urgencyLevel,
        keywords: mockAnalysis.keywords,
        confidence_score: mockAnalysis.confidenceScore,
        ai_analysis_json: mockAnalysis.aiAnalysisJson
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      extractedText: data.extracted_text,
      suggestedSpecialty: data.suggested_specialty,
      symptoms: data.symptoms || [],
      urgencyLevel: data.urgency_level as any,
      keywords: data.keywords || [],
      confidenceScore: data.confidence_score || 0,
      aiAnalysisJson: data.ai_analysis_json
    };
  } catch (error) {
    console.error('Error analyzing referral letter:', error);
    throw new Error('Failed to analyze referral letter');
  }
}

export interface DoctorLocation {
  id: string;
  facility_id: string;
  is_primary: boolean;
  schedule_type: 'full_time' | 'part_time' | 'visiting' | 'on_call';
  consultation_days?: string[];
  consultation_hours?: Record<string, any>;
  notes?: string;
  facility: {
    id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
  };
}

export async function getSuggestedDoctors(
  analysisId: string,
  facilityId?: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<DoctorSuggestion[]> {
  try {
    // Get the analysis results
    const { data: analysis, error: analysisError } = await supabase
      .from('referral_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError) throw analysisError;

    // Find specialty based on suggested specialty
    const { data: specialty, error: specialtyError } = await supabase
      .from('medical_specialties')
      .select('*')
      .eq('name', analysis.suggested_specialty)
      .single();

    if (specialtyError) throw specialtyError;

    // Find doctors in that specialty
    let query = supabase
      .from('doctors')
      .select(`
        *,
        medical_specialties!doctors_specialty_id_fkey(*),
        healthcare_facilities(*)
      `)
      .eq('specialty_id', specialty.id)
      .eq('is_available', true);

    // Get the doctors
    const { data: doctors, error: doctorsError } = await query;

    if (doctorsError) throw doctorsError;

    // Filter and sort doctors based on facility
    let filteredDoctors = doctors;
    
    if (facilityId) {
      // Only include doctors that practice at the selected facility
      filteredDoctors = doctors.filter(doctor => 
        doctor.facility_id === facilityId
      );
    } 
    
    if (userLocation) {
      // Sort by distance to user's location
      filteredDoctors.sort((a, b) => {
        const aFacility = a.healthcare_facilities;
        const bFacility = b.healthcare_facilities;

        if (!aFacility?.latitude || !bFacility?.latitude) return 0;

        const aDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          aFacility.latitude,
          aFacility.longitude
        );

        const bDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          bFacility.latitude,
          bFacility.longitude
        );

        return aDistance - bDistance;
      });
    }

    // Limit to top 10 doctors
    const topDoctors = filteredDoctors.slice(0, 10);

    // Helper function to calculate distance between two points
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    }

    function deg2rad(deg: number): number {
      return deg * (Math.PI / 180);
    }

    // Calculate match scores and get available slots
    const suggestions: DoctorSuggestion[] = [];

    for (const doctor of topDoctors) {
      const matchScore = calculateMatchScore(doctor, analysis);
      const availableSlots = await getAvailableSlots(doctor.id);
      
      suggestions.push({
        doctor: {
          id: doctor.id,
          name: doctor.name,
          title: doctor.title,
          experienceYears: doctor.experience_years || 0,
          consultationFee: doctor.consultation_fee || 0,
          bio: doctor.bio || '',
          languages: doctor.languages || [],
          qualifications: doctor.qualifications || [],
          profileImageUrl: doctor.profile_image_url
        },
        specialty: {
          id: doctor.medical_specialties.id,
          name: doctor.medical_specialties.name,
          description: doctor.medical_specialties.description || ''
        },
        locations: [{
          id: doctor.id,
          facility_id: doctor.facility_id,
          is_primary: true,
          schedule_type: 'full_time',
          facility: {
            id: doctor.healthcare_facilities.id,
            name: doctor.healthcare_facilities.name,
            type: doctor.healthcare_facilities.type,
            address: doctor.healthcare_facilities.address,
            city: doctor.healthcare_facilities.city,
            state: doctor.healthcare_facilities.state,
            phone: doctor.healthcare_facilities.phone || ''
          }
        }],
        availableSlots,
        matchScore,
        matchReason: generateMatchReason(doctor, analysis, matchScore)
      });
    }

    // Sort by match score (highest first)
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    return suggestions;
  } catch (error) {
    console.error('Error getting suggested doctors:', error);
    throw new Error('Failed to get doctor suggestions');
  }
}

function calculateMatchScore(doctor: any, analysis: any): number {
  let score = 0.5; // Base score

  // Experience bonus
  if (doctor.experience_years > 10) score += 0.2;
  else if (doctor.experience_years > 5) score += 0.1;

  // Urgency match
  if (analysis.urgency_level === 'urgent' || analysis.urgency_level === 'high') {
    // Prefer doctors at government hospitals for urgent cases
    if (doctor.healthcare_facilities.type === 'government_hospital') score += 0.1;
  }

  // Language match (assuming user prefers Bahasa Malaysia/English)
  if (doctor.languages?.includes('Bahasa Malaysia')) score += 0.05;
  if (doctor.languages?.includes('English')) score += 0.05;

  // Facility type scoring
  if (doctor.healthcare_facilities.type === 'private_hospital') score += 0.1;
  else if (doctor.healthcare_facilities.type === 'university_hospital') score += 0.05;

  // Ensure score is between 0 and 1
  return Math.min(Math.max(score, 0), 1);
}

function generateMatchReason(doctor: any, analysis: any, matchScore: number): string {
  const reasons = [];

  if (doctor.experience_years > 10) {
    reasons.push(`Highly experienced with ${doctor.experience_years} years in ${doctor.medical_specialties.name}`);
  }

  if (analysis.urgency_level === 'urgent' || analysis.urgency_level === 'high') {
    reasons.push('Available for urgent consultations');
  }

  if (doctor.healthcare_facilities.type === 'private_hospital') {
    reasons.push('Private hospital with advanced facilities');
  }

  if (doctor.languages?.includes('Bahasa Malaysia') && doctor.languages?.includes('English')) {
    reasons.push('Speaks both Bahasa Malaysia and English');
  }

  return reasons.join('; ') || 'Good match for your medical needs';
}

async function getAvailableSlots(doctorId: string): Promise<{ date: string; startTime: string; endTime: string }[]> {
  try {
    // Get next 7 days of potential appointments
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: schedules, error } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_active', true);

    if (error) throw error;

    const availableSlots = [];
    
    // Generate mock available slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      const daySchedule = schedules?.find(s => s.day_of_week === dayOfWeek);
      if (daySchedule && availableSlots.length < 5) {
        // Generate 2-3 available slots per day
        const slotCount = Math.floor(Math.random() * 2) + 2;
        for (let j = 0; j < slotCount && availableSlots.length < 5; j++) {
          const baseHour = parseInt(daySchedule.start_time.split(':')[0]);
          const slotHour = baseHour + j * 2;
          
          if (slotHour < parseInt(daySchedule.end_time.split(':')[0])) {
            availableSlots.push({
              date: date.toISOString().split('T')[0],
              startTime: `${slotHour.toString().padStart(2, '0')}:00`,
              endTime: `${(slotHour + 1).toString().padStart(2, '0')}:00`
            });
          }
        }
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}

function generateMockExtractedText(): string {
  return `RUJUKAN PESAKIT / PATIENT REFERRAL

Tarikh: 08/01/2025
Kepada: Pakar Kardiologi / To: Cardiologist

Nama Pesakit: Ahmad bin Ali
No. IC: 850123-10-1234
Umur: 39 tahun

KELUHAN UTAMA / CHIEF COMPLAINT:
Sakit dada yang berulang selama 2 minggu, sesak nafas semasa aktiviti

SEJARAH PENYAKIT SEMASA / HISTORY OF PRESENT ILLNESS:
Pesakit mengadu sakit dada tengah yang menjalar ke lengan kiri. Sakit bertambah teruk semasa aktiviti dan berkurang semasa rehat. Disertai dengan sesak nafas dan berpeluh sejak 2 minggu lepas.

SEJARAH PERUBATAN LALU / PAST MEDICAL HISTORY:
- Hipertensi selama 5 tahun
- Diabetes mellitus type 2 selama 3 tahun
- Merokok: 20 batang sehari selama 15 tahun

PEMERIKSAAN FIZIKAL / PHYSICAL EXAMINATION:
- Tekanan darah: 150/95 mmHg
- Nadi: 88/min, regular
- Pernafasan: 20/min
- Suhu: 36.8°C

INVESTIGASI / INVESTIGATIONS:
- ECG: ST depression di lead II, III, aVF
- Chest X-ray: Normal
- FBC, lipid profile: pending

DIAGNOSIS:
Suspected coronary artery disease
Rule out myocardial infarction

RAWATAN SEMENTARA / INTERIM TREATMENT:
- Aspirin 100mg daily
- Metoprolol 50mg BD
- Simvastatin 20mg nocte

Sila nilai dan rawat mengikut keperluan.
Terima kasih.

Dr. Siti Aminah
Klinik Kesihatan Bandar`;
}
