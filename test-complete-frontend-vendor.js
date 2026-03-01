// Test complete frontend vendor functionality
const testCompleteFrontendVendor = async () => {
  try {
    console.log('=== Complete Frontend Vendor Test ===');
    
    // Simulate the frontend API client behavior
    class MockApiClient {
      constructor() {
        this.token = null;
      }

      async vendorLogin(credentials) {
        const response = await fetch('http://localhost:5000/api/vendors/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173'
          },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();
        
        if (response.ok && data.token) {
          this.token = data.token;
          console.log('✅ Token stored successfully');
        }
        
        return data;
      }

      async getVendorProfile() {
        const headers = {
          'Origin': 'http://localhost:5173'
        };
        
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch('http://localhost:5000/api/vendors/me', {
          method: 'GET',
          credentials: 'include',
          headers
        });

        return response.json();
      }

      async getVendorTrips() {
        const headers = {
          'Origin': 'http://localhost:5173'
        };
        
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch('http://localhost:5000/api/vendors/me/trips', {
          method: 'GET',
          credentials: 'include',
          headers
        });

        return response.json();
      }

      async getVendorBookings() {
        const headers = {
          'Origin': 'http://localhost:5173'
        };
        
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch('http://localhost:5000/api/vendors/me/bookings', {
          method: 'GET',
          credentials: 'include',
          headers
        });

        return response.json();
      }
    }

    const apiClient = new MockApiClient();

    // Test 1: Login
    console.log('\n1. Testing vendor login...');
    const loginResult = await apiClient.vendorLogin({
      email: 'himachal_tours@example.com',
      password: 'vendor123'
    });
    
    if (loginResult.user) {
      console.log('✅ Login successful');
      console.log('Vendor:', loginResult.user.name);
    } else {
      console.log('❌ Login failed');
      return;
    }

    // Test 2: Get profile
    console.log('\n2. Testing vendor profile...');
    const profileResult = await apiClient.getVendorProfile();
    
    if (profileResult.data) {
      console.log('✅ Profile retrieved');
      console.log('Business:', profileResult.data.businessName);
      console.log('Rating:', profileResult.data.rating);
      console.log('Total Trips:', profileResult.data.stats.totalTrips);
    } else {
      console.log('❌ Profile failed');
    }

    // Test 3: Get trips
    console.log('\n3. Testing vendor trips...');
    const tripsResult = await apiClient.getVendorTrips();
    
    if (tripsResult.trips || tripsResult.data) {
      const trips = tripsResult.trips || tripsResult.data;
      console.log('✅ Trips retrieved');
      console.log('Number of trips:', trips.length);
      trips.forEach((trip, index) => {
        console.log(`  ${index + 1}. ${trip.title} - ₹${trip.price}`);
      });
    } else {
      console.log('❌ Trips failed');
    }

    // Test 4: Get bookings
    console.log('\n4. Testing vendor bookings...');
    const bookingsResult = await apiClient.getVendorBookings();
    
    if (bookingsResult.data || bookingsResult.bookings) {
      const bookings = bookingsResult.data || bookingsResult.bookings;
      console.log('✅ Bookings retrieved');
      console.log('Number of bookings:', bookings.length);
      bookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.trip?.title || 'Unknown Trip'} - ${booking.status} - ${booking.numberOfPeople} people`);
      });
    } else {
      console.log('❌ Bookings failed');
    }

    console.log('\n🎉 Frontend vendor functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Error in complete frontend test:', error);
  }
};

testCompleteFrontendVendor();
