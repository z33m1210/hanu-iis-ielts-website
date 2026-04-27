const prisma = require('../src/models/prismaClient');

module.exports = async () => {
  await prisma.$disconnect();
};
