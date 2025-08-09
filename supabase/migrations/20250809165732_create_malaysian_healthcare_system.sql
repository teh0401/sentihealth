-- Create specialties table with Malaysian medical specialties
CREATE TABLE medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  keywords TEXT[], -- Keywords for AI matching
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hospitals/clinics table for Malaysian healthcare facilities
CREATE TABLE healthcare_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('government_hospital', 'private_hospital', 'specialist_clinic', 'university_hospital')),
  address TEXT NOT NULL,
  state VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  phone VARCHAR,
  postal_code VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create doctors table with Malaysian healthcare context
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  title VARCHAR NOT NULL DEFAULT 'Dr.', -- Dr., Prof. Dr., Dato' Dr., etc.
  specialty_id UUID REFERENCES medical_specialties(id),
  facility_id UUID REFERENCES healthcare_facilities(id),
  qualifications TEXT[], -- Medical degrees and certifications
  languages VARCHAR[] DEFAULT ARRAY['Bahasa Malaysia', 'English'], -- Languages spoken
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT TRUE,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedule slots for doctors
CREATE TABLE doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  max_patients_per_slot INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create available appointments table
CREATE TABLE available_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral analysis table to store AI analysis results
CREATE TABLE referral_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  referral_letter_url TEXT NOT NULL,
  extracted_text TEXT,
  suggested_specialty VARCHAR,
  symptoms TEXT[],
  urgency_level VARCHAR CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  keywords TEXT[],
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  ai_analysis_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX idx_doctors_facility ON doctors(facility_id);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX idx_available_appointments_doctor_date ON available_appointments(doctor_id, appointment_date);
CREATE INDEX idx_referral_analyses_user ON referral_analyses(user_id);
