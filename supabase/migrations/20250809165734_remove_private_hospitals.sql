-- First, delete doctors associated with private hospitals to maintain referential integrity
DELETE FROM doctors 
WHERE facility_id IN (
  SELECT id 
  FROM healthcare_facilities 
  WHERE type = 'private_hospital'
);

-- Then delete the private hospitals
DELETE FROM healthcare_facilities 
WHERE type = 'private_hospital';
