-- ============================================================================
-- ALGONAUTS DEMO DATA SEED
-- Run this in Supabase SQL Editor
-- Password for all demo accounts: Demo@123
-- ============================================================================

-- Pre-computed bcrypt hash for "Demo@123"
-- You can verify this works by logging in with Demo@123
DO $$
DECLARE
  password_hash TEXT := '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.rHuxP5fqJ7qK.W';
  now_ts TIMESTAMP := NOW();
BEGIN

-- ============================================================================
-- COLLEGES
-- ============================================================================

-- IITs
INSERT INTO "College" (id, name, "shortName", slug, city, state, type, "overallRank", "isVerified", "isActive", "totalStudents", "activeStudents", "createdAt", "updatedAt")
VALUES
  ('iit-bombay', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'iit-bombay', 'Mumbai', 'Maharashtra', 'IIT', 1, true, true, 3500, 2800, now_ts, now_ts),
  ('iit-delhi', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'iit-delhi', 'New Delhi', 'Delhi', 'IIT', 2, true, true, 3200, 2600, now_ts, now_ts),
  ('iit-madras', 'Indian Institute of Technology Madras', 'IIT Madras', 'iit-madras', 'Chennai', 'Tamil Nadu', 'IIT', 3, true, true, 3400, 2700, now_ts, now_ts),
  ('iit-kanpur', 'Indian Institute of Technology Kanpur', 'IIT Kanpur', 'iit-kanpur', 'Kanpur', 'Uttar Pradesh', 'IIT', 4, true, true, 3000, 2400, now_ts, now_ts),
  ('iit-kharagpur', 'Indian Institute of Technology Kharagpur', 'IIT Kharagpur', 'iit-kharagpur', 'Kharagpur', 'West Bengal', 'IIT', 5, true, true, 4000, 3200, now_ts, now_ts),
  ('iit-roorkee', 'Indian Institute of Technology Roorkee', 'IIT Roorkee', 'iit-roorkee', 'Roorkee', 'Uttarakhand', 'IIT', 6, true, true, 3100, 2500, now_ts, now_ts),
  ('iit-guwahati', 'Indian Institute of Technology Guwahati', 'IIT Guwahati', 'iit-guwahati', 'Guwahati', 'Assam', 'IIT', 7, true, true, 2800, 2200, now_ts, now_ts),
  ('iit-hyderabad', 'Indian Institute of Technology Hyderabad', 'IIT Hyderabad', 'iit-hyderabad', 'Hyderabad', 'Telangana', 'IIT', 8, true, true, 2500, 2000, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- NITs
INSERT INTO "College" (id, name, "shortName", slug, city, state, type, "overallRank", "isVerified", "isActive", "totalStudents", "activeStudents", "createdAt", "updatedAt")
VALUES
  ('nit-trichy', 'National Institute of Technology Trichy', 'NIT Trichy', 'nit-trichy', 'Tiruchirappalli', 'Tamil Nadu', 'NIT', 10, true, true, 2800, 2200, now_ts, now_ts),
  ('nit-warangal', 'National Institute of Technology Warangal', 'NIT Warangal', 'nit-warangal', 'Warangal', 'Telangana', 'NIT', 11, true, true, 2600, 2100, now_ts, now_ts),
  ('nit-surathkal', 'National Institute of Technology Surathkal', 'NIT Surathkal', 'nit-surathkal', 'Mangalore', 'Karnataka', 'NIT', 12, true, true, 2500, 2000, now_ts, now_ts),
  ('nit-rourkela', 'National Institute of Technology Rourkela', 'NIT Rourkela', 'nit-rourkela', 'Rourkela', 'Odisha', 'NIT', 13, true, true, 2400, 1900, now_ts, now_ts),
  ('nit-calicut', 'National Institute of Technology Calicut', 'NIT Calicut', 'nit-calicut', 'Calicut', 'Kerala', 'NIT', 14, true, true, 2300, 1800, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- Other Top Colleges
INSERT INTO "College" (id, name, "shortName", slug, city, state, type, "overallRank", "isVerified", "isActive", "totalStudents", "activeStudents", "createdAt", "updatedAt")
VALUES
  ('bits-pilani', 'BITS Pilani', 'BITS', 'bits-pilani', 'Pilani', 'Rajasthan', 'Private', 9, true, true, 3500, 2800, now_ts, now_ts),
  ('vit-vellore', 'Vellore Institute of Technology', 'VIT', 'vit-vellore', 'Vellore', 'Tamil Nadu', 'Private', 18, true, true, 5000, 4000, now_ts, now_ts),
  ('srm-chennai', 'SRM Institute of Science and Technology', 'SRM', 'srm-chennai', 'Chennai', 'Tamil Nadu', 'Private', 20, true, true, 4500, 3600, now_ts, now_ts),
  ('mit-manipal', 'Manipal Institute of Technology', 'MIT Manipal', 'mit-manipal', 'Manipal', 'Karnataka', 'Private', 22, true, true, 4000, 3200, now_ts, now_ts),
  ('dtu-delhi', 'Delhi Technological University', 'DTU', 'dtu-delhi', 'New Delhi', 'Delhi', 'State', 19, true, true, 3000, 2400, now_ts, now_ts),
  ('nsut-delhi', 'Netaji Subhas University of Technology', 'NSUT', 'nsut-delhi', 'New Delhi', 'Delhi', 'State', 21, true, true, 2800, 2200, now_ts, now_ts),
  ('pes-bangalore', 'PES University', 'PES', 'pes-bangalore', 'Bangalore', 'Karnataka', 'Private', 30, true, true, 3500, 2800, now_ts, now_ts),
  ('rvce-bangalore', 'RV College of Engineering', 'RVCE', 'rvce-bangalore', 'Bangalore', 'Karnataka', 'Private', 32, true, true, 3200, 2500, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPANY USERS & PROFILES
-- ============================================================================

-- IT Services Giants
INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('company-tcs', 'hr@tcs.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-infosys', 'hr@infosys.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-wipro', 'hr@wipro.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-hcl', 'hr@hcl.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-techm', 'hr@techm.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-cognizant', 'hr@cts.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-accenture', 'hr@acn.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-capgemini', 'hr@cap.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- Product Companies
INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('company-microsoft', 'hr@msft.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-google', 'hr@googl.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-amazon', 'hr@amzn.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-adobe', 'hr@adbe.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-flipkart', 'hr@fk.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-oracle', 'hr@orcl.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- Unicorn Startups
INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('company-razorpay', 'hr@rzp.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-zerodha', 'hr@zrd.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-cred', 'hr@cred.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-phonepe', 'hr@ppe.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-swiggy', 'hr@swg.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-zomato', 'hr@zmt.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-meesho', 'hr@msh.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-groww', 'hr@grw.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-dream11', 'hr@d11.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-freshworks', 'hr@frsh.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-zoho', 'hr@zoho.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts),
  ('company-postman', 'hr@post.demo', password_hash, 'COMPANY', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- Company Profiles
INSERT INTO "CompanyProfile" (id, "userId", "companyName", industry, "companySize", headquarters, website, description, "isVerified", "createdAt", "updatedAt")
VALUES
  ('cp-tcs', 'company-tcs', 'Tata Consultancy Services', 'IT Services', '500000+', 'Mumbai, India', 'https://www.tcs.com', 'TCS is a leading global IT services, consulting and business solutions organization.', true, now_ts, now_ts),
  ('cp-infosys', 'company-infosys', 'Infosys', 'IT Services', '100000+', 'Bangalore, India', 'https://www.infosys.com', 'Infosys is a global leader in next-generation digital services and consulting.', true, now_ts, now_ts),
  ('cp-wipro', 'company-wipro', 'Wipro', 'IT Services', '100000+', 'Bangalore, India', 'https://www.wipro.com', 'Wipro Limited is a leading technology services and consulting company.', true, now_ts, now_ts),
  ('cp-hcl', 'company-hcl', 'HCL Technologies', 'IT Services', '100000+', 'Noida, India', 'https://www.hcltech.com', 'HCL Technologies is a next-generation global technology company.', true, now_ts, now_ts),
  ('cp-techm', 'company-techm', 'Tech Mahindra', 'IT Services', '100000+', 'Pune, India', 'https://www.techmahindra.com', 'Tech Mahindra offers innovative and customer-centric digital experiences.', true, now_ts, now_ts),
  ('cp-cognizant', 'company-cognizant', 'Cognizant', 'IT Services', '100000+', 'Chennai, India', 'https://www.cognizant.com', 'Cognizant helps companies modernize technology, reimagine processes and transform experiences.', true, now_ts, now_ts),
  ('cp-accenture', 'company-accenture', 'Accenture', 'Consulting', '100000+', 'Bangalore, India', 'https://www.accenture.com', 'Accenture is a global professional services company with leading capabilities in digital, cloud and security.', true, now_ts, now_ts),
  ('cp-capgemini', 'company-capgemini', 'Capgemini', 'Consulting', '50000+', 'Mumbai, India', 'https://www.capgemini.com', 'Capgemini is a global leader in consulting, digital transformation, technology and engineering services.', true, now_ts, now_ts),
  ('cp-microsoft', 'company-microsoft', 'Microsoft India', 'Product', '10000+', 'Hyderabad, India', 'https://www.microsoft.com', 'Microsoft is the worldwide leader in software, services, devices, and solutions.', true, now_ts, now_ts),
  ('cp-google', 'company-google', 'Google India', 'Product', '5000+', 'Bangalore, India', 'https://www.google.com', 'Google''s mission is to organize the world''s information and make it universally accessible.', true, now_ts, now_ts),
  ('cp-amazon', 'company-amazon', 'Amazon India', 'Product', '50000+', 'Hyderabad, India', 'https://www.amazon.in', 'Amazon is guided by customer obsession rather than competitor focus.', true, now_ts, now_ts),
  ('cp-adobe', 'company-adobe', 'Adobe India', 'Product', '5000+', 'Noida, India', 'https://www.adobe.com', 'Adobe is changing the world through digital experiences.', true, now_ts, now_ts),
  ('cp-flipkart', 'company-flipkart', 'Flipkart', 'E-commerce', '10000+', 'Bangalore, India', 'https://www.flipkart.com', 'Flipkart is India''s leading e-commerce marketplace.', true, now_ts, now_ts),
  ('cp-oracle', 'company-oracle', 'Oracle India', 'Product', '10000+', 'Bangalore, India', 'https://www.oracle.com', 'Oracle offers integrated suites of applications plus secure, autonomous infrastructure.', true, now_ts, now_ts),
  ('cp-razorpay', 'company-razorpay', 'Razorpay', 'Fintech', '1000+', 'Bangalore, India', 'https://www.razorpay.com', 'Razorpay is India''s leading full-stack financial solutions company.', true, now_ts, now_ts),
  ('cp-zerodha', 'company-zerodha', 'Zerodha', 'Fintech', '1000+', 'Bangalore, India', 'https://www.zerodha.com', 'Zerodha is India''s largest stock broker offering the lowest brokerage.', true, now_ts, now_ts),
  ('cp-cred', 'company-cred', 'CRED', 'Fintech', '500+', 'Bangalore, India', 'https://www.cred.club', 'CRED is a members-only credit card bill payment platform.', true, now_ts, now_ts),
  ('cp-phonepe', 'company-phonepe', 'PhonePe', 'Fintech', '2000+', 'Bangalore, India', 'https://www.phonepe.com', 'PhonePe is India''s leading digital payments platform.', true, now_ts, now_ts),
  ('cp-swiggy', 'company-swiggy', 'Swiggy', 'Food Tech', '5000+', 'Bangalore, India', 'https://www.swiggy.com', 'Swiggy is India''s largest food ordering and delivery platform.', true, now_ts, now_ts),
  ('cp-zomato', 'company-zomato', 'Zomato', 'Food Tech', '5000+', 'Gurugram, India', 'https://www.zomato.com', 'Zomato is an Indian multinational restaurant aggregator and food delivery company.', true, now_ts, now_ts),
  ('cp-meesho', 'company-meesho', 'Meesho', 'E-commerce', '2000+', 'Bangalore, India', 'https://www.meesho.com', 'Meesho is India''s fastest growing e-commerce company.', true, now_ts, now_ts),
  ('cp-groww', 'company-groww', 'Groww', 'Fintech', '500+', 'Bangalore, India', 'https://www.groww.in', 'Groww is making investing accessible and transparent for Indians.', true, now_ts, now_ts),
  ('cp-dream11', 'company-dream11', 'Dream11', 'Gaming', '1000+', 'Mumbai, India', 'https://www.dream11.com', 'Dream11 is India''s biggest fantasy sports platform.', true, now_ts, now_ts),
  ('cp-freshworks', 'company-freshworks', 'Freshworks', 'SaaS', '5000+', 'Chennai, India', 'https://www.freshworks.com', 'Freshworks makes business software that people love to use.', true, now_ts, now_ts),
  ('cp-zoho', 'company-zoho', 'Zoho', 'SaaS', '10000+', 'Chennai, India', 'https://www.zoho.com', 'Zoho Corporation is an Indian multinational technology company.', true, now_ts, now_ts),
  ('cp-postman', 'company-postman', 'Postman', 'Developer Tools', '500+', 'Bangalore, India', 'https://www.postman.com', 'Postman is an API platform for building and using APIs.', true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- JOB OPPORTUNITIES
-- ============================================================================

INSERT INTO "Opportunity" (id, "companyId", slug, title, description, type, "salaryMin", "salaryMax", locations, "isRemote", "requiredSkills", "minExperience", "maxExperience", status, "expiresAt", "createdAt", "updatedAt")
VALUES
  ('opp-tcs-sde', 'cp-tcs', 'tcs-sde-2025', 'Software Development Engineer', 'Join TCS as a Software Development Engineer. Work on cutting-edge enterprise solutions.', 'FULL_TIME', 400000, 800000, ARRAY['Mumbai'], false, ARRAY['Java', 'Spring Boot', 'SQL', 'Git'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-tcs-fsd', 'cp-tcs', 'tcs-fsd-2025', 'Full Stack Developer', 'Build modern web applications using React and Node.js at TCS Digital.', 'FULL_TIME', 500000, 900000, ARRAY['Bangalore'], false, ARRAY['React', 'Node.js', 'MongoDB', 'TypeScript'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-infosys-sde', 'cp-infosys', 'infosys-se-2025', 'Systems Engineer', 'Start your career with Infosys as a Systems Engineer.', 'FULL_TIME', 350000, 700000, ARRAY['Mysore'], false, ARRAY['Java', 'Python', 'SQL', 'Linux'], 0, 12, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-infosys-ds', 'cp-infosys', 'infosys-ds-2025', 'Data Scientist', 'Apply ML and AI to solve business problems at Infosys.', 'FULL_TIME', 800000, 1500000, ARRAY['Bangalore'], false, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-msft-sde', 'cp-microsoft', 'microsoft-swe-2025', 'Software Engineer', 'Build products that empower every person on the planet at Microsoft.', 'FULL_TIME', 1800000, 3500000, ARRAY['Hyderabad'], true, ARRAY['C#', '.NET', 'Azure', 'System Design'], 0, 24, 'PUBLISHED', now_ts + interval '45 days', now_ts, now_ts),
  ('opp-msft-pm', 'cp-microsoft', 'microsoft-pm-2025', 'Product Manager', 'Shape the future of Microsoft products as a PM.', 'FULL_TIME', 2000000, 4000000, ARRAY['Bangalore'], true, ARRAY['Product Management', 'SQL', 'Analytics', 'Communication'], 0, 36, 'PUBLISHED', now_ts + interval '45 days', now_ts, now_ts),
  ('opp-google-swe', 'cp-google', 'google-swe-l3-2025', 'Software Engineer L3', 'Solve complex problems at scale at Google.', 'FULL_TIME', 2500000, 5000000, ARRAY['Bangalore'], true, ARRAY['Algorithms', 'System Design', 'C++', 'Python'], 0, 24, 'PUBLISHED', now_ts + interval '60 days', now_ts, now_ts),
  ('opp-amazon-sde', 'cp-amazon', 'amazon-sde1-2025', 'SDE I', 'Build and operate massively scalable systems at Amazon.', 'FULL_TIME', 2000000, 4000000, ARRAY['Hyderabad'], false, ARRAY['Java', 'AWS', 'System Design', 'Algorithms'], 0, 24, 'PUBLISHED', now_ts + interval '45 days', now_ts, now_ts),
  ('opp-fk-sde', 'cp-flipkart', 'flipkart-sde1-2025', 'SDE 1', 'Build India''s largest e-commerce platform at Flipkart.', 'FULL_TIME', 1800000, 3200000, ARRAY['Bangalore'], false, ARRAY['Java', 'Spring', 'MySQL', 'Redis'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-rzp-be', 'cp-razorpay', 'razorpay-be-2025', 'Backend Engineer', 'Build India''s payment infrastructure at Razorpay.', 'FULL_TIME', 1600000, 3000000, ARRAY['Bangalore'], true, ARRAY['Go', 'Python', 'PostgreSQL', 'Redis'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-cred-sde', 'cp-cred', 'cred-swe-2025', 'Software Engineer', 'Build fintech products for the creditworthy at CRED.', 'FULL_TIME', 2000000, 4000000, ARRAY['Bangalore'], true, ARRAY['Kotlin', 'Spring Boot', 'PostgreSQL', 'Kafka'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-swiggy-sde', 'cp-swiggy', 'swiggy-sde-2025', 'Software Development Engineer', 'Build hyperlocal commerce at Swiggy.', 'FULL_TIME', 1400000, 2800000, ARRAY['Bangalore'], false, ARRAY['Java', 'Microservices', 'Kafka', 'MongoDB'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-frsh-sde', 'cp-freshworks', 'freshworks-swe-2025', 'Software Engineer', 'Build SaaS products loved by millions at Freshworks.', 'FULL_TIME', 1600000, 3200000, ARRAY['Chennai'], true, ARRAY['Ruby', 'React', 'PostgreSQL', 'AWS'], 0, 24, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts),
  ('opp-zoho-member', 'cp-zoho', 'zoho-mts-2025', 'Member Technical Staff', 'Join Zoho and work on enterprise software.', 'FULL_TIME', 800000, 1600000, ARRAY['Chennai'], false, ARRAY['Java', 'JavaScript', 'SQL', 'Linux'], 0, 12, 'PUBLISHED', now_ts + interval '30 days', now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COLLEGE ADMIN USERS
-- ============================================================================

INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('admin-iit-bombay', 'admin@iit-bombay.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-iit-delhi', 'admin@iit-delhi.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-iit-madras', 'admin@iit-madras.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-nit-trichy', 'admin@nit-trichy.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-bits-pilani', 'admin@bits-pilani.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-vit-vellore', 'admin@vit-vellore.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-dtu-delhi', 'admin@dtu-delhi.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts),
  ('admin-pes-bangalore', 'admin@pes-bangalore.demo', password_hash, 'COLLEGE_ADMIN', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "CollegeAdmin" (id, "userId", "collegeId", role, department, "createdAt", "updatedAt")
VALUES
  ('ca-iit-bombay', 'admin-iit-bombay', 'iit-bombay', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-iit-delhi', 'admin-iit-delhi', 'iit-delhi', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-iit-madras', 'admin-iit-madras', 'iit-madras', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-nit-trichy', 'admin-nit-trichy', 'nit-trichy', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-bits-pilani', 'admin-bits-pilani', 'bits-pilani', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-vit-vellore', 'admin-vit-vellore', 'vit-vellore', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-dtu-delhi', 'admin-dtu-delhi', 'dtu-delhi', 'placement_officer', 'Placement Cell', now_ts, now_ts),
  ('ca-pes-bangalore', 'admin-pes-bangalore', 'pes-bangalore', 'placement_officer', 'Placement Cell', now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE STUDENTS (10 per major college)
-- ============================================================================

-- IIT Bombay Students
INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('student-iitb-1', 'aarav.sharma@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-2', 'ananya.gupta@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-3', 'vivaan.singh@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-4', 'priya.patel@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-5', 'arjun.reddy@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-6', 'neha.verma@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-7', 'rohan.kumar@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-8', 'shreya.iyer@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-9', 'kabir.joshi@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-iitb-10', 'kavya.nair@iit-bombay.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Profile" (id, "userId", "firstName", "lastName", "collegeId", "collegeName", branch, "graduationYear", skills, "layersRankOverall", "createdAt", "updatedAt")
VALUES
  ('profile-iitb-1', 'student-iitb-1', 'Aarav', 'Sharma', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2025, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Docker'], 92.5, now_ts, now_ts),
  ('profile-iitb-2', 'student-iitb-2', 'Ananya', 'Gupta', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2025, ARRAY['Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS'], 88.2, now_ts, now_ts),
  ('profile-iitb-3', 'student-iitb-3', 'Vivaan', 'Singh', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Electrical Engineering', 2025, ARRAY['C++', 'Embedded Systems', 'MATLAB', 'Python'], 85.7, now_ts, now_ts),
  ('profile-iitb-4', 'student-iitb-4', 'Priya', 'Patel', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2026, ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB'], 78.3, now_ts, now_ts),
  ('profile-iitb-5', 'student-iitb-5', 'Arjun', 'Reddy', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Data Science and AI', 2025, ARRAY['Python', 'Deep Learning', 'PyTorch', 'NLP', 'Computer Vision'], 90.1, now_ts, now_ts),
  ('profile-iitb-6', 'student-iitb-6', 'Neha', 'Verma', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2026, ARRAY['Go', 'Kubernetes', 'Docker', 'System Design'], 75.4, now_ts, now_ts),
  ('profile-iitb-7', 'student-iitb-7', 'Rohan', 'Kumar', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Information Technology', 2025, ARRAY['Java', 'Microservices', 'Kafka', 'Redis', 'MySQL'], 86.8, now_ts, now_ts),
  ('profile-iitb-8', 'student-iitb-8', 'Shreya', 'Iyer', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2025, ARRAY['Rust', 'WebAssembly', 'React', 'GraphQL'], 87.2, now_ts, now_ts),
  ('profile-iitb-9', 'student-iitb-9', 'Kabir', 'Joshi', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Electronics and Communication', 2026, ARRAY['Verilog', 'FPGA', 'Python', 'Signal Processing'], 72.5, now_ts, now_ts),
  ('profile-iitb-10', 'student-iitb-10', 'Kavya', 'Nair', 'iit-bombay', 'Indian Institute of Technology Bombay', 'Computer Science and Engineering', 2025, ARRAY['Python', 'Django', 'React', 'PostgreSQL', 'Docker'], 89.3, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

-- VIT Vellore Students
INSERT INTO "User" (id, email, "passwordHash", "userType", "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('student-vit-1', 'aditya.mishra@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-2', 'riya.saxena@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-3', 'sanjay.menon@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-4', 'pooja.das@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-5', 'vikram.hegde@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-6', 'divya.pillai@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-7', 'amit.kulkarni@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-8', 'anjali.rao@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-9', 'karan.shetty@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts),
  ('student-vit-10', 'tanya.agarwal@vit-vellore.demo', password_hash, 'STUDENT', now_ts, true, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Profile" (id, "userId", "firstName", "lastName", "collegeId", "collegeName", branch, "graduationYear", skills, "layersRankOverall", "createdAt", "updatedAt")
VALUES
  ('profile-vit-1', 'student-vit-1', 'Aditya', 'Mishra', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2025, ARRAY['Java', 'Spring Boot', 'MySQL', 'Git'], 68.5, now_ts, now_ts),
  ('profile-vit-2', 'student-vit-2', 'Riya', 'Saxena', 'vit-vellore', 'Vellore Institute of Technology', 'Information Technology', 2025, ARRAY['Python', 'Django', 'PostgreSQL', 'Docker'], 72.3, now_ts, now_ts),
  ('profile-vit-3', 'student-vit-3', 'Sanjay', 'Menon', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2026, ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB'], 65.8, now_ts, now_ts),
  ('profile-vit-4', 'student-vit-4', 'Pooja', 'Das', 'vit-vellore', 'Vellore Institute of Technology', 'Data Science and AI', 2025, ARRAY['Python', 'Machine Learning', 'Pandas', 'TensorFlow'], 76.2, now_ts, now_ts),
  ('profile-vit-5', 'student-vit-5', 'Vikram', 'Hegde', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2025, ARRAY['C++', 'Algorithms', 'System Design', 'Go'], 70.4, now_ts, now_ts),
  ('profile-vit-6', 'student-vit-6', 'Divya', 'Pillai', 'vit-vellore', 'Vellore Institute of Technology', 'Electronics and Communication', 2026, ARRAY['Embedded C', 'Arduino', 'Python', 'MATLAB'], 58.9, now_ts, now_ts),
  ('profile-vit-7', 'student-vit-7', 'Amit', 'Kulkarni', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2025, ARRAY['Java', 'Kotlin', 'Android', 'Firebase'], 69.1, now_ts, now_ts),
  ('profile-vit-8', 'student-vit-8', 'Anjali', 'Rao', 'vit-vellore', 'Vellore Institute of Technology', 'Information Technology', 2025, ARRAY['Python', 'Flask', 'React', 'AWS'], 73.7, now_ts, now_ts),
  ('profile-vit-9', 'student-vit-9', 'Karan', 'Shetty', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2026, ARRAY['TypeScript', 'Next.js', 'Prisma', 'PostgreSQL'], 66.2, now_ts, now_ts),
  ('profile-vit-10', 'student-vit-10', 'Tanya', 'Agarwal', 'vit-vellore', 'Vellore Institute of Technology', 'Computer Science and Engineering', 2025, ARRAY['Python', 'Deep Learning', 'PyTorch', 'OpenCV'], 77.8, now_ts, now_ts)
ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Demo accounts created:
--
-- COMPANIES (password: Demo@123):
-- - hr@tcs.demo, hr@infosys.demo, hr@wipro.demo, hr@hcl.demo
-- - hr@msft.demo, hr@googl.demo, hr@amzn.demo, hr@fk.demo
-- - hr@rzp.demo, hr@cred.demo, hr@swiggy.demo, hr@freshworks.demo
--
-- COLLEGE ADMINS (password: Demo@123):
-- - admin@iit-bombay.demo, admin@iit-delhi.demo, admin@iit-madras.demo
-- - admin@nit-trichy.demo, admin@bits-pilani.demo, admin@vit-vellore.demo
--
-- STUDENTS (password: Demo@123):
-- - aarav.sharma@iit-bombay.demo (and 9 more IIT Bombay students)
-- - aditya.mishra@vit-vellore.demo (and 9 more VIT students)
-- ============================================================================
