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

  // Create sample trips only (user will be created via API)
  const trips = await prisma.trip.createMany({
    data: [
      {
        title: "Manali Mountain Retreat",
        description: "Experience the serene beauty of Manali with snow-capped peaks and adventure sports.",
        price: 12999.99,
        location: "Manali, Himachal Pradesh",
        startDate: new Date("2026-03-15"),
        endDate: new Date("2026-03-20"),
      },
      {
        title: "Goa Beach Paradise",
        description: "Relax on pristine beaches and enjoy vibrant nightlife in Goa.",
        price: 8999.99,
        location: "Goa, India",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-05"),
      },
      {
        title: "Kerala Backwaters Cruise",
        description: "Sail through the tranquil backwaters of Kerala on a traditional houseboat.",
        price: 15999.99,
        location: "Alleppey, Kerala",
        startDate: new Date("2026-05-10"),
        endDate: new Date("2026-05-15"),
      },
      {
        title: "Rajasthan Heritage Tour",
        description: "Explore magnificent forts and palaces of Rajasthan.",
        price: 21999.99,
        location: "Jaipur, Rajasthan",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-07"),
      },
      {
        title: "Ladakh Adventure",
        description: "High-altitude adventure with breathtaking landscapes and monasteries.",
        price: 28999.99,
        location: "Leh, Ladakh",
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-17"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Sample trips created:", trips.count);

  console.log("🎉 Seeding completed!");
  console.log("\n📋 Test Credentials (register via API):");
  console.log("   Email: test@example.com");
  console.log("   Password: test123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
