// Test vendor login endpoint
const testVendorLogin = async () => {
  try {
    console.log('Testing vendor login endpoint...');
    
    const response = await fetch('http://localhost:5000/api/vendors/login', {
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

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Vendor login successful!');
      console.log('User:', data.user);
    } else {
      console.log('❌ Vendor login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing vendor login:', error);
  }
};

testVendorLogin();
