-- Create storage bucket for referral letters (idempotent)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('referral-letters', 'referral-letters', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create RLS policies for referral letters bucket (idempotent)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND r.rolname = current_user
  ) THEN
    CREATE POLICY "Users can upload their own referral letters" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND r.rolname = current_user
  ) THEN
    CREATE POLICY "Users can view their own referral letters" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND r.rolname = current_user
  ) THEN
    CREATE POLICY "Users can update their own referral letters" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND r.rolname = current_user
  ) THEN
    CREATE POLICY "Users can delete their own referral letters" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'referral-letters' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create appointments table to store appointment data with referral letters (idempotent)
CREATE TABLE IF NOT EXISTS public.appointments (
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

-- Create RLS policies for appointments (idempotent)
DO $$ BEGIN
  CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_appointments_updated_at'
  ) THEN
    CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON public.appointments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;