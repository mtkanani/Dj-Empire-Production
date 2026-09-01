import { prisma } from './src/config/prisma.js';

async function main() {
  console.log('=== MongoDB Connection Diagnostic ===');
  console.log('Prisma DATABASE_URL:', process.env.DATABASE_URL);

  try {
    console.log('1. Attempting $runCommandRaw ping...');
    const result = await prisma.$runCommandRaw({ ping: 1 });
    console.log('✅ $runCommandRaw SUCCESS:', result);
  } catch (err1) {
    console.error('❌ $runCommandRaw FAILED:', err1.message);
  }

  try {
    console.log('2. Attempting systemHealth.findFirst()...');
    const healthRecord = await prisma.systemHealth.findFirst();
    console.log('✅ systemHealth.findFirst() SUCCESS:', healthRecord);
  } catch (err2) {
    console.error('❌ systemHealth.findFirst() FAILED:', err2.message);
  }

  await prisma.$disconnect();
}

main();
