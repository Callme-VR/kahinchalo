// Test vendor authenticated endpoints
const testVendorAuth = async () => {
  try {
    console.log('Testing vendor authenticated endpoints...');
    
    // First login to get cookie
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
      console.log('❌ Login failed, cannot test authenticated endpoints');
      return;
    }

    console.log('✅ Login successful, testing authenticated endpoints...');

    // Test vendor profile endpoint
    const profileResponse = await fetch('http://localhost:5000/api/vendors/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });

    console.log('Profile response status:', profileResponse.status);
    const profileData = await profileResponse.json();
    console.log('Profile data:', profileData);

    // Test vendor trips endpoint
    const tripsResponse = await fetch('http://localhost:5000/api/vendors/me/trips', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });

    console.log('Trips response status:', tripsResponse.status);
    const tripsData = await tripsResponse.json();
    console.log('Trips data:', tripsData);

  } catch (error) {
    console.error('❌ Error testing vendor auth:', error);
  }
};

testVendorAuth();
