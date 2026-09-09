/**
 * One-off backfill: copy existing BMS-* booking numbers into legacyBookingNumber
 * and reissue DJE-* references. Staff lookup searches both fields.
 *
 * Usage (from backend/):
 *   node prisma/backfill-booking-numbers.js
 *
 * Do not run this against production until you have an Atlas snapshot.
 */
import { PrismaClient } from '@prisma/client';
import { generateBookingNumber } from '../src/modules/booking/utils/bookingNumberGenerator.util.js';

const prisma = new PrismaClient();

async function uniqueDjeNumber() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = generateBookingNumber();
    const exists = await prisma.booking.findFirst({ where: { bookingNumber: candidate } });
    if (!exists) return candidate;
  }
  throw new Error('Could not generate a unique DJE booking number');
}

async function run() {
  const bookings = await prisma.booking.findMany({
    where: { bookingNumber: { startsWith: 'BMS-' } },
    select: { id: true, bookingNumber: true, legacyBookingNumber: true },
  });

  console.log(`Found ${bookings.length} BMS- booking(s) to reissue.`);

  let updated = 0;
  for (const booking of bookings) {
    const nextNumber = await uniqueDjeNumber();
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        legacyBookingNumber: booking.legacyBookingNumber || booking.bookingNumber,
        bookingNumber: nextNumber,
      },
    });
    updated += 1;
    console.log(`${booking.bookingNumber} -> ${nextNumber}`);
  }

  console.log(`Updated ${updated} booking(s).`);
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
