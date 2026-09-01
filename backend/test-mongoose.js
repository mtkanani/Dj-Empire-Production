import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  console.log('Testing Mongoose connection to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Mongoose SUCCESS! Connected host:', conn.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Mongoose FAILED:', err.message);
  }
}

test();
