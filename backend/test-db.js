import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing Prisma connection to MongoDB Atlas...');
  try {
    const res = await prisma.$runCommandRaw({ ping: 1 });
    console.log('SUCCESS! MongoDB Ping Response:', res);
  } catch (err) {
    console.error('ERROR Details:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
