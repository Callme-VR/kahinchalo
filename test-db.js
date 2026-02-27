import { prisma } from './src/lib/db.js';

async function testDB() {
  try {
    const count = await prisma.trip.count();
    console.log('Trips count:', count);
    
    const trips = await prisma.trip.findMany({
      take: 1,
      include: {
        category: true,
        vendor: true,
      }
    });
    console.log('Sample trip:', JSON.stringify(trips[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
