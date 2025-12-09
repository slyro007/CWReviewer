// Simple test endpoint to verify Vercel routing works
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: 'Vercel serverless function is working!',
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });
}

