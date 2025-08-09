-- Create storage bucket for referral letters
INSERT INTO storage.buckets (id, name, public) VALUES ('referral-letters', 'referral-letters', false);

-- Create RLS policies for referral letters bucket
CREATE POLICY "Users can upload their own referral letters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own referral letters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own referral letters" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own referral letters" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create appointments table to store appointment data with referral letters
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  clinic_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  referral_letter_url TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();