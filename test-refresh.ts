// Debug refresh endpoint
const BASE_URL = "http://localhost:5000";

async function testRefresh() {
  // First login
  console.log("1. Logging in...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123" }),
  });
  console.log(`   Login Status: ${loginRes.status}`);

  // Get cookie from login response
  const setCookie = loginRes.headers.get("set-cookie");
  console.log(`   Set-Cookie Header: ${setCookie || "NOT FOUND"}`);

  if (!setCookie) {
    console.log("   ERROR: No cookie received from login!");
    return;
  }

  // Test refresh with cookie
  console.log("\n2. Testing refresh with cookie...");
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Cookie": setCookie },
  });

  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
}

testRefresh().catch(console.error);
