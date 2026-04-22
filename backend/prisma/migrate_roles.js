const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function downgrade() {
  try {
    const res = await prisma.user.updateMany({
      where: { role: 'TEACHER' },
      data: { role: 'USER' }
    });
    console.log(`Downgraded ${res.count} TEACHER accounts to USER.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

downgrade();
