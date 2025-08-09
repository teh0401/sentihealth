-- Insert Malaysian medical specialties
INSERT INTO medical_specialties (name, description, keywords) VALUES
('Cardiology', 'Heart and cardiovascular system disorders', ARRAY['heart', 'cardiac', 'cardiovascular', 'chest pain', 'hypertension', 'blood pressure', 'coronary', 'arrhythmia', 'palpitations']),
('Dermatology', 'Skin, hair, and nail disorders', ARRAY['skin', 'rash', 'dermatitis', 'acne', 'psoriasis', 'eczema', 'hair loss', 'nail', 'mole', 'wound']),
('Endocrinology', 'Hormone and metabolic disorders', ARRAY['diabetes', 'thyroid', 'hormone', 'endocrine', 'metabolic', 'insulin', 'sugar', 'obesity', 'growth']),
('Gastroenterology', 'Digestive system disorders', ARRAY['stomach', 'intestine', 'liver', 'digestive', 'gastric', 'bowel', 'hepatitis', 'ulcer', 'diarrhea', 'constipation']),
('Neurology', 'Nervous system disorders', ARRAY['brain', 'nerve', 'neurological', 'seizure', 'stroke', 'migraine', 'headache', 'epilepsy', 'paralysis']),
('Orthopedics', 'Bone, joint, and muscle disorders', ARRAY['bone', 'joint', 'muscle', 'fracture', 'arthritis', 'back pain', 'knee', 'shoulder', 'spine', 'orthopedic']),
('Pediatrics', 'Medical care for infants, children, and adolescents', ARRAY['child', 'children', 'pediatric', 'infant', 'vaccination', 'growth', 'development', 'fever']),
('Psychiatry', 'Mental health disorders', ARRAY['mental', 'psychiatric', 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'stress', 'mood', 'behavior']),
('Pulmonology', 'Respiratory system disorders', ARRAY['lung', 'respiratory', 'breathing', 'asthma', 'pneumonia', 'tuberculosis', 'cough', 'shortness of breath']),
('Urology', 'Urinary tract and male reproductive system disorders', ARRAY['kidney', 'bladder', 'urinary', 'prostate', 'urology', 'stone', 'incontinence', 'erectile']),
('Obstetrics and Gynecology', 'Womens reproductive health and pregnancy', ARRAY['pregnancy', 'gynecology', 'obstetrics', 'womens health', 'menstrual', 'fertility', 'contraception', 'prenatal']),
('Ophthalmology', 'Eye and vision disorders', ARRAY['eye', 'vision', 'sight', 'cataract', 'glaucoma', 'retina', 'ophthalmology', 'blindness', 'glasses']),
('ENT (Otolaryngology)', 'Ear, nose, and throat disorders', ARRAY['ear', 'nose', 'throat', 'ENT', 'hearing', 'sinus', 'tonsil', 'voice', 'otolaryngology']),
('Oncology', 'Cancer diagnosis and treatment', ARRAY['cancer', 'tumor', 'oncology', 'chemotherapy', 'radiation', 'malignant', 'benign', 'biopsy']),
('Rheumatology', 'Autoimmune and inflammatory joint diseases', ARRAY['arthritis', 'rheumatoid', 'joint pain', 'autoimmune', 'lupus', 'inflammation', 'rheumatology']),
('Emergency Medicine', 'Acute and urgent medical conditions', ARRAY['emergency', 'acute', 'urgent', 'trauma', 'accident', 'critical', 'intensive care']),
('General Medicine', 'General medical conditions and health maintenance', ARRAY['general', 'primary care', 'health screening', 'preventive', 'checkup', 'medical examination']),
('Plastic Surgery', 'Reconstructive and cosmetic surgery', ARRAY['plastic surgery', 'reconstructive', 'cosmetic', 'aesthetic', 'burn', 'scar', 'breast']),
('Anesthesiology', 'Pain management and anesthesia', ARRAY['anesthesia', 'pain management', 'surgery', 'sedation', 'epidural']),
('Radiology', 'Medical imaging and diagnostics', ARRAY['imaging', 'X-ray', 'CT scan', 'MRI', 'ultrasound', 'mammography', 'radiology']);

-- Insert major Malaysian healthcare facilities
INSERT INTO healthcare_facilities (name, type, address, state, city, phone, postal_code, latitude, longitude) VALUES
-- Government Hospitals
('Hospital Kuala Lumpur', 'government_hospital', 'Jalan Pahang, 53000 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-2615-5555', '53000', 3.1735, 101.7207),
('Hospital Umum Sarawak', 'government_hospital', 'Jalan Hospital, 93586 Kuching', 'Sarawak', 'Kuching', '+6082-276-666', '93586', 1.5351, 110.3451),
('Hospital Sultanah Aminah', 'government_hospital', 'Jalan Persiaran Abu Bakar Sultan, 80100 Johor Bahru', 'Johor', 'Johor Bahru', '+607-223-3333', '80100', 1.4927, 103.7414),
('Hospital Pulau Pinang', 'government_hospital', 'Jalan Residensi, 10990 George Town', 'Pulau Pinang', 'George Town', '+604-222-5333', '10990', 5.4164, 100.3327),
('Hospital Tengku Ampuan Afzan', 'government_hospital', 'Jalan Tanah Putih, 25100 Kuantan', 'Pahang', 'Kuantan', '+609-513-3333', '25100', 3.8077, 103.3260),

-- Private Hospitals
('Sunway Medical Centre', 'private_hospital', '5, Jalan Lagoon Selatan, Bandar Sunway, 47500 Subang Jaya', 'Selangor', 'Subang Jaya', '+603-7491-9191', '47500', 3.0667, 101.6000),
('Prince Court Medical Centre', 'private_hospital', '39, Jalan Kia Peng, 50450 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-2160-0000', '50450', 3.1570, 101.7138),
('Gleneagles Kuala Lumpur', 'private_hospital', '286 & 288, Jalan Ampang, 50450 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-4141-3000', '50450', 3.1615, 101.7189),
('Pantai Hospital Kuala Lumpur', 'private_hospital', '8, Jalan Bukit Pantai, 59100 Bangsar', 'Kuala Lumpur', 'Bangsar', '+603-2296-0888', '59100', 3.1285, 101.6732),
('KPJ Damansara Specialist Hospital', 'private_hospital', '119, Jalan SS 20/10, Damansara Utama, 47400 Petaling Jaya', 'Selangor', 'Petaling Jaya', '+603-7718-1000', '47400', 3.1357, 101.6245),

-- University Hospitals
('University Malaya Medical Centre', 'university_hospital', 'Jalan Universiti, 59100 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-7949-4422', '59100', 3.1198, 101.6542),
('Hospital Universiti Kebangsaan Malaysia', 'university_hospital', 'Jalan Yaacob Latif, Bandar Tun Razak, 56000 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-9145-5555', '56000', 3.0738, 101.7543),

-- Specialist Clinics
('Tun Hussein Onn National Eye Hospital', 'specialist_clinic', 'Jalan Tun Razak, 50400 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-2615-2400', '50400', 3.1681, 101.7275),
('National Heart Institute', 'specialist_clinic', '145, Jalan Tun Razak, 50400 Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '+603-2617-8200', '50400', 3.1701, 101.7251);

-- Insert sample doctors with Malaysian names and context
INSERT INTO doctors (name, title, specialty_id, facility_id, qualifications, languages, experience_years, consultation_fee, bio) VALUES
-- Cardiology
('Ahmad Shahril bin Abdullah', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Cardiology'), (SELECT id FROM healthcare_facilities WHERE name = 'National Heart Institute'), ARRAY['MBBS (UM)', 'MRCP (UK)', 'Fellowship in Interventional Cardiology'], ARRAY['Bahasa Malaysia', 'English'], 15, 180.00, 'Pakar jantung berpengalaman dengan kepakaran dalam prosedur invasif jantung.'),
('Siti Nurhaliza binti Hassan', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Cardiology'), (SELECT id FROM healthcare_facilities WHERE name = 'Prince Court Medical Centre'), ARRAY['MBBS (USM)', 'MRCP (UK)', 'Fellowship in Cardiac Electrophysiology'], ARRAY['Bahasa Malaysia', 'English', 'Mandarin'], 12, 200.00, 'Specialist in heart rhythm disorders and cardiac electrophysiology procedures.'),

-- Dermatology
('Chen Wei Ming', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Dermatology'), (SELECT id FROM healthcare_facilities WHERE name = 'Sunway Medical Centre'), ARRAY['MBBS (IMU)', 'MRCP (UK)', 'Dermatology Specialty Training'], ARRAY['English', 'Mandarin', 'Bahasa Malaysia'], 8, 120.00, 'Experienced dermatologist specializing in skin cancer and cosmetic dermatology.'),
('Rajesh Kumar', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Dermatology'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Kuala Lumpur'), ARRAY['MBBS (UM)', 'MRCP (UK)', 'Dermatology Board Certification'], ARRAY['English', 'Tamil', 'Bahasa Malaysia', 'Hindi'], 10, 80.00, 'Government hospital dermatologist with expertise in complex skin conditions.'),

-- Endocrinology
('Fatimah binti Zakaria', 'Prof. Dr.', (SELECT id FROM medical_specialties WHERE name = 'Endocrinology'), (SELECT id FROM healthcare_facilities WHERE name = 'University Malaya Medical Centre'), ARRAY['MBBS (UM)', 'MRCP (UK)', 'PhD in Endocrinology', 'Fellowship in Diabetes'], ARRAY['Bahasa Malaysia', 'English'], 20, 150.00, 'Professor dan pakar endokrin dengan kepakaran dalam diabetes dan penyakit tiroid.'),

-- Gastroenterology
('Lim Kah Wai', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Gastroenterology'), (SELECT id FROM healthcare_facilities WHERE name = 'Gleneagles Kuala Lumpur'), ARRAY['MBBS (NUS)', 'MRCP (UK)', 'Fellowship in Advanced Endoscopy'], ARRAY['English', 'Mandarin', 'Bahasa Malaysia', 'Hokkien'], 14, 190.00, 'Expert in advanced endoscopic procedures and inflammatory bowel disease.'),

-- Neurology
('Muhammad Hafiz bin Ismail', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Neurology'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Sultanah Aminah'), ARRAY['MBBS (UKM)', 'MRCP (UK)', 'Neurology Specialty Training'], ARRAY['Bahasa Malaysia', 'English'], 11, 100.00, 'Neurologist with special interest in stroke and epilepsy management.'),

-- Orthopedics
('David Tan Choon Huat', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Orthopedics'), (SELECT id FROM healthcare_facilities WHERE name = 'Pantai Hospital Kuala Lumpur'), ARRAY['MBBS (UM)', 'MS Orthopedics', 'Fellowship in Spine Surgery'], ARRAY['English', 'Mandarin', 'Bahasa Malaysia'], 16, 220.00, 'Spine surgeon specializing in minimally invasive spinal procedures.'),

-- Pediatrics
('Aisha binti Rahman', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Pediatrics'), (SELECT id FROM healthcare_facilities WHERE name = 'KPJ Damansara Specialist Hospital'), ARRAY['MBBS (IIUM)', 'MRCPCH (UK)', 'Fellowship in Pediatric Cardiology'], ARRAY['Bahasa Malaysia', 'English', 'Arabic'], 9, 140.00, 'Pediatric cardiologist with expertise in congenital heart diseases in children.'),

-- Psychiatry
('Kumar Selvam', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Psychiatry'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Umum Sarawak'), ARRAY['MBBS (UM)', 'MRCPsych (UK)', 'Diploma in Psychological Medicine'], ARRAY['English', 'Tamil', 'Bahasa Malaysia'], 13, 120.00, 'Psychiatrist specializing in mood disorders and addiction treatment.'),

-- Pulmonology
('Wong Mei Ling', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Pulmonology'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Pulau Pinang'), ARRAY['MBBS (USM)', 'MRCP (UK)', 'Respiratory Medicine Training'], ARRAY['English', 'Mandarin', 'Bahasa Malaysia', 'Hokkien'], 7, 90.00, 'Respiratory physician with expertise in asthma and chronic lung diseases.'),

-- Urology
('Azman bin Othman', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Urology'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Tengku Ampuan Afzan'), ARRAY['MBBS (UKM)', 'MS Urology', 'Fellowship in Uro-oncology'], ARRAY['Bahasa Malaysia', 'English'], 12, 110.00, 'Urologist specializing in kidney stones and prostate disorders.'),

-- Obstetrics and Gynecology
('Dr. Priya Devi', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Obstetrics and Gynecology'), (SELECT id FROM healthcare_facilities WHERE name = 'Sunway Medical Centre'), ARRAY['MBBS (UM)', 'MRCOG (UK)', 'Fellowship in Maternal-Fetal Medicine'], ARRAY['English', 'Tamil', 'Bahasa Malaysia', 'Hindi'], 15, 160.00, 'Obstetrician-gynecologist specializing in high-risk pregnancies.'),

-- Ophthalmology
('Tan Siew Kuan', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Ophthalmology'), (SELECT id FROM healthcare_facilities WHERE name = 'Tun Hussein Onn National Eye Hospital'), ARRAY['MBBS (UM)', 'FRCOphth (UK)', 'Fellowship in Retinal Surgery'], ARRAY['English', 'Mandarin', 'Bahasa Malaysia'], 18, 130.00, 'Retinal specialist with expertise in diabetic eye disease and macular disorders.'),

-- ENT
('Sarina binti Kamal', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'ENT (Otolaryngology)'), (SELECT id FROM healthcare_facilities WHERE name = 'Gleneagles Kuala Lumpur'), ARRAY['MBBS (UKM)', 'MS ORL-HNS', 'Fellowship in Head & Neck Surgery'], ARRAY['Bahasa Malaysia', 'English'], 10, 145.00, 'ENT surgeon specializing in head and neck cancer surgery.'),

-- General Medicine
('Rajan Krishnan', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'General Medicine'), (SELECT id FROM healthcare_facilities WHERE name = 'Hospital Kuala Lumpur'), ARRAY['MBBS (UM)', 'MRCP (UK)'], ARRAY['English', 'Tamil', 'Bahasa Malaysia'], 8, 60.00, 'General physician providing comprehensive primary care services.'),

-- Emergency Medicine
('Muhammad Arif bin Johari', 'Dr.', (SELECT id FROM medical_specialties WHERE name = 'Emergency Medicine'), (SELECT id FROM healthcare_facilities WHERE name = 'Prince Court Medical Centre'), ARRAY['MBBS (UKM)', 'MCEM (UK)', 'Advanced Trauma Life Support'], ARRAY['Bahasa Malaysia', 'English'], 6, 200.00, 'Emergency physician with expertise in trauma and critical care.');

-- Insert doctor schedules (sample schedules for a few doctors)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
-- Dr. Ahmad Shahril (Cardiology) - Monday to Friday
((SELECT id FROM doctors WHERE name = 'Ahmad Shahril bin Abdullah'), 1, '09:00', '17:00', 30),
((SELECT id FROM doctors WHERE name = 'Ahmad Shahril bin Abdullah'), 2, '09:00', '17:00', 30),
((SELECT id FROM doctors WHERE name = 'Ahmad Shahril bin Abdullah'), 3, '09:00', '17:00', 30),
((SELECT id FROM doctors WHERE name = 'Ahmad Shahril bin Abdullah'), 4, '09:00', '17:00', 30),
((SELECT id FROM doctors WHERE name = 'Ahmad Shahril bin Abdullah'), 5, '09:00', '12:00', 30),

-- Dr. Siti Nurhaliza (Cardiology) - Tuesday to Saturday
((SELECT id FROM doctors WHERE name = 'Siti Nurhaliza binti Hassan'), 2, '08:30', '16:30', 30),
((SELECT id FROM doctors WHERE name = 'Siti Nurhaliza binti Hassan'), 3, '08:30', '16:30', 30),
((SELECT id FROM doctors WHERE name = 'Siti Nurhaliza binti Hassan'), 4, '08:30', '16:30', 30),
((SELECT id FROM doctors WHERE name = 'Siti Nurhaliza binti Hassan'), 5, '08:30', '16:30', 30),
((SELECT id FROM doctors WHERE name = 'Siti Nurhaliza binti Hassan'), 6, '08:30', '12:30', 30),

-- Dr. Chen Wei Ming (Dermatology) - Monday, Wednesday, Friday
((SELECT id FROM doctors WHERE name = 'Chen Wei Ming'), 1, '14:00', '18:00', 45),
((SELECT id FROM doctors WHERE name = 'Chen Wei Ming'), 3, '14:00', '18:00', 45),
((SELECT id FROM doctors WHERE name = 'Chen Wei Ming'), 5, '14:00', '18:00', 45),

-- Prof. Dr. Fatimah (Endocrinology) - Monday to Thursday
((SELECT id FROM doctors WHERE name = 'Fatimah binti Zakaria'), 1, '10:00', '16:00', 45),
((SELECT id FROM doctors WHERE name = 'Fatimah binti Zakaria'), 2, '10:00', '16:00', 45),
((SELECT id FROM doctors WHERE name = 'Fatimah binti Zakaria'), 3, '10:00', '16:00', 45),
((SELECT id FROM doctors WHERE name = 'Fatimah binti Zakaria'), 4, '10:00', '16:00', 45),

-- Dr. Rajan (General Medicine) - Monday to Friday
((SELECT id FROM doctors WHERE name = 'Rajan Krishnan'), 1, '08:00', '16:00', 20),
((SELECT id FROM doctors WHERE name = 'Rajan Krishnan'), 2, '08:00', '16:00', 20),
((SELECT id FROM doctors WHERE name = 'Rajan Krishnan'), 3, '08:00', '16:00', 20),
((SELECT id FROM doctors WHERE name = 'Rajan Krishnan'), 4, '08:00', '16:00', 20),
((SELECT id FROM doctors WHERE name = 'Rajan Krishnan'), 5, '08:00', '12:00', 20);
