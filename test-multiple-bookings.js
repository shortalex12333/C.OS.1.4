#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🚀 TESTING MULTIPLE TIME SLOT BOOKINGS');
console.log('=' .repeat(70));
console.log('');

const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

async function bookMultipleSlots() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Book different time slots
  const bookings = [
    { time: '1:00 PM', name: 'Alice Johnson', email: 'alice@yacht.test' },
    { time: '2:30 PM', name: 'Bob Smith', email: 'bob@yacht.test' },
    { time: '4:00 PM', name: 'Carol Davis', email: 'carol@yacht.test' }
  ];
  
  console.log(`📅 Booking slots for ${tomorrowStr}:\n`);
  
  for (const booking of bookings) {
    const [firstName, lastName] = booking.name.split(' ');
    
    const bookingData = {
      firstname: firstName,
      lastname: lastName,
      email: booking.email,
      time: booking.time,
      date: tomorrowStr,
      phone: '+1-555-0000',
      yacht_size: '100-150 ft',
      chat_queries_count: 5,
      faq_queries_count: 3,
      topics: JSON.stringify(['Test booking']),
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
          body: JSON.stringify(bookingData)
        }
      );
      
      if (response.ok) {
        console.log(`✅ ${booking.time} - ${booking.name} booked successfully`);
      } else {
        const error = await response.text();
        if (error.includes('duplicate')) {
          console.log(`⚠️  ${booking.time} - Already booked (conflict prevented)`);
        } else {
          console.log(`❌ ${booking.time} - Failed: ${error}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error booking ${booking.time}:`, error.message);
    }
  }
  
  // Now test double booking attempts
  console.log('\n🔒 Testing double-booking prevention:\n');
  
  const conflictAttempt = {
    firstname: 'David',
    lastname: 'Wilson',
    email: 'david@yacht.test',
    time: '2:30 PM', // Try to book Bob's slot
    date: tomorrowStr,
    phone: '+1-555-9999',
    yacht_size: '80-120 ft',
    chat_queries_count: 2,
    faq_queries_count: 1,
    topics: JSON.stringify(['Conflict test']),
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
        body: JSON.stringify(conflictAttempt)
      }
    );
    
    if (response.ok) {
      console.log('❌ ERROR: Double booking was allowed!');
    } else {
      console.log('✅ Good! System prevented double booking at 2:30 PM');
    }
  } catch (error) {
    console.error('Error testing conflict:', error.message);
  }
  
  // Show final schedule
  console.log('\n📊 Final Schedule for Tomorrow:\n');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?date=eq.${tomorrowStr}&select=time&order=time`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      }
    );
    
    if (response.ok) {
      const bookings = await response.json();
      const allTimes = ['1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM', '4:45 PM', '5:30 PM', '6:00 PM'];
      
      allTimes.forEach(time => {
        const booking = bookings.find(b => b.time === time);
        if (booking) {
          console.log(`   ${time}: 🔴 Booked`);  // No client names shown
        } else {
          console.log(`   ${time}: ✅ Available`);
        }
      });
      
      console.log('\n📈 Summary:');
      console.log(`   Total slots: ${allTimes.length}`);
      console.log(`   Booked: ${bookings.length}`);
      console.log(`   Available: ${allTimes.length - bookings.length}`);
    }
  } catch (error) {
    console.error('Error fetching schedule:', error.message);
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test bookings...');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?email=in.(alice@yacht.test,bob@yacht.test,carol@yacht.test,david@yacht.test)`,
      {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ Test bookings cleaned up');
    }
  } catch (error) {
    console.error('Error cleaning up:', error.message);
  }
}

// Run tests
bookMultipleSlots().then(() => {
  console.log('\n' + '=' .repeat(70));
  console.log('✨ Test complete! The calendar should show red dots on booked slots.');
  console.log('💡 Run with --cleanup to remove test data');
  
  if (process.argv.includes('--cleanup')) {
    cleanup();
  }
});