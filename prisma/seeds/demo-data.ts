/**
 * Demo Data Seed Script
 *
 * Run with: npx ts-node prisma/seeds/demo-data.ts
 *
 * This creates realistic demo data including:
 * - Indian IT companies (TCS, Infosys, Wipro, etc.)
 * - Unicorn startups
 * - Top colleges (IITs, NITs, etc.)
 * - Sample students with realistic profiles
 * - Launchpad posts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// DEMO DATA
// ============================================================================

const COMPANIES = [
  // IT Services Giants
  { name: "Tata Consultancy Services", short: "TCS", domain: "IT Services", city: "Mumbai", size: "500000+", minSalary: 4, maxSalary: 12 },
  { name: "Infosys", short: "Infosys", domain: "IT Services", city: "Bangalore", size: "100000+", minSalary: 3.5, maxSalary: 10 },
  { name: "Wipro", short: "Wipro", domain: "IT Services", city: "Bangalore", size: "100000+", minSalary: 3.5, maxSalary: 9 },
  { name: "HCL Technologies", short: "HCL", domain: "IT Services", city: "Noida", size: "100000+", minSalary: 4, maxSalary: 11 },
  { name: "Tech Mahindra", short: "TechM", domain: "IT Services", city: "Pune", size: "100000+", minSalary: 3.5, maxSalary: 10 },
  { name: "Cognizant", short: "CTS", domain: "IT Services", city: "Chennai", size: "100000+", minSalary: 4, maxSalary: 12 },
  { name: "Accenture", short: "ACN", domain: "Consulting", city: "Bangalore", size: "100000+", minSalary: 5, maxSalary: 15 },
  { name: "Capgemini", short: "Cap", domain: "Consulting", city: "Mumbai", size: "50000+", minSalary: 4, maxSalary: 12 },
  { name: "LTI Mindtree", short: "LTIM", domain: "IT Services", city: "Mumbai", size: "50000+", minSalary: 4, maxSalary: 11 },

  // Product Companies
  { name: "Microsoft India", short: "MSFT", domain: "Product", city: "Hyderabad", size: "10000+", minSalary: 15, maxSalary: 45 },
  { name: "Google India", short: "GOOGL", domain: "Product", city: "Bangalore", size: "5000+", minSalary: 20, maxSalary: 60 },
  { name: "Amazon India", short: "AMZN", domain: "Product", city: "Hyderabad", size: "50000+", minSalary: 18, maxSalary: 50 },
  { name: "Adobe India", short: "ADBE", domain: "Product", city: "Noida", size: "5000+", minSalary: 15, maxSalary: 40 },
  { name: "Salesforce India", short: "CRM", domain: "Product", city: "Hyderabad", size: "5000+", minSalary: 14, maxSalary: 35 },
  { name: "Flipkart", short: "FK", domain: "E-commerce", city: "Bangalore", size: "10000+", minSalary: 18, maxSalary: 45 },
  { name: "Walmart Global Tech", short: "WMT", domain: "Product", city: "Bangalore", size: "5000+", minSalary: 15, maxSalary: 40 },
  { name: "Oracle India", short: "ORCL", domain: "Product", city: "Bangalore", size: "10000+", minSalary: 12, maxSalary: 35 },
  { name: "SAP Labs India", short: "SAP", domain: "Product", city: "Bangalore", size: "10000+", minSalary: 12, maxSalary: 30 },

  // Unicorn Startups
  { name: "Razorpay", short: "RZP", domain: "Fintech", city: "Bangalore", size: "1000+", minSalary: 15, maxSalary: 40 },
  { name: "Zerodha", short: "ZRD", domain: "Fintech", city: "Bangalore", size: "1000+", minSalary: 18, maxSalary: 50 },
  { name: "CRED", short: "CRED", domain: "Fintech", city: "Bangalore", size: "500+", minSalary: 20, maxSalary: 55 },
  { name: "PhonePe", short: "PPe", domain: "Fintech", city: "Bangalore", size: "2000+", minSalary: 18, maxSalary: 45 },
  { name: "Swiggy", short: "SWG", domain: "Food Tech", city: "Bangalore", size: "5000+", minSalary: 14, maxSalary: 35 },
  { name: "Zomato", short: "ZMT", domain: "Food Tech", city: "Gurugram", size: "5000+", minSalary: 14, maxSalary: 35 },
  { name: "Byju's", short: "BJU", domain: "EdTech", city: "Bangalore", size: "10000+", minSalary: 8, maxSalary: 25 },
  { name: "Unacademy", short: "UNA", domain: "EdTech", city: "Bangalore", size: "2000+", minSalary: 10, maxSalary: 30 },
  { name: "upGrad", short: "UPG", domain: "EdTech", city: "Mumbai", size: "2000+", minSalary: 10, maxSalary: 28 },
  { name: "Ola", short: "OLA", domain: "Mobility", city: "Bangalore", size: "5000+", minSalary: 12, maxSalary: 35 },
  { name: "Meesho", short: "MSH", domain: "E-commerce", city: "Bangalore", size: "2000+", minSalary: 16, maxSalary: 40 },
  { name: "Dream11", short: "D11", domain: "Gaming", city: "Mumbai", size: "1000+", minSalary: 18, maxSalary: 50 },
  { name: "Groww", short: "GRW", domain: "Fintech", city: "Bangalore", size: "500+", minSalary: 18, maxSalary: 45 },
  { name: "Paytm", short: "PTM", domain: "Fintech", city: "Noida", size: "10000+", minSalary: 12, maxSalary: 35 },
  { name: "Nykaa", short: "NYK", domain: "E-commerce", city: "Mumbai", size: "2000+", minSalary: 10, maxSalary: 28 },
  { name: "Freshworks", short: "FRSH", domain: "SaaS", city: "Chennai", size: "5000+", minSalary: 16, maxSalary: 45 },
  { name: "Zoho", short: "ZOHO", domain: "SaaS", city: "Chennai", size: "10000+", minSalary: 8, maxSalary: 25 },
  { name: "Postman", short: "POST", domain: "Developer Tools", city: "Bangalore", size: "500+", minSalary: 20, maxSalary: 50 },
  { name: "Innovaccer", short: "INNO", domain: "HealthTech", city: "Noida", size: "1000+", minSalary: 16, maxSalary: 40 },
  { name: "Browserstack", short: "BS", domain: "Developer Tools", city: "Mumbai", size: "500+", minSalary: 18, maxSalary: 45 },
];

const COLLEGES = [
  // IITs
  { name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "IIT", rank: 1 },
  { name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", city: "New Delhi", state: "Delhi", type: "IIT", rank: 2 },
  { name: "Indian Institute of Technology Madras", shortName: "IIT Madras", city: "Chennai", state: "Tamil Nadu", type: "IIT", rank: 3 },
  { name: "Indian Institute of Technology Kanpur", shortName: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", type: "IIT", rank: 4 },
  { name: "Indian Institute of Technology Kharagpur", shortName: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", type: "IIT", rank: 5 },
  { name: "Indian Institute of Technology Roorkee", shortName: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand", type: "IIT", rank: 6 },
  { name: "Indian Institute of Technology Guwahati", shortName: "IIT Guwahati", city: "Guwahati", state: "Assam", type: "IIT", rank: 7 },
  { name: "Indian Institute of Technology Hyderabad", shortName: "IIT Hyderabad", city: "Hyderabad", state: "Telangana", type: "IIT", rank: 8 },

  // NITs
  { name: "National Institute of Technology Trichy", shortName: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", type: "NIT", rank: 10 },
  { name: "National Institute of Technology Warangal", shortName: "NIT Warangal", city: "Warangal", state: "Telangana", type: "NIT", rank: 11 },
  { name: "National Institute of Technology Surathkal", shortName: "NIT Surathkal", city: "Mangalore", state: "Karnataka", type: "NIT", rank: 12 },
  { name: "National Institute of Technology Rourkela", shortName: "NIT Rourkela", city: "Rourkela", state: "Odisha", type: "NIT", rank: 13 },
  { name: "National Institute of Technology Calicut", shortName: "NIT Calicut", city: "Calicut", state: "Kerala", type: "NIT", rank: 14 },
  { name: "National Institute of Technology Jamshedpur", shortName: "NIT Jamshedpur", city: "Jamshedpur", state: "Jharkhand", type: "NIT", rank: 15 },
  { name: "National Institute of Technology Kurukshetra", shortName: "NIT Kurukshetra", city: "Kurukshetra", state: "Haryana", type: "NIT", rank: 16 },
  { name: "National Institute of Technology Nagpur", shortName: "VNIT Nagpur", city: "Nagpur", state: "Maharashtra", type: "NIT", rank: 17 },

  // Other Top Colleges
  { name: "BITS Pilani", shortName: "BITS", city: "Pilani", state: "Rajasthan", type: "Private", rank: 9 },
  { name: "Vellore Institute of Technology", shortName: "VIT", city: "Vellore", state: "Tamil Nadu", type: "Private", rank: 18 },
  { name: "SRM Institute of Science and Technology", shortName: "SRM", city: "Chennai", state: "Tamil Nadu", type: "Private", rank: 20 },
  { name: "Manipal Institute of Technology", shortName: "MIT Manipal", city: "Manipal", state: "Karnataka", type: "Private", rank: 22 },
  { name: "Delhi Technological University", shortName: "DTU", city: "New Delhi", state: "Delhi", type: "State", rank: 19 },
  { name: "Netaji Subhas University of Technology", shortName: "NSUT", city: "New Delhi", state: "Delhi", type: "State", rank: 21 },
  { name: "PSG College of Technology", shortName: "PSG Tech", city: "Coimbatore", state: "Tamil Nadu", type: "Private", rank: 25 },
  { name: "Anna University", shortName: "Anna Univ", city: "Chennai", state: "Tamil Nadu", type: "State", rank: 28 },
  { name: "PES University", shortName: "PES", city: "Bangalore", state: "Karnataka", type: "Private", rank: 30 },
  { name: "RV College of Engineering", shortName: "RVCE", city: "Bangalore", state: "Karnataka", type: "Private", rank: 32 },
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Ananya", "Aanya", "Aadhya", "Saanvi", "Pari", "Myra", "Sara", "Ira", "Navya", "Anika",
  "Rohan", "Aryan", "Kabir", "Shaurya", "Dhruv", "Atharv", "Arnav", "Vedant", "Advait", "Rudra",
  "Priya", "Neha", "Shreya", "Pooja", "Riya", "Kavya", "Tanya", "Nisha", "Divya", "Anjali",
  "Rahul", "Amit", "Vikram", "Sanjay", "Deepak", "Manish", "Rajesh", "Suresh", "Karan", "Nikhil",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Agarwal", "Jain", "Shah", "Mehta",
  "Reddy", "Rao", "Nair", "Menon", "Iyer", "Pillai", "Naidu", "Hegde", "Shetty", "Kulkarni",
  "Mishra", "Pandey", "Tiwari", "Saxena", "Joshi", "Bhatt", "Trivedi", "Desai", "Kapoor", "Malhotra",
  "Das", "Mukherjee", "Banerjee", "Chatterjee", "Sen", "Roy", "Bose", "Ghosh", "Chakraborty", "Dutta",
];

const BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Data Science and AI",
  "Computer Science (AI/ML)",
];

const SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Angular", "Vue.js", "Node.js", "Express.js", "Next.js",
  "Django", "Flask", "Spring Boot", "FastAPI",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Data Structures", "Algorithms", "System Design",
  "Git", "CI/CD", "DevOps", "Agile", "Scrum",
];

const LAUNCHPAD_POSTS = [
  {
    title: "How I cracked Google's SDE Interview",
    content: "After 6 months of preparation and 2 previous rejections, I finally made it to Google! Here's my detailed preparation strategy covering DSA, system design, and behavioral rounds...",
    category: "interview_experience",
  },
  {
    title: "System Design Interview: Building a URL Shortener",
    content: "One of the most common system design questions. Let me walk you through how to design a scalable URL shortening service like bit.ly, covering everything from API design to database choices...",
    category: "system_design",
  },
  {
    title: "My Journey from Tier-3 College to Amazon",
    content: "Coming from a tier-3 college, I had to work twice as hard. Here's how I leveraged online resources, built projects, and networked my way to an offer from Amazon...",
    category: "career_journey",
  },
  {
    title: "Top 50 DSA Problems Every Fresher Should Solve",
    content: "Based on my experience and discussions with others who cracked FAANG, here's a curated list of must-do problems covering arrays, trees, graphs, and dynamic programming...",
    category: "dsa",
  },
  {
    title: "Resume Tips That Got Me 10+ Interview Calls",
    content: "Your resume is your first impression. Here are the specific changes I made that dramatically increased my callback rate, including formatting, action verbs, and quantifying impact...",
    category: "career_advice",
  },
  {
    title: "How to Negotiate Your First Salary",
    content: "Most freshers don't negotiate and leave money on the table. I negotiated a 30% higher offer at my first job. Here's exactly how to approach salary negotiation as a fresher...",
    category: "career_advice",
  },
  {
    title: "Complete Roadmap: From Zero to Full Stack Developer",
    content: "A month-by-month breakdown of how to become a job-ready full stack developer. Includes resources, projects, and milestones for HTML/CSS through to deploying production apps...",
    category: "learning_roadmap",
  },
  {
    title: "Building a Portfolio That Stands Out",
    content: "I reviewed 100+ portfolios during referrals. Here's what makes a portfolio memorable and what mistakes to avoid. Includes examples and templates...",
    category: "career_advice",
  },
  {
    title: "Off-Campus Placement Strategy That Works",
    content: "If your college placements aren't great, don't worry. Here's a systematic approach to land off-campus offers through LinkedIn, referrals, and direct applications...",
    category: "placement_tips",
  },
  {
    title: "Understanding Time Complexity: A Visual Guide",
    content: "Many struggle with Big O notation. This visual guide with code examples makes it easy to understand and remember different time complexities...",
    category: "dsa",
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedCompanies() {
  console.log("Seeding companies...");

  for (const company of COMPANIES) {
    const slug = company.short.toLowerCase().replace(/\s+/g, "-");

    // Create company user
    const hashedPassword = await bcrypt.hash("Demo@123", 12);
    const user = await prisma.user.upsert({
      where: { email: `hr@${slug}.demo` },
      create: {
        email: `hr@${slug}.demo`,
        passwordHash: hashedPassword,
        userType: "COMPANY",
        emailVerified: new Date(),
      },
      update: {},
    });

    // Create company profile
    await prisma.companyProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        companyName: company.name,
        industry: company.domain,
        companySize: company.size,
        headquarters: `${company.city}, India`,
        website: `https://www.${slug}.com`,
        description: `${company.name} is a leading ${company.domain} company headquartered in ${company.city}.`,
        isVerified: true,
      },
      update: {},
    });

    // Create some job opportunities
    const roles = ["Software Development Engineer", "Full Stack Developer", "Backend Engineer", "Frontend Engineer", "Data Engineer"];
    const randomRoles = roles.sort(() => Math.random() - 0.5).slice(0, 2);

    for (const role of randomRoles) {
      const salary = Math.floor(company.minSalary + Math.random() * (company.maxSalary - company.minSalary));

      await prisma.opportunity.upsert({
        where: {
          id: `${slug}-${role.toLowerCase().replace(/\s+/g, "-")}`,
        },
        create: {
          id: `${slug}-${role.toLowerCase().replace(/\s+/g, "-")}`,
          companyId: user.id,
          title: role,
          description: `Join ${company.name} as a ${role}. Work on cutting-edge technology in a dynamic environment.`,
          type: "FULL_TIME",
          salaryMin: salary * 100000,
          salaryMax: (salary + 2) * 100000,
          location: company.city,
          isRemote: Math.random() > 0.7,
          skills: SKILLS.sort(() => Math.random() - 0.5).slice(0, 5),
          experienceMin: 0,
          experienceMax: 2,
          status: "PUBLISHED",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          openings: Math.floor(5 + Math.random() * 15),
        },
        update: {},
      });
    }
  }

  console.log(`Seeded ${COMPANIES.length} companies with opportunities`);
}

async function seedColleges() {
  console.log("Seeding colleges...");

  for (const college of COLLEGES) {
    const slug = college.shortName.toLowerCase().replace(/\s+/g, "-");

    const createdCollege = await prisma.college.upsert({
      where: { id: slug },
      create: {
        id: slug,
        name: college.name,
        shortName: college.shortName,
        slug,
        city: college.city,
        state: college.state,
        type: college.type,
        overallRank: college.rank,
        engineeringRank: college.rank,
        isVerified: true,
        isActive: true,
        totalStudents: Math.floor(1000 + Math.random() * 4000),
        activeStudents: Math.floor(500 + Math.random() * 2000),
      },
      update: {},
    });

    // Create college admin user
    const hashedPassword = await bcrypt.hash("Demo@123", 12);
    const adminUser = await prisma.user.upsert({
      where: { email: `admin@${slug}.demo` },
      create: {
        email: `admin@${slug}.demo`,
        passwordHash: hashedPassword,
        userType: "COLLEGE_ADMIN",
        emailVerified: new Date(),
      },
      update: {},
    });

    // Link admin to college
    await prisma.collegeAdmin.upsert({
      where: { userId: adminUser.id },
      create: {
        userId: adminUser.id,
        collegeId: createdCollege.id,
        role: "placement_officer",
        department: "Placement Cell",
        canManageStudents: true,
        canViewAnalytics: true,
      },
      update: {},
    });
  }

  console.log(`Seeded ${COLLEGES.length} colleges with admins`);
}

async function seedStudents() {
  console.log("Seeding students...");

  const colleges = await prisma.college.findMany();
  let studentCount = 0;

  for (const college of colleges) {
    // Create 20-50 students per college
    const numStudents = 20 + Math.floor(Math.random() * 30);

    for (let i = 0; i < numStudents; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${college.slug}.demo`;

      const hashedPassword = await bcrypt.hash("Demo@123", 12);

      try {
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            userType: "STUDENT",
            emailVerified: new Date(),
          },
        });

        const graduationYear = 2024 + Math.floor(Math.random() * 3);
        const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
        const studentSkills = SKILLS.sort(() => Math.random() - 0.5).slice(0, 5 + Math.floor(Math.random() * 5));
        const xp = Math.floor(100 + Math.random() * 5000);
        const rank = Math.floor(1 + Math.random() * 50000);

        await prisma.profile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            collegeId: college.id,
            collegeName: college.name,
            branch,
            graduationYear,
            skills: studentSkills,
            totalXp: xp,
            layersRankOverall: rank,
            layersRankPercentile: Math.min(99, Math.floor(100 - (rank / 500))),
            isProfileComplete: Math.random() > 0.3,
          },
        });

        studentCount++;
      } catch {
        // Skip duplicate emails
      }
    }
  }

  console.log(`Seeded ${studentCount} students`);
}

async function seedLaunchpadPosts() {
  console.log("Seeding launchpad posts...");

  const students = await prisma.user.findMany({
    where: { userType: "STUDENT" },
    take: LAUNCHPAD_POSTS.length,
  });

  for (let i = 0; i < LAUNCHPAD_POSTS.length && i < students.length; i++) {
    const post = LAUNCHPAD_POSTS[i];
    const author = students[i];

    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);

    await prisma.launchpadPost.upsert({
      where: { slug },
      create: {
        slug,
        authorId: author.id,
        title: post.title,
        content: post.content,
        category: post.category,
        status: "PUBLISHED",
        upvotes: Math.floor(10 + Math.random() * 500),
        views: Math.floor(100 + Math.random() * 5000),
        isEditorPick: Math.random() > 0.7,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
      update: {},
    });
  }

  console.log(`Seeded ${Math.min(LAUNCHPAD_POSTS.length, students.length)} launchpad posts`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("Starting demo data seed...\n");

  await seedCompanies();
  await seedColleges();
  await seedStudents();
  await seedLaunchpadPosts();

  console.log("\nDemo data seeding complete!");
  console.log("\nDemo credentials:");
  console.log("- Company: hr@tcs.demo / Demo@123");
  console.log("- College: admin@iit-bombay.demo / Demo@123");
  console.log("- Student: [firstname].[lastname]XX@[college].demo / Demo@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
