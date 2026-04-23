const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const id = 16; // User was using id 16 in screenshots
    const course = await prisma.course.update({
      where: { id },
      data: {
        syllabus: JSON.stringify([{ title: 'Diagnostic Lesson 1', duration: '05:00' }])
      }
    });
    console.log('Update success! New syllabus:', course.syllabus);
  } catch (err) {
    console.error('Prisma Update Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
