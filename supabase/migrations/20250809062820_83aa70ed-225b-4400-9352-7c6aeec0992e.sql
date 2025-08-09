-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create basic policies for questions table (public read access since no user_id)
CREATE POLICY "Anyone can view questions" 
ON public.questions 
FOR SELECT 
USING (true);

-- Enable RLS on user_symptoms table  
ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;

-- Create policies for user_symptoms table
CREATE POLICY "Users can view their own symptoms" 
ON public.user_symptoms 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own symptoms" 
ON public.user_symptoms 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own symptoms" 
ON public.user_symptoms 
FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Fix the update function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;