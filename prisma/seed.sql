-- ============================================================================
-- ALGONAUTS PLATFORM - SEED DATA FOR SUPABASE
-- Run this in Supabase SQL Editor
-- All passwords: Test123! (bcrypt hash below)
-- ============================================================================

-- Clean up existing data (be careful in production!)
TRUNCATE TABLE "Placement" CASCADE;
TRUNCATE TABLE "Application" CASCADE;
TRUNCATE TABLE "Opportunity" CASCADE;
TRUNCATE TABLE "UserBadge" CASCADE;
TRUNCATE TABLE "Badge" CASCADE;
TRUNCATE TABLE "Streak" CASCADE;
TRUNCATE TABLE "Notification" CASCADE;
TRUNCATE TABLE "CollegeAdmin" CASCADE;
TRUNCATE TABLE "Profile" CASCADE;
TRUNCATE TABLE "CompanyProfile" CASCADE;
TRUNCATE TABLE "College" CASCADE;
TRUNCATE TABLE "Session" CASCADE;
TRUNCATE TABLE "Account" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- ============================================================================
-- 1. COLLEGES (3)
-- ============================================================================
INSERT INTO "College" (id, name, "shortName", city, state, tier, type, "isVerified", "establishedYear", "avgPackage", "placementRate", "totalStudents", "activeStudents", "createdAt", "updatedAt") VALUES
('college_iit_delhi', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'New Delhi', 'Delhi', 'Tier 1', 'Engineering', true, 1961, 25.5, 95.5, 5000, 1200, NOW(), NOW()),
('college_bits_pilani', 'Birla Institute of Technology and Science Pilani', 'BITS Pilani', 'Pilani', 'Rajasthan', 'Tier 1', 'Engineering', true, 1964, 22.0, 92.0, 4500, 1100, NOW(), NOW()),
('college_vit_vellore', 'Vellore Institute of Technology', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 'Tier 2', 'Engineering', true, 1984, 12.5, 85.0, 20000, 5000, NOW(), NOW());

-- ============================================================================
-- 2. USERS (11 total: 5 students, 3 companies, 3 college admins)
-- Password hash for "Test123!"
-- ============================================================================
-- Students
INSERT INTO "User" (id, email, "emailVerified", "passwordHash", "userType", "isActive", "createdAt", "updatedAt") VALUES
('user_student_1', 'student@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'STUDENT', true, NOW(), NOW()),
('user_student_2', 'student2@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'STUDENT', true, NOW(), NOW()),
('user_student_3', 'student3@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'STUDENT', true, NOW(), NOW()),
('user_student_4', 'student4@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'STUDENT', true, NOW(), NOW()),
('user_student_5', 'student5@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'STUDENT', true, NOW(), NOW());

-- Companies
INSERT INTO "User" (id, email, "emailVerified", "passwordHash", "userType", "isActive", "createdAt", "updatedAt") VALUES
('user_company_1', 'company@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COMPANY', true, NOW(), NOW()),
('user_company_2', 'company2@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COMPANY', true, NOW(), NOW()),
('user_company_3', 'company3@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COMPANY', true, NOW(), NOW());

-- College Admins
INSERT INTO "User" (id, email, "emailVerified", "passwordHash", "userType", "isActive", "createdAt", "updatedAt") VALUES
('user_college_1', 'college@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COLLEGE_ADMIN', true, NOW(), NOW()),
('user_college_2', 'college2@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COLLEGE_ADMIN', true, NOW(), NOW()),
('user_college_3', 'college3@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'COLLEGE_ADMIN', true, NOW(), NOW());

-- Platform Admin
INSERT INTO "User" (id, email, "emailVerified", "passwordHash", "userType", "isActive", "createdAt", "updatedAt") VALUES
('user_admin_1', 'admin@test.com', NOW(), '$2b$10$TxTBnXS8Su1.k.RXQGTAW.T9T9HVKy5z8QGsEyH5tWLbAlcdHS4DG', 'PLATFORM_ADMIN', true, NOW(), NOW());

-- ============================================================================
-- 3. STUDENT PROFILES (5)
-- ============================================================================
INSERT INTO "Profile" (id, "userId", "firstName", "lastName", "displayName", city, state, "collegeId", "collegeName", degree, branch, "graduationYear", cgpa, skills, "preferredRoles", "preferredLocations", "layersRankOverall", "layersRankTechnical", "layersRankBehavioral", "layersRankContextual", "confidenceScore", "profileCompletionPct", "completionStatus", "totalXp", "currentLevel", "currentStreak", "longestStreak", "openToRemote", "openToRelocation", "isPublic", "isSearchable", "showOnLeaderboard", "createdAt", "updatedAt") VALUES
('profile_1', 'user_student_1', 'Rahul', 'Sharma', 'Rahul Sharma', 'New Delhi', 'Delhi', 'college_iit_delhi', 'IIT Delhi', 'B.Tech', 'Computer Science', 2025, 8.5, ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'SQL'], ARRAY['Software Engineer', 'Full Stack Developer'], ARRAY['Bangalore', 'Delhi', 'Remote'], 75.0, 78.0, 72.0, 75.0, 0.85, 90, 'COMPLETE', 2500, 5, 7, 15, true, true, true, true, true, NOW(), NOW()),
('profile_2', 'user_student_2', 'Priya', 'Patel', 'Priya Patel', 'Pilani', 'Rajasthan', 'college_bits_pilani', 'BITS Pilani', 'B.E.', 'Electronics', 2024, 9.2, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Data Science', 'SQL'], ARRAY['Data Scientist', 'ML Engineer'], ARRAY['Bangalore', 'Hyderabad', 'Remote'], 82.0, 85.0, 80.0, 81.0, 0.92, 95, 'VERIFIED', 4200, 8, 21, 30, true, false, true, true, true, NOW(), NOW()),
('profile_3', 'user_student_3', 'Amit', 'Kumar', 'Amit Kumar', 'Trichy', 'Tamil Nadu', 'college_vit_vellore', 'NIT Trichy', 'B.Tech', 'Information Technology', 2025, 7.8, ARRAY['Java', 'Spring Boot', 'MySQL', 'AWS'], ARRAY['Backend Developer', 'Java Developer'], ARRAY['Chennai', 'Bangalore'], 68.0, 70.0, 65.0, 69.0, 0.78, 75, 'COMPLETE', 1800, 4, 3, 10, false, true, true, true, true, NOW(), NOW()),
('profile_4', 'user_student_4', 'Sneha', 'Reddy', 'Sneha Reddy', 'Vellore', 'Tamil Nadu', 'college_vit_vellore', 'VIT Vellore', 'B.Tech', 'Computer Science', 2025, 8.0, ARRAY['React', 'TypeScript', 'Next.js', 'CSS', 'Figma'], ARRAY['Frontend Developer', 'UI/UX Designer'], ARRAY['Bangalore', 'Remote'], 71.0, 68.0, 75.0, 70.0, 0.80, 80, 'COMPLETE', 2100, 4, 5, 12, true, false, true, true, true, NOW(), NOW()),
('profile_5', 'user_student_5', 'Vikram', 'Singh', 'Vikram Singh', 'Delhi', 'Delhi', 'college_iit_delhi', 'DTU Delhi', 'B.Tech', 'Software Engineering', 2024, 8.8, ARRAY['Go', 'Kubernetes', 'Docker', 'AWS', 'Terraform'], ARRAY['DevOps Engineer', 'SRE', 'Cloud Engineer'], ARRAY['Bangalore', 'Delhi', 'Hyderabad'], 79.0, 82.0, 76.0, 79.0, 0.88, 85, 'COMPLETE', 3500, 6, 14, 20, true, true, true, true, true, NOW(), NOW());

-- ============================================================================
-- 4. COMPANY PROFILES (3)
-- ============================================================================
INSERT INTO "CompanyProfile" (id, "userId", "companyName", "legalName", industry, "companySize", "foundedYear", website, description, headquarters, locations, "contactName", "contactEmail", "isVerified", "verifiedAt", "subscriptionTier", "invitesRemaining", "createdAt", "updatedAt") VALUES
('company_1', 'user_company_1', 'TechCorp India', 'TechCorp India Private Limited', 'Information Technology', '1001-5000', 2010, 'https://techcorp.in', 'Leading enterprise software company specializing in cloud solutions and digital transformation.', 'Bangalore', ARRAY['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'], 'Rajesh Kumar', 'hr@techcorp.in', true, NOW(), 'enterprise', 100, NOW(), NOW()),
('company_2', 'user_company_2', 'StartupXYZ', 'StartupXYZ Technologies Pvt Ltd', 'Technology', '51-200', 2020, 'https://startupxyz.io', 'Fast-growing startup building the next generation of productivity tools for remote teams.', 'Bangalore', ARRAY['Bangalore', 'Remote'], 'Meera Shah', 'careers@startupxyz.io', true, NOW(), 'startup', 25, NOW(), NOW()),
('company_3', 'user_company_3', 'GlobalSoft', 'GlobalSoft Solutions Limited', 'IT Services', '5001-10000', 2005, 'https://globalsoft.com', 'Global IT services and consulting company with presence in 20+ countries.', 'Hyderabad', ARRAY['Hyderabad', 'Bangalore', 'Pune', 'Chennai', 'Delhi'], 'Anil Verma', 'recruitment@globalsoft.com', true, NOW(), 'enterprise', 200, NOW(), NOW());

-- ============================================================================
-- 5. COLLEGE ADMINS (3)
-- ============================================================================
INSERT INTO "CollegeAdmin" (id, "userId", "collegeId", role, department, "isActive", "createdAt", "updatedAt") VALUES
('college_admin_1', 'user_college_1', 'college_iit_delhi', 'placement_officer', 'Training and Placement Cell', true, NOW(), NOW()),
('college_admin_2', 'user_college_2', 'college_bits_pilani', 'admin', 'Placement Division', true, NOW(), NOW()),
('college_admin_3', 'user_college_3', 'college_vit_vellore', 'placement_officer', 'Career Development Centre', true, NOW(), NOW());

-- ============================================================================
-- 6. OPPORTUNITIES (6) - 2 from each company
-- ============================================================================
-- TechCorp opportunities
INSERT INTO "Opportunity" (id, "companyId", title, slug, description, requirements, type, "isRemote", locations, "salaryMin", "salaryMax", "requiredSkills", "preferredSkills", "minExperience", "maxExperience", "minLayersRank", status, "publishedAt", "expiresAt", "viewCount", "applicationCount", "createdAt", "updatedAt") VALUES
('opp_1', 'company_1', 'Software Development Engineer Intern', 'techcorp-sde-intern-2025', 'Join TechCorp as an SDE Intern and work on cutting-edge cloud technologies. You will be part of a team building scalable microservices and contributing to our core platform.

Responsibilities:
- Write clean, maintainable code
- Participate in code reviews
- Collaborate with senior engineers
- Learn and apply best practices', '- Currently pursuing B.Tech/B.E. in CS/IT
- Strong fundamentals in DSA
- Knowledge of at least one programming language
- Good communication skills', 'INTERNSHIP', false, ARRAY['Bangalore', 'Hyderabad'], 2500000, 3500000, ARRAY['JavaScript', 'Python', 'SQL'], ARRAY['React', 'Node.js', 'AWS'], 0, 12, 60.0, 'PUBLISHED', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 245, 38, NOW(), NOW()),

('opp_2', 'company_1', 'Data Analyst', 'techcorp-data-analyst-2025', 'TechCorp is looking for a Data Analyst to join our Business Intelligence team. You will work with large datasets to derive insights that drive business decisions.

Responsibilities:
- Analyze large datasets using SQL and Python
- Create dashboards and reports
- Work with stakeholders to understand requirements
- Present findings to leadership', '- B.Tech/B.E. with strong analytical skills
- Proficiency in SQL and Python
- Experience with BI tools (Tableau/PowerBI)
- Strong communication skills', 'FULL_TIME', false, ARRAY['Bangalore', 'Mumbai'], 800000, 1200000, ARRAY['SQL', 'Python', 'Excel'], ARRAY['Tableau', 'PowerBI', 'Statistics'], 0, 24, 55.0, 'PUBLISHED', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', 189, 24, NOW(), NOW());

-- StartupXYZ opportunities
INSERT INTO "Opportunity" (id, "companyId", title, slug, description, requirements, type, "isRemote", locations, "salaryMin", "salaryMax", "requiredSkills", "preferredSkills", "minExperience", "maxExperience", "minLayersRank", status, "publishedAt", "expiresAt", "viewCount", "applicationCount", "createdAt", "updatedAt") VALUES
('opp_3', 'company_2', 'Full Stack Developer', 'startupxyz-fullstack-2025', 'Join our engineering team and help build the future of remote work tools. We are a fast-paced startup where you will have significant ownership and impact.

What you will do:
- Build features end-to-end
- Work directly with founders
- Ship code to production daily
- Help define our technical direction', '- Strong foundation in web development
- Experience with React and Node.js
- Ability to work independently
- Startup mindset', 'FULL_TIME', true, ARRAY['Bangalore', 'Remote'], 1200000, 1800000, ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'], ARRAY['AWS', 'Docker', 'GraphQL'], 0, 36, 70.0, 'PUBLISHED', NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', 312, 52, NOW(), NOW()),

('opp_4', 'company_2', 'Frontend Engineer', 'startupxyz-frontend-2025', 'We need a passionate Frontend Engineer to create beautiful, performant user interfaces. You will work closely with our design team to bring mockups to life.

Responsibilities:
- Implement responsive UI components
- Optimize for performance
- Write unit and integration tests
- Collaborate with designers', '- Expert in React/Next.js
- Strong CSS/Tailwind skills
- Eye for design
- Performance optimization experience', 'FULL_TIME', true, ARRAY['Remote'], 1000000, 1500000, ARRAY['React', 'TypeScript', 'CSS', 'Next.js'], ARRAY['Framer Motion', 'Testing Library', 'Storybook'], 0, 24, 65.0, 'PUBLISHED', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', 156, 28, NOW(), NOW());

-- GlobalSoft opportunities
INSERT INTO "Opportunity" (id, "companyId", title, slug, description, requirements, type, "isRemote", locations, "salaryMin", "salaryMax", "requiredSkills", "preferredSkills", "minExperience", "maxExperience", "minLayersRank", status, "publishedAt", "expiresAt", "viewCount", "applicationCount", "createdAt", "updatedAt") VALUES
('opp_5', 'company_3', 'Backend Developer', 'globalsoft-backend-2025', 'GlobalSoft is hiring Backend Developers for our enterprise solutions team. You will work on large-scale distributed systems serving millions of users.

Key responsibilities:
- Design and implement APIs
- Work with microservices architecture
- Ensure system reliability
- Mentor junior developers', '- Strong Java/Spring Boot experience
- Understanding of distributed systems
- Database design skills
- Team player', 'FULL_TIME', false, ARRAY['Hyderabad', 'Bangalore', 'Pune'], 1000000, 1600000, ARRAY['Java', 'Spring Boot', 'MySQL', 'Redis'], ARRAY['Kafka', 'Elasticsearch', 'Kubernetes'], 12, 60, 65.0, 'PUBLISHED', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 278, 45, NOW(), NOW()),

('opp_6', 'company_3', 'DevOps Engineer', 'globalsoft-devops-2025', 'Join our Platform Engineering team as a DevOps Engineer. You will build and maintain the infrastructure that powers our global services.

What you will do:
- Build CI/CD pipelines
- Manage Kubernetes clusters
- Implement infrastructure as code
- Ensure 99.99% uptime', '- Experience with Kubernetes and Docker
- Strong scripting skills
- Cloud platform experience (AWS/GCP/Azure)
- SRE mindset', 'FULL_TIME', false, ARRAY['Hyderabad', 'Bangalore'], 1400000, 2200000, ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform'], ARRAY['Go', 'Python', 'Prometheus', 'Grafana'], 12, 48, 75.0, 'PUBLISHED', NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', 134, 18, NOW(), NOW());

-- ============================================================================
-- 7. APPLICATIONS (10)
-- ============================================================================
INSERT INTO "Application" (id, "userId", "opportunityId", "coverLetter", status, "statusHistory", source, "submittedAt", "createdAt", "updatedAt") VALUES
-- Rahul's applications
('app_1', 'user_student_1', 'opp_1', 'I am excited to apply for the SDE Intern position at TechCorp. With my strong foundation in JavaScript and Python, I believe I can contribute effectively to your team.', 'SUBMITTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-20T10:00:00Z"}'::jsonb], 'DIRECT', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
('app_2', 'user_student_1', 'opp_3', 'As a passionate full-stack developer, I am thrilled about the opportunity to join StartupXYZ. The fast-paced environment aligns perfectly with my career goals.', 'SHORTLISTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-18T10:00:00Z"}'::jsonb, '{"status": "SHORTLISTED", "timestamp": "2024-12-22T14:00:00Z"}'::jsonb], 'SEARCH', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW()),

-- Priya's applications (she got placed at TechCorp)
('app_3', 'user_student_2', 'opp_2', 'With my strong background in data science and machine learning from BITS Pilani, I am confident I can add value to the Business Intelligence team at TechCorp.', 'OFFER_ACCEPTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-11-15T10:00:00Z"}'::jsonb, '{"status": "SHORTLISTED", "timestamp": "2024-11-20T14:00:00Z"}'::jsonb, '{"status": "INTERVIEWED", "timestamp": "2024-11-25T10:00:00Z"}'::jsonb, '{"status": "OFFER_MADE", "timestamp": "2024-11-28T10:00:00Z"}'::jsonb, '{"status": "OFFER_ACCEPTED", "timestamp": "2024-11-30T10:00:00Z"}'::jsonb], 'RECOMMENDATION', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW()),

-- Amit's applications
('app_4', 'user_student_3', 'opp_5', 'I am applying for the Backend Developer position at GlobalSoft. My experience with Java and Spring Boot makes me a strong fit for this role.', 'UNDER_REVIEW', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-22T10:00:00Z"}'::jsonb, '{"status": "UNDER_REVIEW", "timestamp": "2024-12-24T10:00:00Z"}'::jsonb], 'DIRECT', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW()),
('app_5', 'user_student_3', 'opp_1', 'I would love to intern at TechCorp to gain experience in enterprise software development.', 'SUBMITTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-23T10:00:00Z"}'::jsonb], 'SEARCH', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),

-- Sneha's applications
('app_6', 'user_student_4', 'opp_4', 'Frontend development is my passion. I have built multiple projects using React and Next.js, and I am excited about the opportunity at StartupXYZ.', 'INTERVIEW_SCHEDULED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-20T10:00:00Z"}'::jsonb, '{"status": "SHORTLISTED", "timestamp": "2024-12-23T14:00:00Z"}'::jsonb, '{"status": "INTERVIEW_SCHEDULED", "timestamp": "2024-12-25T10:00:00Z"}'::jsonb], 'DIRECT', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
('app_7', 'user_student_4', 'opp_3', 'I am interested in the Full Stack Developer role as it would allow me to expand my backend skills while leveraging my frontend expertise.', 'SUBMITTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-24T10:00:00Z"}'::jsonb], 'SEARCH', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW()),

-- Vikram's applications (he got placed at GlobalSoft)
('app_8', 'user_student_5', 'opp_6', 'With my extensive experience in Kubernetes, Docker, and AWS, I am the ideal candidate for the DevOps Engineer position at GlobalSoft.', 'OFFER_ACCEPTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-11-20T10:00:00Z"}'::jsonb, '{"status": "SHORTLISTED", "timestamp": "2024-11-25T14:00:00Z"}'::jsonb, '{"status": "INTERVIEWED", "timestamp": "2024-12-01T10:00:00Z"}'::jsonb, '{"status": "OFFER_MADE", "timestamp": "2024-12-05T10:00:00Z"}'::jsonb, '{"status": "OFFER_ACCEPTED", "timestamp": "2024-12-08T10:00:00Z"}'::jsonb], 'DIRECT', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW()),
('app_9', 'user_student_5', 'opp_3', 'I am interested in transitioning to full-stack development while leveraging my DevOps background.', 'REJECTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-10T10:00:00Z"}'::jsonb, '{"status": "REJECTED", "timestamp": "2024-12-15T14:00:00Z", "note": "Looking for candidates with more frontend experience"}'::jsonb], 'SEARCH', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW()),

-- Additional application
('app_10', 'user_student_1', 'opp_6', 'I am expanding my skills into DevOps and would love to learn from the experienced team at GlobalSoft.', 'SUBMITTED', ARRAY['{"status": "SUBMITTED", "timestamp": "2024-12-25T10:00:00Z"}'::jsonb], 'RECOMMENDATION', NOW(), NOW(), NOW());

-- ============================================================================
-- 8. PLACEMENTS (2)
-- ============================================================================
INSERT INTO "Placement" (id, "userId", "applicationId", "companyName", "jobTitle", location, "startDate", "salaryOffered", status, "verificationType", "verification30RequestedAt", "verification30CompletedAt", "verification30Method", "attributedToCollegeId", "rewardPointsAwarded", "createdAt", "updatedAt") VALUES
-- Priya at TechCorp (30-day verified, pending 90-day)
('placement_1', 'user_student_2', 'app_3', 'TechCorp India', 'Data Analyst', 'Bangalore', NOW() - INTERVAL '35 days', 1000000, 'VERIFICATION_90_PENDING', 'EMAIL_VERIFIED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', 'EMAIL_VERIFIED', 'college_bits_pilani', 175, NOW() - INTERVAL '35 days', NOW()),

-- Vikram at GlobalSoft (placed, pending 30-day verification)
('placement_2', 'user_student_5', 'app_8', 'GlobalSoft', 'DevOps Engineer', 'Hyderabad', NOW() - INTERVAL '20 days', 1800000, 'VERIFICATION_30_PENDING', 'SELF_REPORTED', NOW() - INTERVAL '10 days', NULL, NULL, 'college_iit_delhi', 50, NOW() - INTERVAL '20 days', NOW());

-- ============================================================================
-- 9. BADGES (not needed - badges are defined in code)
-- ============================================================================
-- Badge definitions are in src/server/api/routers/badges.ts BADGES constant
-- We only need to insert UserBadge records with matching IDs

-- ============================================================================
-- 10. USER BADGES (using IDs from BADGES constant in code)
-- ============================================================================
INSERT INTO "UserBadge" (id, "userId", "badgeId", "earnedAt", "isDisplayed") VALUES
-- Rahul's badges
('ub_1', 'user_student_1', 'first_application', NOW() - INTERVAL '30 days', true),
('ub_2', 'user_student_1', 'complete_profile', NOW() - INTERVAL '25 days', true),
('ub_3', 'user_student_1', 'streak_7', NOW() - INTERVAL '20 days', true),

-- Priya's badges (she has the most)
('ub_4', 'user_student_2', 'first_application', NOW() - INTERVAL '60 days', true),
('ub_5', 'user_student_2', 'ten_applications', NOW() - INTERVAL '45 days', true),
('ub_6', 'user_student_2', 'complete_profile', NOW() - INTERVAL '55 days', true),
('ub_7', 'user_student_2', 'streak_7', NOW() - INTERVAL '40 days', true),
('ub_8', 'user_student_2', 'streak_30', NOW() - INTERVAL '10 days', true),
('ub_9', 'user_student_2', 'first_placement', NOW() - INTERVAL '35 days', true),
('ub_10', 'user_student_2', 'top_10_percent_skill', NOW() - INTERVAL '20 days', true),

-- Amit's badges
('ub_11', 'user_student_3', 'first_application', NOW() - INTERVAL '15 days', true),
('ub_12', 'user_student_3', 'complete_profile', NOW() - INTERVAL '20 days', true),

-- Sneha's badges
('ub_13', 'user_student_4', 'first_application', NOW() - INTERVAL '20 days', true),
('ub_14', 'user_student_4', 'complete_profile', NOW() - INTERVAL '22 days', true),
('ub_15', 'user_student_4', 'resume_uploaded', NOW() - INTERVAL '18 days', true),

-- Vikram's badges
('ub_16', 'user_student_5', 'first_application', NOW() - INTERVAL '40 days', true),
('ub_17', 'user_student_5', 'ten_applications', NOW() - INTERVAL '30 days', true),
('ub_18', 'user_student_5', 'complete_profile', NOW() - INTERVAL '35 days', true),
('ub_19', 'user_student_5', 'streak_7', NOW() - INTERVAL '25 days', true),
('ub_20', 'user_student_5', 'first_placement', NOW() - INTERVAL '20 days', true);

-- ============================================================================
-- 11. STREAKS
-- ============================================================================
INSERT INTO "Streak" (id, "userId", "streakType", "currentCount", "longestCount", "lastActivityAt", "createdAt", "updatedAt") VALUES
('streak_1', 'user_student_1', 'daily_login', 7, 15, NOW(), NOW(), NOW()),
('streak_2', 'user_student_2', 'daily_login', 21, 30, NOW(), NOW(), NOW()),
('streak_3', 'user_student_3', 'daily_login', 3, 10, NOW(), NOW(), NOW()),
('streak_4', 'user_student_4', 'daily_login', 5, 12, NOW(), NOW(), NOW()),
('streak_5', 'user_student_5', 'daily_login', 14, 20, NOW(), NOW(), NOW());

-- ============================================================================
-- 12. NOTIFICATIONS (sample)
-- ============================================================================
INSERT INTO "Notification" (id, "userId", type, title, body, "actionUrl", channels, "isRead", "createdAt") VALUES
('notif_1', 'user_student_1', 'APPLICATION', 'Application Received', 'Your application for SDE Intern at TechCorp has been received.', '/applications', ARRAY['IN_APP']::"NotificationChannel"[], false, NOW() - INTERVAL '5 days'),
('notif_2', 'user_student_1', 'OPPORTUNITY', 'New Opportunity Match', 'StartupXYZ is looking for Full Stack Developers. This matches your profile!', '/opportunities/opp_3', ARRAY['IN_APP', 'EMAIL']::"NotificationChannel"[], true, NOW() - INTERVAL '7 days'),
('notif_3', 'user_student_2', 'PLACEMENT', 'Congratulations!', 'Your placement at TechCorp has been verified. Welcome to the team!', '/placements/placement_1', ARRAY['IN_APP', 'EMAIL']::"NotificationChannel"[], true, NOW() - INTERVAL '35 days'),
('notif_4', 'user_student_4', 'APPLICATION', 'Interview Scheduled', 'Your interview with StartupXYZ has been scheduled for next week.', '/applications/app_6', ARRAY['IN_APP', 'EMAIL']::"NotificationChannel"[], false, NOW() - INTERVAL '2 days'),
('notif_5', 'user_student_5', 'STREAK', 'Streak Milestone!', 'You have maintained a 14-day streak. Keep it up!', '/dashboard', ARRAY['IN_APP']::"NotificationChannel"[], false, NOW() - INTERVAL '1 day');

-- ============================================================================
-- 13. LEADERBOARDS
-- ============================================================================
INSERT INTO "Leaderboard" (id, type, "scopeId", period, rankings, "calculatedAt") VALUES
('lb_global_all', 'global', NULL, 'all_time', '[
  {"userId": "user_student_2", "rank": 1, "score": 82, "delta": 0},
  {"userId": "user_student_5", "rank": 2, "score": 79, "delta": 1},
  {"userId": "user_student_1", "rank": 3, "score": 75, "delta": -1},
  {"userId": "user_student_4", "rank": 4, "score": 71, "delta": 0},
  {"userId": "user_student_3", "rank": 5, "score": 68, "delta": 0}
]'::jsonb, NOW()),
('lb_college_iit', 'college', 'college_iit_delhi', 'all_time', '[
  {"userId": "user_student_5", "rank": 1, "score": 79, "delta": 0},
  {"userId": "user_student_1", "rank": 2, "score": 75, "delta": 0}
]'::jsonb, NOW()),
('lb_college_bits', 'college', 'college_bits_pilani', 'all_time', '[
  {"userId": "user_student_2", "rank": 1, "score": 82, "delta": 0}
]'::jsonb, NOW()),
('lb_college_vit', 'college', 'college_vit_vellore', 'all_time', '[
  {"userId": "user_student_4", "rank": 1, "score": 71, "delta": 0},
  {"userId": "user_student_3", "rank": 2, "score": 68, "delta": 0}
]'::jsonb, NOW());

-- ============================================================================
-- DONE!
-- Test accounts:
-- Students: student@test.com, student2@test.com, student3@test.com, student4@test.com, student5@test.com
-- Companies: company@test.com, company2@test.com, company3@test.com
-- Colleges: college@test.com, college2@test.com, college3@test.com
-- Admin: admin@test.com
-- All passwords: Test123!
-- ============================================================================
