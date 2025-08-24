import React from 'react';

export default function AppTest() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>UPDATE UX - Test Mode</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', background: 'white', border: '1px solid #ccc' }}>
        <h2>Component Test Status:</h2>
        <ul>
          <li>✅ React rendering</li>
          <li>✅ Basic styles applied</li>
          <li>✅ Dev server running on port 8082</li>
        </ul>
      </div>
    </div>
  );
}