import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create test user with properly hashed password (test123)
  const hashedPassword = await bcrypt.hash("test123", 10);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });
  console.log("✅ Test user created:", testUser.id);

  // Create second test user (ak@gmail.com / akash@123)
  const hashedPassword2 = await bcrypt.hash("akash@123", 10);
  const testUser2 = await prisma.user.upsert({
    where: { email: "ak@gmail.com" },
    update: {},
    create: {
      name: "Akash User",
      email: "ak@gmail.com",
      password: hashedPassword2,
    },
  });
  console.log("✅ Second test user created:", testUser2.id);

  // Create sample vendors
  const hashedVendorPassword = await bcrypt.hash("vendor123", 10);
  const v1 = await prisma.vendor.upsert({
    where: { email: "himachal_tours@example.com" },
    update: {},
    create: {
      name: "Himachal Adventures",
      email: "himachal_tours@example.com",
      password: hashedVendorPassword,
      phone: "9876543210",
      description: "Premier tour operator for North India mountains.",
      businessName: "Mountain Peaks Co.",
      serviceCategory: "Adventure",
      isVerified: true,
      rating: 4.5,
      totalReviews: 1,
    },
  });

  const v2 = await prisma.vendor.upsert({
    where: { email: "beach_vibes@example.com" },
    update: {},
    create: {
      name: "Coastal Escapes",
      email: "beach_vibes@example.com",
      password: hashedVendorPassword,
      phone: "9876543211",
      description: "Quality beach tours and water sports in South India.",
      businessName: "Ocean Bliss Inc.",
      serviceCategory: "Leisure",
      isVerified: true,
      rating: 4.8,
      totalReviews: 1,
    },
  });
  console.log("✅ Sample vendors created.");

  // Create sample trips linked to vendors
  const tripsCount = await prisma.trip.createMany({
    data: [
      {
        title: "Manali Mountain Retreat",
        description:
          "Experience the serene beauty of Manali with snow-capped peaks and adventure sports.",
        price: 12999.99,
        location: "Manali, Himachal Pradesh",
        startDate: new Date("2026-03-15"),
        endDate: new Date("2026-03-20"),
        vendorId: v1.id,
      },
      {
        title: "Goa Beach Paradise",
        description:
          "Relax on pristine beaches and enjoy vibrant nightlife in Goa.",
        price: 8999.99,
        location: "Goa, India",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-05"),
        vendorId: v2.id,
      },
      {
        title: "Kerala Backwaters Cruise",
        description:
          "Sail through the tranquil backwaters of Kerala on a traditional houseboat.",
        price: 15999.99,
        location: "Alleppey, Kerala",
        startDate: new Date("2026-05-10"),
        endDate: new Date("2026-05-15"),
        vendorId: v2.id,
      },
      {
        title: "Rajasthan Heritage Tour",
        description: "Explore magnificent forts and palaces of Rajasthan.",
        price: 21999.99,
        location: "Jaipur, Rajasthan",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-07"),
        vendorId: v1.id,
      },
      {
        title: "Ladakh Adventure",
        description:
          "High-altitude adventure with breathtaking landscapes and monasteries.",
        price: 28999.99,
        location: "Leh, Ladakh",
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-17"),
        vendorId: v1.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Sample trips created:", tripsCount.count);

  // Get created trips for bookings
  const allTrips = await prisma.trip.findMany();

  // Create sample bookings for test user
  if (allTrips.length >= 2) {
    const bookings = await prisma.booking.createMany({
      data: [
        {
          userId: testUser.id,
          tripId: allTrips[0]!.id,
          numberOfPeople: 2,
          status: "CONFIRMED",
          totalAmount: 12999.99 * 2,
        },
        {
          userId: testUser.id,
          tripId: allTrips[1]!.id,
          numberOfPeople: 1,
          status: "PENDING",
          totalAmount: 8999.99,
        },
        {
          userId: testUser2.id,
          tripId: allTrips[2]!.id,
          numberOfPeople: 3,
          status: "CONFIRMED",
          totalAmount: 15999.99 * 3,
        },
        {
          userId: testUser2.id,
          tripId: allTrips[3]!.id,
          numberOfPeople: 4,
          status: "COMPLETED",
          totalAmount: 21999.99 * 4,
        },
      ],
    });
    console.log("✅ Sample bookings created:", bookings.count);
  }

  // Create sample support queries
  const queries = await prisma.supportQuery.createMany({
    data: [
      {
        userId: testUser.id,
        subject: "Booking modification request",
        message: "I need to change my travel dates for the Manali trip.",
        category: "Booking",
        status: "OPEN",
      },
      {
        userId: testUser.id,
        subject: "Payment issue",
        message: "My payment was deducted but booking not confirmed.",
        category: "Payment",
        status: "IN_PROGRESS",
      },
      {
        userId: testUser2.id,
        subject: "Refund request",
        message: "I want to cancel my Rajasthan trip and get a refund.",
        category: "Refund",
        status: "OPEN",
      },
      {
        userId: testUser2.id,
        subject: "Trip enquiry",
        message: "Are meals included in the Kerala backwaters package?",
        category: "General",
        status: "RESOLVED",
      },
    ],
  });
  console.log("✅ Sample support queries created:", queries.count);

  // Create sample reviews
  if (allTrips.length >= 2) {
    const reviews = await prisma.review.createMany({
      data: [
        {
          userId: testUser.id,
          tripId: allTrips[0]!.id,
          vendorId: v1.id,
          rating: 5,
          comment: "Breathtaking views and great organization!",
        },
        {
          userId: testUser2.id,
          tripId: allTrips[1]!.id,
          vendorId: v2.id,
          rating: 4,
          comment: "Loved the beaches, but the hotel was a bit far.",
        },
      ],
    });
    console.log("✅ Sample reviews created:", reviews.count);
  }

  console.log("🎉 Seeding completed!");
  console.log("\n📋 Test Credentials:");
  console.log("   Email: test@example.com");
  console.log("   Password: test123");
  console.log("\n   Email: ak@gmail.com");
  console.log("   Password: akash@123");
  console.log("\n📋 Vendor Credentials:");
  console.log("   Email: himachal_tours@example.com");
  console.log("   Password: vendor123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
