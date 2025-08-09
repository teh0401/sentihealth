-- Check if doctor_locations table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'doctor_locations'
  ) THEN
    -- Create doctor_locations table for multiple practice locations
    CREATE TABLE doctor_locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      facility_id UUID NOT NULL REFERENCES healthcare_facilities(id) ON DELETE CASCADE,
      is_primary BOOLEAN DEFAULT FALSE,
      schedule_type VARCHAR NOT NULL CHECK (schedule_type IN ('full_time', 'part_time', 'visiting', 'on_call')),
      consultation_days VARCHAR[],
      consultation_hours JSONB,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(doctor_id, facility_id)
    );

    -- Create indexes for better performance
    CREATE INDEX idx_doctor_locations_doctor ON doctor_locations(doctor_id);
    CREATE INDEX idx_doctor_locations_facility ON doctor_locations(facility_id);

    -- Migrate existing doctor-facility relationships to doctor_locations
    INSERT INTO doctor_locations (doctor_id, facility_id, is_primary, schedule_type)
    SELECT id, facility_id, TRUE, 'full_time' 
    FROM doctors 
    WHERE facility_id IS NOT NULL;

    -- Add function to ensure each doctor has at most one primary location
    CREATE OR REPLACE FUNCTION ensure_single_primary_location()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.is_primary THEN
        UPDATE doctor_locations
        SET is_primary = FALSE
        WHERE doctor_id = NEW.doctor_id
        AND id != NEW.id
        AND is_primary = TRUE;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger to enforce single primary location
    CREATE TRIGGER ensure_single_primary_location_trigger
    BEFORE INSERT OR UPDATE ON doctor_locations
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_location();
  END IF;
END $$;
