import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;

console.log('=== NATIVE MONGODB TEST START ===');

if (!uri) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 5000,
});

try {
  console.log('Connecting with native MongoDB driver...');

  await client.connect();

  console.log('=== NATIVE MONGODB CONNECTED ===');

  const adminDb = client.db('admin');

  const result = await adminDb.command({
    hello: 1,
  });

  console.log('=== MONGODB HELLO RESULT ===');
  console.log({
    isWritablePrimary: result.isWritablePrimary,
    secondary: result.secondary,
    setName: result.setName,
    hosts: result.hosts,
    primary: result.primary,
  });

  console.log('=== NATIVE MONGODB TEST SUCCESS ===');
} catch (error) {
  console.error('=== NATIVE MONGODB TEST FAILED ===');
  console.error('Message:', error?.message);
  console.error('Name:', error?.name);
  console.error('Code:', error?.code);
  console.error('Full error:', error);
} finally {
  await client.close().catch(() => {});
}
