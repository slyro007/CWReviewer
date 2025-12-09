// Vercel serverless function to proxy ConnectWise API requests
// This handles CORS issues in production

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests for now (we can add POST/PUT/DELETE later if needed)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the path from the URL (Vercel catch-all route)
  const path = Array.isArray(req.query.path) 
    ? req.query.path.join('/') 
    : req.query.path || '';

  // Build the full ConnectWise API URL
  const baseURL = process.env.VITE_CW_BASE_URL || 'https://api-na.myconnectwise.net';
  const apiPath = `/v4_6_release/apis/3.0/${path}`;
  
  // Reconstruct query parameters (excluding 'path' which is the route parameter)
  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value as string);
      }
    }
  });
  
  const queryString = queryParams.toString();
  const urlWithQuery = queryString ? `${baseURL}${apiPath}?${queryString}` : `${baseURL}${apiPath}`;

  // Create Basic Auth header
  const companyId = process.env.VITE_CW_COMPANY_ID || 'WolffLogics';
  const publicKey = process.env.VITE_CW_PUBLIC_KEY || '';
  const privateKey = process.env.VITE_CW_PRIVATE_KEY || '';
  const authString = Buffer.from(`${companyId}+${publicKey}:${privateKey}`).toString('base64');

  try {
    console.log(`Proxying request to: ${urlWithQuery}`);

    const response = await fetch(urlWithQuery, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': process.env.VITE_CW_CLIENT_ID || '',
      },
    });

    const data = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, clientId');

    // Forward the status code
    res.status(response.status);

    // Try to parse as JSON, otherwise return as text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}

