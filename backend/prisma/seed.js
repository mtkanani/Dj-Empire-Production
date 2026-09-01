import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@eventbooking.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminPassword123!';

  console.log('🌱 Starting Database Seeding...');

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const superAdmin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'SuperAdmin',
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    console.log('✅ Super Admin account configured successfully!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Status: ${superAdmin.status}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
