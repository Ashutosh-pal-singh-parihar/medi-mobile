-- Ambulance operator profiles
CREATE TABLE IF NOT EXISTS ambulance_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Basic' CHECK (vehicle_type IN ('Basic', 'Advanced', 'ICU')),
  is_online BOOLEAN DEFAULT false,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambulance cases (links triage case to ambulance operator)
CREATE TABLE IF NOT EXISTS ambulance_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triage_case_id UUID REFERENCES triage_cases(id) ON DELETE CASCADE,
  ambulance_id UUID REFERENCES ambulance_profiles(id),
  patient_id UUID REFERENCES patient_profiles(id),
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'en_route', 'arrived', 'transporting', 'completed', 'dismissed', 'cancelled')
  ),
  patient_lat DOUBLE PRECISION,
  patient_lng DOUBLE PRECISION,
  patient_address TEXT,
  hospital_lat DOUBLE PRECISION,
  hospital_lng DOUBLE PRECISION,
  hospital_name TEXT,
  accepted_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  dismiss_reason TEXT,
  distance_to_patient DOUBLE PRECISION,
  estimated_arrival_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambulance operator stats (updated automatically)
CREATE TABLE IF NOT EXISTS ambulance_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambulance_id UUID REFERENCES ambulance_profiles(id) UNIQUE,
  total_alerts INTEGER DEFAULT 0,
  total_accepted INTEGER DEFAULT 0,
  total_dismissed INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_cancelled INTEGER DEFAULT 0,
  average_response_time_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ambulance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ambulance_own_profile" ON ambulance_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "ambulance_own_cases" ON ambulance_cases
  FOR ALL USING (
    ambulance_id IN (
      SELECT id FROM ambulance_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ambulance_own_stats" ON ambulance_stats
  FOR ALL USING (
    ambulance_id IN (
      SELECT id FROM ambulance_profiles WHERE user_id = auth.uid()
    )
  );

-- Realtime for ambulance cases and profiles
-- Note: Re-adding to publication should be handled carefully if it already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Check if tables are already in the publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ambulance_cases') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ambulance_cases;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ambulance_profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ambulance_profiles;
  END IF;
END $$;

-- STEP 15: Add SQL function for incrementing stats
CREATE OR REPLACE FUNCTION increment_ambulance_stat(
  p_ambulance_id UUID,
  p_field TEXT
)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE ambulance_stats SET %I = %I + 1, updated_at = NOW() WHERE ambulance_id = $1',
    p_field, p_field
  ) USING p_ambulance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also increment total_alerts when a new ambulance_case is inserted
CREATE OR REPLACE FUNCTION on_ambulance_case_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ambulance_stats 
  SET total_alerts = total_alerts + 1, updated_at = NOW()
  WHERE ambulance_id = NEW.ambulance_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER increment_total_alerts
  AFTER INSERT ON ambulance_cases
  FOR EACH ROW
  EXECUTE FUNCTION on_ambulance_case_insert();

-- Increment completed count on status change to completed
CREATE OR REPLACE FUNCTION on_ambulance_case_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE ambulance_stats 
    SET total_completed = total_completed + 1, updated_at = NOW()
    WHERE ambulance_id = NEW.ambulance_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER track_completed_rides
  AFTER UPDATE ON ambulance_cases
  FOR EACH ROW
  EXECUTE FUNCTION on_ambulance_case_complete();
