-- Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT,
  hospital TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read doctors list
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);

-- Seed with some demo doctors
INSERT INTO public.doctors (full_name, specialty, hospital)
VALUES 
('Dr. Aisha Sharma', 'General Physician', 'Max Hospital'),
('Dr. Rohan Verma', 'Cardiologist', 'Apollo Clinics'),
('Dr. Priya Singh', 'Pediatrician', 'Fortis Healthcare'),
('Dr. Amit Patel', 'Dermatologist', 'SkinCare Center')
ON CONFLICT DO NOTHING;
