/**
 * Vercel serverless function to proxy webhook requests and handle CORS
 * This resolves CORS issues between the frontend and the backend API
 */

export default async function handler(req, res) {
  // Set comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Cache-Control', 'no-cache');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed', method: req.method });
    return;
  }

  console.log('✅ Webhook proxy handler started');
  console.log('📍 URL:', req.url);
  console.log('📋 Query:', req.query);

  try {
    // Extract the endpoint from query parameters or body
    const endpoint = req.query.endpoint || req.body.endpoint || 'text-chat';
    const targetUrl = `https://api.celeste7.ai/webhook/${endpoint}`;
    
    console.log('🔄 Proxying request to:', targetUrl);
    console.log('📤 Request body:', req.body);

    // Forward the request to the actual API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CelesteOS-Webhook-Proxy/1.0'
      },
      body: JSON.stringify(req.body)
    });

    // Get response text
    const responseText = await response.text();
    
    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log('📥 API response:', responseData);

    // Return the response with proper status
    res.status(response.status).json({
      success: response.ok,
      data: responseData,
      status: response.status,
      message: response.ok ? 'Request successful' : 'Request failed'
    });

  } catch (error) {
    console.error('❌ Webhook proxy error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: error.message || 'Webhook proxy failed',
      message: 'Internal server error'
    });
  }
}