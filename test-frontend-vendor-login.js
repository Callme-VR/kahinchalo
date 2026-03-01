// Test frontend vendor login functionality
const testFrontendVendorLogin = async () => {
  try {
    console.log('=== Testing Frontend Vendor Login ===');
    
    // Test 1: Check if vendor login page loads
    console.log('\n1. Testing vendor login page accessibility...');
    const loginPageResponse = await fetch('http://localhost:5173/vendor/login');
    console.log('Login page status:', loginPageResponse.status);
    
    if (loginPageResponse.ok) {
      console.log('✅ Vendor login page is accessible');
    } else {
      console.log('❌ Vendor login page not accessible');
      return;
    }

    // Test 2: Test the actual login API call (simulating frontend)
    console.log('\n2. Testing vendor login API call...');
    const loginResponse = await fetch('http://localhost:5000/api/vendors/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/vendor/login'
      },
      body: JSON.stringify({
        email: 'himachal_tours@example.com',
        password: 'vendor123'
      })
    });

    console.log('Login API status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login API successful');
      console.log('User data:', loginData.user);
      
      // Test 3: Test accessing protected dashboard
      console.log('\n3. Testing vendor dashboard access...');
      const dashboardResponse = await fetch('http://localhost:5173/vendor/dashboard', {
        credentials: 'include',
        headers: {
          'Origin': 'http://localhost:5173'
        }
      });
      
      console.log('Dashboard page status:', dashboardResponse.status);
      
      if (dashboardResponse.ok) {
        console.log('✅ Vendor dashboard accessible');
      } else {
        console.log('❌ Vendor dashboard not accessible');
      }

      // Test 4: Test vendor profile API
      console.log('\n4. Testing vendor profile API...');
      const profileResponse = await fetch('http://localhost:5000/api/vendors/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/vendor/dashboard'
        }
      });

      console.log('Profile API status:', profileResponse.status);
      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ Vendor profile API successful');
        console.log('Profile data:', profileData);
      } else {
        console.log('❌ Vendor profile API failed:', profileData.message);
      }

    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login API failed:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Error testing frontend vendor login:', error);
  }
};

testFrontendVendorLogin();
