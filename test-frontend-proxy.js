// Test frontend through Vite proxy
const testFrontendProxy = async () => {
  try {
    console.log('=== Testing Frontend Through Vite Proxy ===');
    
    // Test login through frontend proxy
    console.log('\n1. Testing vendor login through proxy...');
    const loginResponse = await fetch('http://localhost:5173/api/vendors/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'himachal_tours@example.com',
        password: 'vendor123'
      })
    });

    console.log('Proxy login status:', loginResponse.status);
    console.log('CORS Origin:', loginResponse.headers.get('access-control-allow-origin'));
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Proxy login successful!');
      console.log('User:', loginData.user.name);
      
      // Test profile through proxy
      console.log('\n2. Testing vendor profile through proxy...');
      const profileResponse = await fetch('http://localhost:5173/api/vendors/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      console.log('Proxy profile status:', profileResponse.status);
      console.log('CORS Origin:', profileResponse.headers.get('access-control-allow-origin'));
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Proxy profile successful!');
        console.log('Business:', profileData.data.businessName);
      } else {
        console.log('❌ Proxy profile failed');
      }

    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Proxy login failed:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Error testing proxy:', error);
  }
};

testFrontendProxy();
