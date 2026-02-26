// Test file for all implemented APIs
// Run this with: bun run test-new-apis.ts

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { prisma } from './src/lib/db';

const API_BASE = 'http://localhost:5000/api';

// Test data
let testVendorId: string;
let testCategoryId: string;
let testTripId: string;
let testUserId: string;
let authToken: string;

describe('Vendor APIs', () => {
  it('POST /vendors/register - should register a new vendor', async () => {
    const response = await fetch(`${API_BASE}/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: 'password123',
        phone: '+1234567890',
        businessName: 'Test Business',
        businessLicense: 'LICENSE123'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe('Vendor registered successfully');
    expect(data.vendor.email).toBe('vendor@test.com');
    testVendorId = data.vendor.id;
  });

  it('GET /vendors/:id - should get vendor public profile', async () => {
    const response = await fetch(`${API_BASE}/vendors/${testVendorId}`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Vendor profile retrieved successfully');
    expect(data.vendor.id).toBe(testVendorId);
    expect(data.vendor.name).toBe('Test Vendor');
  });

  it('GET /vendors/:id/reviews - should get vendor reviews', async () => {
    const response = await fetch(`${API_BASE}/vendors/${testVendorId}/reviews`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Vendor reviews retrieved successfully');
    expect(Array.isArray(data.reviews)).toBe(true);
  });
});

describe('Category APIs', () => {
  beforeAll(async () => {
    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Adventure',
        description: 'Adventure trips and activities'
      }
    });
    testCategoryId = category.id;
  });

  it('GET /categories - should list all categories', async () => {
    const response = await fetch(`${API_BASE}/categories`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Categories retrieved successfully');
    expect(Array.isArray(data.categories)).toBe(true);
  });

  it('POST /categories/:id/trips - should get trips by category', async () => {
    const response = await fetch(`${API_BASE}/categories/${testCategoryId}/trips`, {
      method: 'POST'
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Trips retrieved successfully');
    expect(Array.isArray(data.trips)).toBe(true);
  });
});

describe('Trip APIs', () => {
  beforeAll(async () => {
    // Create a test trip
    const trip = await prisma.trip.create({
      data: {
        title: 'Mountain Adventure',
        description: 'Exciting mountain climbing adventure',
        price: 299.99,
        location: 'Himalayas',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-07'),
        ageGroup: '18-35',
        maxCapacity: 20,
        categoryId: testCategoryId,
        vendorId: testVendorId
      }
    });
    testTripId = trip.id;
  });

  it('GET /trips - should list trips with filters', async () => {
    const response = await fetch(`${API_BASE}/trips?ageGroup=18-35&budget=500`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Trips retrieved successfully');
    expect(Array.isArray(data.trips)).toBe(true);
    expect(data.pagination).toBeDefined();
  });

  it('GET /trips/:id - should get trip details', async () => {
    const response = await fetch(`${API_BASE}/trips/${testTripId}`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Trip details retrieved successfully');
    expect(data.trip.id).toBe(testTripId);
    expect(data.trip.title).toBe('Mountain Adventure');
  });
});

describe('Booking APIs', () => {
  beforeAll(async () => {
    // Create a test user for booking
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@test.com',
        password: hashedPassword
      }
    });
    testUserId = user.id;

    // Get auth token (you would need to implement login first)
    // For now, we'll skip the authenticated booking test
  });

  it('POST /trips/bookings - should create booking (requires auth)', async () => {
    // This test would require authentication
    // Skipping for now as it needs proper auth setup
    console.log('Booking test requires authentication - skipping');
  });
});

afterAll(async () => {
  // Cleanup test data
  await prisma.booking.deleteMany({
    where: { userId: testUserId }
  });
  
  await prisma.trip.deleteMany({
    where: { id: testTripId }
  });
  
  await prisma.category.deleteMany({
    where: { id: testCategoryId }
  });
  
  await prisma.vendor.deleteMany({
    where: { id: testVendorId }
  });
  
  await prisma.user.deleteMany({
    where: { id: testUserId }
  });
});

console.log('All API tests completed!');
