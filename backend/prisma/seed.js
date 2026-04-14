const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const coursesData = [
    {
        title: "IELTS Writing Task 2 Masterclass",
        author: "Sarah Mitchell",
        rating: 4.9, ratingCount: 3450,
        hours: 30, lectures: 210, level: "All Levels",
        price: 129.9, originalPrice: 259.9,
        chapters: 20, category: "writing",
        description: "Master IELTS Writing Task 2 with proven essay frameworks, band-descriptor analysis, and 50+ model answers.",
        instructorTitle: "Former IELTS Examiner & Writing Coach",
        instructorBio: "Sarah Mitchell is a former British Council IELTS examiner who has assessed over 15,000 test papers.",
        instructorReviews: "18,200", instructorStudents: "28,400", instructorCourses: "7"
    },
    {
        title: "IELTS Writing Task 1 – Graphs & Charts",
        author: "Sarah Mitchell",
        rating: 4.8, ratingCount: 2100,
        hours: 18, lectures: 130, level: "Intermediate",
        price: 99.9, originalPrice: 199.9,
        chapters: 14, category: "writing",
        description: "Learn to describe bar charts, line graphs, pie charts, maps, and process diagrams with accuracy and clarity."
    },
    {
        title: "IELTS Academic Writing Band 7+ Guide",
        author: "Emily Nguyen",
        rating: 4.7, ratingCount: 1800,
        hours: 22, lectures: 160, level: "Intermediate",
        price: 109.9, originalPrice: 219.9,
        chapters: 17, category: "writing",
        description: "A comprehensive guide to achieving Band 7 or above in IELTS Academic Writing.",
        instructorTitle: "Academic IELTS Trainer",
        instructorBio: "Emily Nguyen holds a Masters in Applied Linguistics from the University of Melbourne.",
        instructorReviews: "12,500", instructorStudents: "18,700", instructorCourses: "5"
    },
    {
        title: "IELTS Speaking Band 7+ Blueprint",
        author: "James Whitfield",
        rating: 4.8, ratingCount: 2810,
        hours: 18, lectures: 140, level: "Intermediate",
        price: 109.9, originalPrice: 219.9,
        chapters: 16, category: "speaking",
        description: "Build unstoppable confidence for the IELTS Speaking test.",
        instructorTitle: "IELTS Speaking Coach & Accent Trainer",
        instructorBio: "James Whitfield is a British-born IELTS coach based in Hanoi with over 12 years of experience.",
        instructorReviews: "9,800", instructorStudents: "9,300", instructorCourses: "4"
    },
    {
        title: "IELTS Speaking Part 2 Cue Cards Bootcamp",
        author: "James Whitfield",
        rating: 4.7, ratingCount: 1560,
        hours: 12, lectures: 95, level: "Beginner",
        price: 79.9, originalPrice: 159.9,
        chapters: 10, category: "speaking",
        description: "Master 60+ IELTS Speaking Part 2 cue cards with answer templates."
    },
    {
        title: "Fluent English for IELTS Speaking",
        author: "Anna Petrova",
        rating: 4.6, ratingCount: 1200,
        hours: 15, lectures: 110, level: "All Levels",
        price: 89.9, originalPrice: 179.9,
        chapters: 12, category: "speaking",
        description: "Develop natural, flowing English speech for the IELTS Speaking test.",
        instructorTitle: "IELTS Listening & Speaking Trainer",
        instructorBio: "Anna Petrova is a CELTA-qualified EFL teacher from St Petersburg.",
        instructorReviews: "6,200", instructorStudents: "5,900", instructorCourses: "3"
    },
    {
        title: "IELTS Reading Speed & Strategies",
        author: "David Chen",
        rating: 4.7, ratingCount: 1980,
        hours: 12, lectures: 95, level: "Beginner",
        price: 89.9, originalPrice: 179.9,
        chapters: 11, category: "reading",
        description: "Overcome slow reading speed and question confusion with tactical strategies.",
        instructorTitle: "IELTS Reading & Vocabulary Specialist",
        instructorBio: "David Chen holds a PhD in English Linguistics from National Taiwan University.",
        instructorReviews: "7,800", instructorStudents: "7,100", instructorCourses: "4"
    },
    {
        title: "IELTS Reading: True/False/Not Given Drills",
        author: "David Chen",
        rating: 4.6, ratingCount: 1340,
        hours: 10, lectures: 80, level: "Intermediate",
        price: 69.9, originalPrice: 139.9,
        chapters: 9, category: "reading",
        description: "The most-feared IELTS question type — demystified."
    },
    {
        title: "Academic Reading Comprehension for IELTS",
        author: "Emily Nguyen",
        rating: 4.8, ratingCount: 2200,
        hours: 16, lectures: 120, level: "Intermediate",
        price: 99.9, originalPrice: 199.9,
        chapters: 13, category: "reading",
        description: "Build deep comprehension skills for dense academic texts."
    },
    {
        title: "IELTS Listening: Sections 1–4 Full Prep",
        author: "Anna Petrova",
        rating: 4.8, ratingCount: 2600,
        hours: 14, lectures: 105, level: "All Levels",
        price: 94.9, originalPrice: 189.9,
        chapters: 12, category: "listening",
        description: "Comprehensive IELTS Listening preparation covering all four sections."
    },
    {
        title: "IELTS Listening Shortcuts & Note-Taking",
        author: "Anna Petrova",
        rating: 4.7, ratingCount: 1450,
        hours: 10, lectures: 78, level: "Beginner",
        price: 69.9, originalPrice: 139.9,
        chapters: 9, category: "listening",
        description: "Learn the fastest note-taking and prediction techniques for IELTS Listening."
    },
    {
        title: "Accent Training for IELTS Listening",
        author: "James Whitfield",
        rating: 4.6, ratingCount: 980,
        hours: 8, lectures: 60, level: "Beginner",
        price: 49.9, originalPrice: 99.9,
        chapters: 7, category: "listening",
        description: "Train your ear to understand various accents in the IELTS test."
    },
    {
        title: "Complete IELTS Academic Prep – Band 7+",
        author: "Emily Nguyen",
        rating: 4.9, ratingCount: 4200,
        hours: 45, lectures: 320, level: "All Levels",
        price: 189.9, originalPrice: 379.9,
        chapters: 30, category: "full",
        description: "The most complete IELTS Academic preparation course on BandPath."
    },
    {
        title: "IELTS General Training Full Course",
        author: "Sarah Mitchell",
        rating: 4.8, ratingCount: 3100,
        hours: 40, lectures: 280, level: "All Levels",
        price: 169.9, originalPrice: 339.9,
        chapters: 26, category: "full",
        description: "Complete IELTS General Training preparation for immigration."
    },
    {
        title: "IELTS Band 6.5 to Band 8 Accelerator",
        author: "David Chen",
        rating: 4.7, ratingCount: 2400,
        hours: 35, lectures: 240, level: "Advanced",
        price: 159.9, originalPrice: 319.9,
        chapters: 24, category: "full",
        description: "An advanced accelerator programme for high-band candidates."
    }
];

async function main() {
  console.log('Seeding database...');

  // 0. Clean database
  await prisma.enrollment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.course.deleteMany({});
  console.log('🗑️ Database cleared.');

  // 1. Create Admins & Students
  const adminEmail = 'admin';
  const hashedAdminPassword = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin account created: admin / 123456');

  // 2. Create Instructors (Teachers)
  // Extract unique authors and map to teacher objects
  const authors = [...new Set(coursesData.map(c => c.author))];
  const teacherMap = {};

  for (const authorName of authors) {
    const email = authorName.toLowerCase().replace(/\s/g, '.') + '@bandpath.edu';
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    // Find metadata for this instructor from the first course they are mentioned in
    const meta = coursesData.find(c => c.author === authorName);

    const teacher = await prisma.user.upsert({
      where: { email },
      update: {
        title: meta.instructorTitle,
        bio: meta.instructorBio,
        instructorReviews: meta.instructorReviews,
        instructorStudents: meta.instructorStudents,
        instructorCourses: meta.instructorCourses,
      },
      create: {
        email,
        password: hashedPassword,
        name: authorName,
        role: 'TEACHER',
        title: meta.instructorTitle,
        bio: meta.instructorBio,
        instructorReviews: meta.instructorReviews,
        instructorStudents: meta.instructorStudents,
        instructorCourses: meta.instructorCourses,
      },
    });
    teacherMap[authorName] = teacher.id;
    console.log(`✅ Teacher created: ${authorName} (${email})`);
  }

  // 3. Create Courses
  for (const c of coursesData) {
    await prisma.course.create({
      data: {
        title: c.title,
        description: c.description,
        price: c.price,
        originalPrice: c.originalPrice,
        rating: c.rating,
        ratingCount: c.ratingCount,
        hours: c.hours,
        lectures: c.lectures,
        level: c.level,
        category: c.category,
        chapters: c.chapters,
        teacherId: teacherMap[c.author],
        isPublished: true,
      }
    });
  }
  console.log(`✅ ${coursesData.length} courses created.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
