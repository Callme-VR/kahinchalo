// Test all endpoints
const BASE_URL = "http://localhost:5000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

async function testEndpoints() {
  let cookie = "";

  console.log("=== Testing All Endpoints ===\n");

  // 1. Health Check
  console.log("1. GET /check");
  try {
    const res = await fetch(`${BASE_URL}/check`);
    const data = await res.text();
    console.log(`   Status: ${res.status}, Response: ${data}`);
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 2. Register
  console.log("\n2. POST /api/auth/register");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: "test@example.com", password: "password123" }),
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie;
      console.log(`   Cookie received: ${cookie.substring(0, 50)}...`);
    }
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 3. Login
  console.log("\n3. POST /api/auth/login");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie;
      console.log(`   Cookie received: ${cookie.substring(0, 50)}...`);
    }
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 4. Logout (protected)
  console.log("\n4. POST /api/auth/logout (protected)");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: cookie ? { "Cookie": cookie } : {},
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 5. Refresh (protected) - need to login again first
  console.log("\n5. POST /api/auth/refresh (protected) - after re-login");
  try {
    // Re-login to get fresh cookie
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });
    const loginData = await loginRes.json();
    console.log(`   Re-login Status: ${loginRes.status}`);

    const newCookie = loginRes.headers.get("set-cookie") || cookie;

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: newCookie ? { "Cookie": newCookie } : {},
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 6. Send OTP
  console.log("\n6. POST /api/auth/otp/send");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaarOrMobile: "9876543210" }),
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    // Store OTP for verification test
    global.lastOtp = data.otp;
    global.lastAadhaar = data.aadhaarOrMobile;
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  // 7. Verify OTP
  console.log("\n7. POST /api/auth/otp/verify");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaarOrMobile: global.lastAadhaar || "9876543210", otp: global.lastOtp || "000000" }),
    });
    const data: any = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  } catch (e) {
    console.log(`   ERROR: ${e}`);
  }

  console.log("\n=== All Tests Complete ===");
}

testEndpoints();
