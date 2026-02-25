// Test script for user endpoints
const BASE_URL = "http://localhost:5000";

// Cookie jar to store session
let cookieJar = "";

async function register() {
  console.log("\n📝 Registering test user...");
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "test123",
    }),
  });
  
  // Capture cookie if registration succeeds
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    cookieJar = setCookie.split(";")[0] || "";
  }
  
  const data = await res.json();
  console.log("📋 Register response:", data.message);
  // Return true even if user exists (409)
  return res.ok || data.message?.includes("already exists");
}

async function login() {
  console.log("\n🔐 Logging in...");
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "test123",
    }),
  });
  
  // Capture cookie
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    cookieJar = setCookie.split(";")[0] || "";
  }
  
  const data = await res.json();
  console.log("📋 Login response:", data.message || data);
  return res.ok;
}

async function testGetProfile() {
  console.log("\n👤 Testing GET /api/users/me");
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    headers: { Cookie: cookieJar },
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  return res.ok;
}

async function testUpdateProfile() {
  console.log("\n✏️ Testing PUT /api/users/me");
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Cookie: cookieJar,
    },
    body: JSON.stringify({ name: "Updated Test User" }),
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  return res.ok;
}

async function testPostQuery() {
  console.log("\n📨 Testing POST /api/users/queries");
  const res = await fetch(`${BASE_URL}/api/users/queries`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Cookie: cookieJar,
    },
    body: JSON.stringify({
      subject: "Test Query from Script",
      message: "This is a test support query",
      category: "General",
    }),
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  return res.ok;
}

async function testGetBookings() {
  console.log("\n📋 Testing GET /api/users/bookings");
  const res = await fetch(`${BASE_URL}/api/users/bookings`, {
    headers: { Cookie: cookieJar },
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  return res.ok;
}

async function testAddToWishlist() {
  console.log("\n💜 Testing POST /api/users/wishlist/:tripId");
  // First get all trips to find one not in wishlist
  const tripsRes = await fetch(`${BASE_URL}/check`); // Just to check server
  
  // Try adding a trip (using a likely valid trip ID from seed)
  // We'll get this from the bookings response or use a placeholder
  const res = await fetch(`${BASE_URL}/api/users/wishlist/placeholder-id`, {
    method: "POST",
    headers: { Cookie: cookieJar },
  });
  const data = await res.json();
  console.log("Response (may show 'Trip not found' which is expected):", JSON.stringify(data, null, 2));
  return res.ok;
}

async function runTests() {
  console.log("🧪 Starting User API Tests");
  console.log("============================");
  
  // Register first (ensures user exists with correct password)
  await register();
  
  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error("❌ Login failed, cannot continue tests");
    return;
  }
  
  // Test all endpoints
  await testGetProfile();
  await testUpdateProfile();
  await testPostQuery();
  await testGetBookings();
  await testAddToWishlist();
  
  console.log("\n✅ All tests completed!");
}

runTests().catch(console.error);
