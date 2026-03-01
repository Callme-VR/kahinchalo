// Debug vendor authentication
const debugVendorAuth = async () => {
  try {
    console.log('=== Debugging Vendor Authentication ===');
    
    // Create a cookie jar to store cookies
    const cookies = {};
    
    // First login to get cookie
    console.log('\n1. Testing login...');
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

    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    console.log('✅ Login successful');

    // Parse cookies manually for debugging
    if (setCookieHeader) {
      const cookieParts = setCookieHeader.split(';')[0];
      const [name, value] = cookieParts.split('=');
      cookies[name] = value;
      console.log('Stored cookie:', name, '=', value);
    }

    // Test with explicit cookie header
    console.log('\n2. Testing profile endpoint with explicit cookie...');
    const profileResponse = await fetch('http://localhost:5000/api/vendors/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': 'http://localhost:5173',
        'Cookie': `${Object.keys(cookies)[0]}=${Object.values(cookies)[0]}`
      }
    });

    console.log('Profile response status:', profileResponse.status);
    const profileData = await profileResponse.json();
    console.log('Profile response:', profileData);

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

debugVendorAuth();
