const API_BASE = "http://localhost:5000/api";

async function runTests() {
  console.log("Starting tests for new Admin and Review APIs...");

  try {
    // 1. List Vendors
    console.log("\nTesting GET /admin/vendors...");
    const vendorsRes = await fetch(`${API_BASE}/admin/vendors`);
    console.log("Status:", vendorsRes.status);
    const vendorsData = await vendorsRes.json();
    // console.log("Message:", vendorsData.message);

    // 2. Create Vendor Category
    console.log("\nTesting POST /admin/vendor-categories...");
    const catRes = await fetch(`${API_BASE}/admin/vendor-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "TestCategory_" + Date.now(),
        description: "Test description",
      }),
    });
    console.log("Status:", catRes.status);
    const catData = await catRes.json();
    // console.log("Category ID:", catData.category?.id);

    // 3. List Queries
    console.log("\nTesting GET /admin/queries...");
    const queriesRes = await fetch(`${API_BASE}/admin/queries`);
    console.log("Status:", queriesRes.status);

    // 4. Reports
    console.log("\nTesting GET /admin/reports/revenue...");
    const revRes = await fetch(`${API_BASE}/admin/reports/revenue`);
    console.log("Status:", revRes.status);
    const revData = await revRes.json();
    // console.log("Total Revenue:", revData.report?.totalRevenue);

    console.log("\nTesting GET /admin/reports/topvendors...");
    const topRes = await fetch(`${API_BASE}/admin/reports/topvendors`);
    console.log("Status:", topRes.status);

    // 5. Reviews (User reviews category/trip)
    // Note: This might fail if tripId doesn't exist, but we can try with a fake one or use the one from listTrips
    console.log("\nTesting POST /reviews/trip/fake-id...");
    const reviewRes = await fetch(`${API_BASE}/reviews/trip/fake-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        comment: "Great trip!",
      }),
    });
    console.log("Status:", reviewRes.status); // Expect 401 Unauth or 404/500 if unauth middleware is not there
    // Actually our controller checks for user

    console.log("\nAll smoke tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests();
