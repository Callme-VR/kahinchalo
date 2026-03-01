// Test frontend vendor login with Authorization header
const testFrontendAuthFlow = async () => {
  try {
    console.log('=== Testing Frontend Auth Flow ===');
    
    // Step 1: Login to get token (like frontend does)
    console.log('\n1. Logging in to get token...');
    const loginResponse = await fetch('http://localhost:5000/api/vendors/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: 'himachal_tours@example.com',
        password: 'vendor123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, got token');

    // Step 2: Use Authorization header with token (like frontend does)
    console.log('\n2. Testing profile API with Authorization header...');
    const profileResponse = await fetch('http://localhost:5000/api/vendors/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': 'http://localhost:5173',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Profile API status:', profileResponse.status);
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('✅ Profile API successful with Authorization header');
      console.log('Profile data:', profileData);
    } else {
      console.log('❌ Profile API failed with Authorization header:', profileData.message);
    }

    // Step 3: Test trips API
    console.log('\n3. Testing trips API with Authorization header...');
    const tripsResponse = await fetch('http://localhost:5000/api/vendors/me/trips', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': 'http://localhost:5173',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Trips API status:', tripsResponse.status);
    const tripsData = await tripsResponse.json();
    
    if (tripsResponse.ok) {
      console.log('✅ Trips API successful with Authorization header');
      console.log('Trips count:', tripsData.data?.length || tripsData.trips?.length || 0);
    } else {
      console.log('❌ Trips API failed with Authorization header:', tripsData.message);
    }

  } catch (error) {
    console.error('❌ Error testing frontend auth flow:', error);
  }
};

testFrontendAuthFlow();
