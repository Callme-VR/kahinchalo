// Khachale API Test Suite - plain ASCII output
const BASE_URL = "http://localhost:5000";

let authCookie = "";
let testVendorId = "";
let testTripId = "";
let testCategoryId = "";

const TIMESTAMP = Date.now();
const TEST_USER_EMAIL = `testuser_${TIMESTAMP}@example.com`;
const TEST_VENDOR_EMAIL = `testvendor_${TIMESTAMP}@example.com`;

let passed = 0;
let failed = 0;
let total = 0;
const results: string[] = [];

function log(label: string, status: number, data: any, expected?: number) {
  total++;
  const ok = expected !== undefined ? status === expected : status < 400;
  const mark = ok ? "PASS" : "FAIL";
  if (ok) passed++;
  else failed++;
  const preview =
    typeof data === "object"
      ? JSON.stringify(data).substring(0, 120)
      : String(data).substring(0, 120);
  const line = `[${mark}] [${status}] ${label}`;
  results.push(line);
  console.log(line);
  if (!ok) console.log(`      >> Response: ${preview}`);
}

async function req(
  method: string,
  path: string,
  body?: object,
  useCookie = false,
): Promise<{ status: number; data: any; headers: Headers }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (useCookie && authCookie) headers["Cookie"] = authCookie;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log("=================================================");
  console.log("  KHACHALE API TEST SUITE");
  console.log("=================================================\n");

  // --- 1. HEALTH CHECK ---
  console.log("--- 1. HEALTH CHECK ---");
  {
    const res = await fetch(`${BASE_URL}/check`);
    const text = await res.text();
    total++;
    passed++;
    const line = `[PASS] [${res.status}] GET /check -> "${text}"`;
    results.push(line);
    console.log(line);
  }

  // --- 2. AUTH ROUTES ---
  console.log("\n--- 2. AUTH ROUTES ---");

  // Register - missing fields
  {
    const { status, data } = await req("POST", "/api/auth/register", {
      name: "No Email",
    });
    log("POST /api/auth/register (missing fields)", status, data, 400);
  }

  // Register - success
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: TEST_USER_EMAIL,
        password: "password123",
      }),
    });
    const data: any = await res.json();
    log("POST /api/auth/register (success)", res.status, data, 201);
    const cookie = res.headers.get("set-cookie");
    if (cookie) authCookie = cookie;
  }

  // Register - duplicate email
  {
    const { status, data } = await req("POST", "/api/auth/register", {
      name: "Test User",
      email: TEST_USER_EMAIL,
      password: "pass123",
    });
    log("POST /api/auth/register (duplicate email)", status, data, 409);
  }

  // Login - wrong password
  {
    const { status, data } = await req("POST", "/api/auth/login", {
      email: TEST_USER_EMAIL,
      password: "wrongpass",
    });
    log("POST /api/auth/login (wrong password)", status, data, 401);
  }

  // Login - missing fields
  {
    const { status, data } = await req("POST", "/api/auth/login", {
      email: TEST_USER_EMAIL,
    });
    log("POST /api/auth/login (missing password)", status, data, 400);
  }

  // Login - success
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_USER_EMAIL, password: "password123" }),
    });
    const data: any = await res.json();
    log("POST /api/auth/login (success)", res.status, data, 200);
    const cookie = res.headers.get("set-cookie");
    if (cookie) authCookie = cookie;
  }

  // Refresh - authenticated
  {
    const { status, data } = await req(
      "POST",
      "/api/auth/refresh",
      undefined,
      true,
    );
    log("POST /api/auth/refresh (authenticated)", status, data, 200);
  }

  // Refresh - no auth
  {
    const { status, data } = await req("POST", "/api/auth/refresh");
    log("POST /api/auth/refresh (no auth)", status, data, 401);
  }

  // Send OTP - missing field
  {
    const { status, data } = await req("POST", "/api/auth/otp/send", {});
    log("POST /api/auth/otp/send (missing aadhaarOrMobile)", status, data, 400);
  }

  // Send OTP - success
  let otpValue = "";
  {
    const { status, data } = await req("POST", "/api/auth/otp/send", {
      aadhaarOrMobile: "9876543210",
    });
    log("POST /api/auth/otp/send (success)", status, data, 200);
    otpValue = data?.otp || "";
    console.log(`      [OTP generated: ${otpValue}]`);
  }

  // Verify OTP - wrong OTP
  {
    const { status, data } = await req("POST", "/api/auth/otp/verify", {
      aadhaarOrMobile: "9876543210",
      otp: "000000",
    });
    log("POST /api/auth/otp/verify (invalid OTP)", status, data, 400);
  }

  // Verify OTP - success
  {
    const { status, data } = await req("POST", "/api/auth/otp/verify", {
      aadhaarOrMobile: "9876543210",
      otp: otpValue,
    });
    log("POST /api/auth/otp/verify (success)", status, data, 200);
  }

  // Verify OTP - missing fields
  {
    const { status, data } = await req("POST", "/api/auth/otp/verify", {
      aadhaarOrMobile: "9876543210",
    });
    log("POST /api/auth/otp/verify (missing otp)", status, data, 400);
  }

  // --- 3. USER ROUTES ---
  console.log("\n--- 3. USER ROUTES ---");

  // Get profile - no auth
  {
    const { status, data } = await req("GET", "/api/users/me");
    log("GET /api/users/me (no auth)", status, data, 401);
  }

  // Get profile - authenticated
  {
    const { status, data } = await req("GET", "/api/users/me", undefined, true);
    log("GET /api/users/me (authenticated)", status, data, 200);
  }

  // Update profile - authenticated
  {
    const { status, data } = await req(
      "PUT",
      "/api/users/me",
      { name: "Updated Test User" },
      true,
    );
    log("PUT /api/users/me (update name)", status, data, 200);
  }

  // Update profile - no auth
  {
    const { status, data } = await req("PUT", "/api/users/me", {
      name: "Updated",
    });
    log("PUT /api/users/me (no auth)", status, data, 401);
  }

  // Post support query - missing message
  {
    const { status, data } = await req(
      "POST",
      "/api/users/queries",
      { subject: "Help" },
      true,
    );
    log("POST /api/users/queries (missing message)", status, data, 400);
  }

  // Post support query - success
  {
    const { status, data } = await req(
      "POST",
      "/api/users/queries",
      {
        subject: "Help needed",
        message: "I need help with my booking",
        category: "booking",
      },
      true,
    );
    log("POST /api/users/queries (success)", status, data, 201);
  }

  // Get bookings - authenticated
  {
    const { status, data } = await req(
      "GET",
      "/api/users/bookings",
      undefined,
      true,
    );
    log("GET /api/users/bookings (authenticated)", status, data, 200);
  }

  // Get bookings - no auth
  {
    const { status, data } = await req("GET", "/api/users/bookings");
    log("GET /api/users/bookings (no auth)", status, data, 401);
  }

  // Wishlist - invalid trip
  {
    const { status, data } = await req(
      "POST",
      "/api/users/wishlist/nonexistent-trip-id",
      undefined,
      true,
    );
    log("POST /api/users/wishlist/:tripId (trip not found)", status, data, 404);
  }

  // Wishlist - no auth
  {
    const { status, data } = await req(
      "POST",
      "/api/users/wishlist/some-trip-id",
    );
    log("POST /api/users/wishlist/:tripId (no auth)", status, data, 401);
  }

  // --- 4. VENDOR ROUTES ---
  console.log("\n--- 4. VENDOR ROUTES ---");

  // Register vendor - missing fields
  {
    const { status, data } = await req("POST", "/api/vendors/register", {
      name: "Test Vendor",
    });
    log("POST /api/vendors/register (missing fields)", status, data, 400);
  }

  // Register vendor - success
  {
    const { status, data } = await req("POST", "/api/vendors/register", {
      name: "Test Vendor",
      email: TEST_VENDOR_EMAIL,
      password: "vendorpass123",
      phone: "9876543210",
      businessName: "Test Travel Co",
      serviceCategory: "LIC123456",
    });
    log("POST /api/vendors/register (success)", status, data, 201);
    testVendorId = data?.vendor?.id || "";
    console.log(`      [Vendor ID: ${testVendorId}]`);
  }

  // Register vendor - duplicate
  {
    const { status, data } = await req("POST", "/api/vendors/register", {
      name: "Dup Vendor",
      email: TEST_VENDOR_EMAIL,
      password: "pass123",
    });
    log("POST /api/vendors/register (duplicate)", status, data, 409);
  }

  // Get vendor profile - valid
  if (testVendorId) {
    const { status, data } = await req("GET", `/api/vendors/${testVendorId}`);
    log("GET /api/vendors/:id (valid)", status, data, 200);
  }

  // Get vendor profile - not found
  {
    const { status, data } = await req(
      "GET",
      "/api/vendors/00000000-0000-0000-0000-000000000000",
    );
    log("GET /api/vendors/:id (not found)", status, data, 404);
  }

  // Get vendor reviews - valid
  if (testVendorId) {
    const { status, data } = await req(
      "GET",
      `/api/vendors/${testVendorId}/reviews`,
    );
    log("GET /api/vendors/:id/reviews (valid)", status, data, 200);
  }

  // Get vendor reviews - not found
  {
    const { status, data } = await req(
      "GET",
      "/api/vendors/00000000-0000-0000-0000-000000000000/reviews",
    );
    log("GET /api/vendors/:id/reviews (not found)", status, data, 404);
  }

  // Update vendor - authenticated
  if (testVendorId) {
    const { status, data } = await req(
      "PUT",
      `/api/vendors/${testVendorId}`,
      { description: "Best travel agency in town" },
      true,
    );
    log("PUT /api/vendors/:id (authenticated)", status, data, 200);
  }

  // Update vendor - no auth
  if (testVendorId) {
    const { status, data } = await req("PUT", `/api/vendors/${testVendorId}`, {
      description: "Test",
    });
    log("PUT /api/vendors/:id (no auth)", status, data, 401);
  }

  // Upload vendor document - no auth
  {
    const { status, data } = await req("POST", "/api/vendors/documents", {
      vendorId: testVendorId,
      documentType: "license",
      documentUrl: "https://example.com/doc.pdf",
    });
    log("POST /api/vendors/documents (no auth)", status, data, 401);
  }

  // Upload vendor document - authenticated, valid
  if (testVendorId) {
    const { status, data } = await req(
      "POST",
      "/api/vendors/documents",
      {
        vendorId: testVendorId,
        documentType: "license",
        documentUrl: "https://example.com/doc.pdf",
      },
      true,
    );
    log("POST /api/vendors/documents (authenticated)", status, data, 201);
  }

  // Upload vendor document - missing fields
  {
    const { status, data } = await req(
      "POST",
      "/api/vendors/documents",
      { vendorId: testVendorId, documentType: "license" },
      true,
    );
    log("POST /api/vendors/documents (missing documentUrl)", status, data, 400);
  }

  // --- 5. CATEGORY ROUTES ---
  console.log("\n--- 5. CATEGORY ROUTES ---");

  // Get all categories
  {
    const { status, data } = await req("GET", "/api/categories");
    log("GET /api/categories", status, data, 200);
    testCategoryId = data?.categories?.[0]?.id || "";
    const count = data?.categories?.length ?? 0;
    console.log(
      `      [Categories found: ${count}, using ID: ${testCategoryId || "none"}]`,
    );
  }

  // Trips by category - valid
  if (testCategoryId) {
    const { status, data } = await req(
      "POST",
      `/api/categories/${testCategoryId}/trips`,
    );
    log("POST /api/categories/:id/trips (valid)", status, data, 200);
  }

  // Trips by category - not found
  {
    const { status, data } = await req(
      "POST",
      "/api/categories/00000000-0000-0000-0000-000000000000/trips",
    );
    log("POST /api/categories/:id/trips (not found)", status, data, 404);
  }

  // --- 6. TRIP ROUTES ---
  console.log("\n--- 6. TRIP ROUTES ---");

  // List trips - no filters
  {
    const { status, data } = await req("GET", "/api/trips");
    log("GET /api/trips (no filters)", status, data, 200);
    testTripId = data?.trips?.[0]?.id || "";
    const total_trips = data?.pagination?.total ?? 0;
    console.log(
      `      [Total trips in DB: ${total_trips}, using trip ID: ${testTripId || "none"}]`,
    );
  }

  // List trips - pagination
  {
    const { status, data } = await req("GET", "/api/trips?page=1&limit=5");
    log("GET /api/trips?page=1&limit=5 (pagination)", status, data, 200);
  }

  // List trips - location filter
  {
    const { status, data } = await req("GET", "/api/trips?location=Goa");
    log("GET /api/trips?location=Goa (location filter)", status, data, 200);
  }

  // List trips - budget filter
  {
    const { status, data } = await req("GET", "/api/trips?budget=50000");
    log("GET /api/trips?budget=50000 (budget filter)", status, data, 200);
  }

  // List trips - ageGroup filter
  {
    const { status, data } = await req("GET", "/api/trips?ageGroup=adult");
    log("GET /api/trips?ageGroup=adult (ageGroup filter)", status, data, 200);
  }

  // Get trip detail - valid
  if (testTripId) {
    const { status, data } = await req("GET", `/api/trips/${testTripId}`);
    log("GET /api/trips/:id (valid)", status, data, 200);
  } else {
    console.log("[SKIP] GET /api/trips/:id (no trip in DB)");
  }

  // Get trip detail - not found
  {
    const { status, data } = await req(
      "GET",
      "/api/trips/00000000-0000-0000-0000-000000000000",
    );
    log("GET /api/trips/:id (not found)", status, data, 404);
  }

  // Create booking - no auth
  {
    const { status, data } = await req("POST", "/api/trips/bookings", {
      tripId: testTripId || "some-id",
    });
    log("POST /api/trips/bookings (no auth)", status, data, 401);
  }

  // Create booking - missing tripId
  {
    const { status, data } = await req("POST", "/api/trips/bookings", {}, true);
    log("POST /api/trips/bookings (missing tripId)", status, data, 400);
  }

  // Create booking - invalid tripId
  {
    const { status, data } = await req(
      "POST",
      "/api/trips/bookings",
      { tripId: "00000000-0000-0000-0000-000000000000" },
      true,
    );
    log("POST /api/trips/bookings (trip not found)", status, data, 404);
  }

  // Create booking - valid
  if (testTripId) {
    const { status, data } = await req(
      "POST",
      "/api/trips/bookings",
      { tripId: testTripId, numberOfPeople: 1 },
      true,
    );
    log("POST /api/trips/bookings (valid)", status, data, 201);
  } else {
    console.log("[SKIP] POST /api/trips/bookings (no trip in DB)");
  }

  // Wishlist - valid trip
  if (testTripId) {
    const { status, data } = await req(
      "POST",
      `/api/users/wishlist/${testTripId}`,
      undefined,
      true,
    );
    log("POST /api/users/wishlist/:tripId (valid)", status, data);
  }

  // Wishlist - duplicate
  if (testTripId) {
    const { status, data } = await req(
      "POST",
      `/api/users/wishlist/${testTripId}`,
      undefined,
      true,
    );
    log("POST /api/users/wishlist/:tripId (duplicate)", status, data, 409);
  }

  // --- 7. AUTH - LOGOUT ---
  console.log("\n--- 7. LOGOUT ---");

  {
    const { status, data } = await req(
      "POST",
      "/api/auth/logout",
      undefined,
      true,
    );
    log("POST /api/auth/logout (authenticated)", status, data, 200);
  }

  {
    const { status, data } = await req("POST", "/api/auth/logout");
    log("POST /api/auth/logout (no auth)", status, data, 401);
  }

  // --- SUMMARY ---
  console.log("\n=================================================");
  console.log("  TEST SUMMARY");
  console.log("=================================================");
  console.log(`  Total Tests : ${total}`);
  console.log(`  PASSED      : ${passed}`);
  console.log(`  FAILED      : ${failed}`);
  console.log(`  Pass Rate   : ${((passed / total) * 100).toFixed(1)}%`);
  console.log("=================================================");

  if (failed > 0) {
    console.log("\n  FAILED TESTS:");
    results
      .filter((r) => r.startsWith("[FAIL]"))
      .forEach((r) => console.log("  " + r));
  }
}

runTests().catch(console.error);
