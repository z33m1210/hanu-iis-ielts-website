const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adjusting lastActive timestamps to simulate offline users...');
  
  // Set all users to be offline (last active 1 hour ago)
  const oneHourAgo = new Date(Date.now() - 3600000);
  
  const result = await prisma.user.updateMany({
    data: {
      lastActive: oneHourAgo
    }
  });
  
  console.log(`Updated ${result.count} users to be offline.`);
  
  // Optional: Set the first Admin to be online
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { lastActive: new Date() }
    });
    console.log(`Set admin ${admin.email} to be online.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
