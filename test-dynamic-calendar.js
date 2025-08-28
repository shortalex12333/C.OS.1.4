#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 DYNAMIC CALENDAR TEST - Booking Prevention & Real-time Updates');
console.log('=' .repeat(70));
console.log('');

const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

// Test 1: Insert a test booking
async function createTestBooking() {
  console.log('📝 TEST 1: Creating a test booking...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const testBooking = {
    firstname: 'Test',  // Note: lowercase as per database
    lastname: 'Booking', // Note: lowercase as per database
    email: `test.booking.${Date.now()}@yacht.com`,
    time: '2:30 PM',
    date: tomorrowStr,
    phone: '+1-555-TEST',
    yacht_size: '100-150 ft',
    chat_queries_count: 5,
    faq_queries_count: 3,
    topics: JSON.stringify(['Test topic 1', 'Test topic 2']),
    timezone: 'America/New_York',
    source: 'test-script'
  };
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls`,
      {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testBooking)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test booking created successfully!');
      console.log(`   Date: ${tomorrowStr}`);
      console.log(`   Time: 2:30 PM`);
      console.log(`   Email: ${testBooking.email}`);
      return data[0];
    } else {
      const error = await response.text();
      console.log('❌ Failed to create test booking:', error);
    }
  } catch (error) {
    console.error('❌ Error creating test booking:', error.message);
  }
}

// Test 2: Try to book the same slot (should fail)
async function testDoubleBooking() {
  console.log('\n📝 TEST 2: Testing double booking prevention...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const duplicateBooking = {
    firstname: 'Duplicate',  // Note: lowercase as per database
    lastname: 'Attempt',     // Note: lowercase as per database
    email: `duplicate.${Date.now()}@yacht.com`,
    time: '2:30 PM', // Same time as test booking
    date: tomorrowStr, // Same date as test booking
    phone: '+1-555-DUPE',
    yacht_size: '80-120 ft',
    chat_queries_count: 2,
    faq_queries_count: 1,
    topics: JSON.stringify(['Duplicate attempt']),
    timezone: 'America/New_York',
    source: 'test-script'
  };
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls`,
      {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(duplicateBooking)
      }
    );
    
    if (response.ok) {
      console.log('❌ PROBLEM: Double booking was allowed! This should not happen.');
    } else {
      const error = await response.text();
      if (error.includes('duplicate') || error.includes('unique')) {
        console.log('✅ Good! Double booking was prevented.');
        console.log('   Database correctly rejected duplicate date/time.');
      } else {
        console.log('⚠️  Booking failed for another reason:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error testing double booking:', error.message);
  }
}

// Test 3: Fetch all bookings for tomorrow
async function fetchTomorrowsBookings() {
  console.log('\n📝 TEST 3: Fetching tomorrow\'s bookings...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?date=eq.${tomorrowStr}&select=time,email,firstname,lastname`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const bookings = await response.json();
      console.log(`✅ Found ${bookings.length} booking(s) for ${tomorrowStr}:`);
      bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.time} - ${booking.firstname} ${booking.lastname} (${booking.email})`);
      });
      
      // Show which times are booked
      const bookedTimes = bookings.map(b => b.time);
      const allTimes = ['1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM', '4:45 PM', '5:30 PM', '6:00 PM'];
      
      console.log('\n📅 Time Slot Availability:');
      allTimes.forEach(time => {
        const isBooked = bookedTimes.includes(time);
        console.log(`   ${time}: ${isBooked ? '🔴 BOOKED' : '✅ Available'}`);
      });
    } else {
      console.log('❌ Failed to fetch bookings');
    }
  } catch (error) {
    console.error('❌ Error fetching bookings:', error.message);
  }
}

// Test 4: Clean up test bookings
async function cleanupTestBookings() {
  console.log('\n📝 TEST 4: Cleaning up test bookings...');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?email=like.test*`,
      {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ Test bookings cleaned up');
    } else {
      console.log('⚠️  Could not clean up test bookings');
    }
  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting dynamic calendar tests...\n');
  
  // Run tests in sequence
  const testBooking = await createTestBooking();
  await testDoubleBooking();
  await fetchTomorrowsBookings();
  
  // Optional: Ask if user wants to clean up
  console.log('\n' + '=' .repeat(70));
  console.log('📍 TEST COMPLETE!');
  console.log('\nThe calendar should now:');
  console.log('1. ✅ Show tomorrow\'s 2:30 PM slot as booked (with red dot)');
  console.log('2. ✅ Prevent booking the same time slot');
  console.log('3. ✅ Update in real-time when new bookings occur');
  console.log('\n💡 To clean up test data, run: node test-dynamic-calendar.js --cleanup');
  
  if (process.argv.includes('--cleanup')) {
    await cleanupTestBookings();
  }
}

runTests();