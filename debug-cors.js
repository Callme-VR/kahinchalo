// Debug CORS headers
const debugCORS = async () => {
  try {
    console.log('=== Debugging CORS Headers ===');
    
    // Test with different origins
    const origins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];
    
    for (const origin of origins) {
      console.log(`\nTesting origin: ${origin}`);
      
      const response = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin,
          'Referer': `${origin}/vendor/login`
        },
        body: JSON.stringify({
          email: 'himachal_tours@example.com',
          password: 'vendor123'
        })
      });

      console.log(`Status: ${response.status}`);
      console.log(`CORS Origin: ${response.headers.get('access-control-allow-origin')}`);
      console.log(`CORS Credentials: ${response.headers.get('access-control-allow-credentials')}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success for ${origin}`);
      } else {
        const data = await response.json();
        console.log(`❌ Failed for ${origin}: ${data.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

debugCORS();
