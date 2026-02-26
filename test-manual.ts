// Manual API testing script
// Run this with: bun run test-manual.ts

const API_BASE = "http://localhost:5000/api";

// Test data
let testVendorId: string;
let testCategoryId: string;
let testTripId: string;

async function testAPIs() {
  console.log("🚀 Starting API tests...\n");

  try {
    // Test Vendor Registration
    console.log("📝 Testing Vendor Registration...");
    const vendorResponse = await fetch(`${API_BASE}/vendors/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Vendor",
        email: `vendor${Date.now()}@test.com`,
        password: "password123",
        phone: "+1234567890",
        businessName: "Test Business",
        businessLicense: "LICENSE123",
      }),
    });

    if (vendorResponse.status === 201) {
      const vendorData = await vendorResponse.json();
      console.log("✅ Vendor registration successful");
      console.log(`   Vendor ID: ${vendorData.vendor.id}`);
      testVendorId = vendorData.vendor.id;
    } else {
      console.log("❌ Vendor registration failed:", vendorResponse.status);
      return;
    }

    // Test Get Vendor Profile
    console.log("\n👤 Testing Get Vendor Profile...");
    const profileResponse = await fetch(`${API_BASE}/vendors/${testVendorId}`);

    if (profileResponse.status === 200) {
      const profileData = await profileResponse.json();
      console.log("✅ Get vendor profile successful");
      console.log(`   Vendor Name: ${profileData.vendor.name}`);
    } else {
      console.log("❌ Get vendor profile failed:", profileResponse.status);
    }

    // Test Get Vendor Reviews
    console.log("\n⭐ Testing Get Vendor Reviews...");
    const reviewsResponse = await fetch(
      `${API_BASE}/vendors/${testVendorId}/reviews`,
    );

    if (reviewsResponse.status === 200) {
      const reviewsData = await reviewsResponse.json();
      console.log("✅ Get vendor reviews successful");
      console.log(`   Reviews count: ${reviewsData.reviews.length}`);
    } else {
      console.log("❌ Get vendor reviews failed:", reviewsResponse.status);
    }

    // Create a test category first
    console.log("\n📁 Creating test category...");
    // We'll need to create categories directly in the DB for now
    console.log(
      "   (Categories should be created via database or admin panel)",
    );

    // Test Get Categories (assuming some exist)
    console.log("\n📂 Testing Get Categories...");
    const categoriesResponse = await fetch(`${API_BASE}/categories`);

    if (categoriesResponse.status === 200) {
      const categoriesData = await categoriesResponse.json();
      console.log("✅ Get categories successful");
      console.log(`   Categories count: ${categoriesData.categories.length}`);

      if (categoriesData.categories.length > 0) {
        testCategoryId = categoriesData.categories[0].id;
      }
    } else {
      console.log("❌ Get categories failed:", categoriesResponse.status);
    }

    // Test Get Trips
    console.log("\n🏔️ Testing Get Trips...");
    const tripsResponse = await fetch(
      `${API_BASE}/trips?ageGroup=18-35&budget=500`,
    );

    if (tripsResponse.status === 200) {
      const tripsData = await tripsResponse.json();
      console.log("✅ Get trips successful");
      console.log(`   Trips count: ${tripsData.trips.length}`);
      console.log(
        `   Pagination: page ${tripsData.pagination.page} of ${tripsData.pagination.totalPages}`,
      );

      if (tripsData.trips.length > 0) {
        testTripId = tripsData.trips[0].id;
      }
    } else {
      console.log("❌ Get trips failed:", tripsResponse.status);
    }

    // Test Get Trip Details (if we have a trip)
    if (testTripId) {
      console.log("\n🔍 Testing Get Trip Details...");
      const tripDetailsResponse = await fetch(
        `${API_BASE}/trips/${testTripId}`,
      );

      if (tripDetailsResponse.status === 200) {
        const tripDetailsData = await tripDetailsResponse.json();
        console.log("✅ Get trip details successful");
        console.log(`   Trip Title: ${tripDetailsData.trip.title}`);
        console.log(`   Trip Location: ${tripDetailsData.trip.location}`);
      } else {
        console.log("❌ Get trip details failed:", tripDetailsResponse.status);
      }
    }

    // Test Get Trips by Category (if we have a category)
    if (testCategoryId) {
      console.log("\n🎯 Testing Get Trips by Category...");
      const categoryTripsResponse = await fetch(
        `${API_BASE}/categories/${testCategoryId}/trips`,
        {
          method: "POST",
        },
      );

      if (categoryTripsResponse.status === 200) {
        const categoryTripsData = await categoryTripsResponse.json();
        console.log("✅ Get trips by category successful");
        console.log(`   Trips count: ${categoryTripsData.trips.length}`);
      } else {
        console.log(
          "❌ Get trips by category failed:",
          categoryTripsResponse.status,
        );
      }
    }

    console.log("\n🎉 API testing completed!");
    console.log("\n📋 Summary of implemented APIs:");
    console.log("   ✅ POST /vendors/register - Vendor registration");
    console.log("   ✅ GET /vendors/:id - Vendor public profile");
    console.log("   ✅ GET /vendors/:id/reviews - Get vendor reviews");
    console.log("   ✅ PUT /vendors/:id - Update vendor info (requires auth)");
    console.log(
      "   ✅ POST /vendors/documents - Upload verification docs (requires auth)",
    );
    console.log("   ✅ GET /categories - List all categories");
    console.log("   ✅ POST /categories/:id/trips - Get trips by category");
    console.log("   ✅ GET /trips - List trips (with filters)");
    console.log("   ✅ GET /trips/:id - Trip details");
    console.log("   ✅ POST /trips/bookings - Create booking (requires auth)");
  } catch (error) {
    console.error("❌ Error during testing:", error);
  }
}

// Run the tests
testAPIs();
