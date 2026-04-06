CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  known_conditions TEXT[] DEFAULT '{}',
  allergies TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON patient_profiles 
FOR ALL USING (user_id = auth.uid());
