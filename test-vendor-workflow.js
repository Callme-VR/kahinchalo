// Test script for vendor workflow
const BASE_URL = 'http://localhost:5000/api';

async function testVendorWorkflow() {
  console.log('🧪 Testing Vendor Workflow...\n');

  try {
    // 1. Register vendor
    console.log('1️⃣ Registering vendor...');
    const timestamp = Date.now();
    const vendorEmail = `testvendor${timestamp}@example.com`;
    
    const registerResponse = await fetch(`${BASE_URL}/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Vendor 2',
        email: vendorEmail,
        password: 'password123',
        businessName: 'Test Travel Co 2',
        serviceCategory: 'Adventure Tours'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ Vendor registered:', registerData.vendor.id);
    
    // 2. Login vendor
    console.log('\n2️⃣ Logging in vendor...');
    const loginResponse = await fetch(`${BASE_URL}/vendors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: vendorEmail,
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Vendor logged in');
    console.log('📝 Token:', loginData.token?.substring(0, 50) + '...');
    
    const token = loginData.token;
    
    // 3. Get vendor profile
    console.log('\n3️⃣ Getting vendor profile...');
    const profileResponse = await fetch(`${BASE_URL}/vendors/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Vendor profile fetched');
    console.log('👤 Vendor:', profileData.data?.name);
    
    // 4. Create a trip
    console.log('\n4️⃣ Creating a trip...');
    const tripResponse = await fetch(`${BASE_URL}/vendors/me/trips`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Mountain Adventure',
        description: 'An amazing mountain trekking experience',
        price: 12000,
        location: 'Manali, Himachal Pradesh',
        startDate: '2026-04-15',
        endDate: '2026-04-20',
        maxCapacity: 8,
        imageUrl: 'https://example.com/mountain.jpg'
      })
    });
    
    if (!tripResponse.ok) {
      const errorText = await tripResponse.text();
      throw new Error(`Trip creation failed: ${tripResponse.status} - ${errorText}`);
    }
    
    const tripData = await tripResponse.json();
    console.log('✅ Trip created:', tripData.trip?.id);
    
    // 5. Get vendor trips
    console.log('\n5️⃣ Getting vendor trips...');
    const tripsResponse = await fetch(`${BASE_URL}/vendors/me/trips`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!tripsResponse.ok) {
      throw new Error(`Trips fetch failed: ${tripsResponse.status}`);
    }
    
    const tripsData = await tripsResponse.json();
    console.log('✅ Vendor trips fetched');
    console.log('📊 Total trips:', tripsData.trips?.length);
    
    // 6. Get vendor bookings
    console.log('\n6️⃣ Getting vendor bookings...');
    const bookingsResponse = await fetch(`${BASE_URL}/vendors/me/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!bookingsResponse.ok) {
      throw new Error(`Bookings fetch failed: ${bookingsResponse.status}`);
    }
    
    const bookingsData = await bookingsResponse.json();
    console.log('✅ Vendor bookings fetched');
    console.log('📋 Total bookings:', bookingsData.bookings?.length);
    
    console.log('\n🎉 All vendor workflow tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVendorWorkflow();
