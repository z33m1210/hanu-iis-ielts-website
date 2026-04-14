const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add connection logging
prisma.$connect()
  .then(() => console.log('✅ Prisma connected to database'))
  .catch((err) => console.error('❌ Prisma connection error:', err));

module.exports = prisma;
