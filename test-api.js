// Test ConnectWise API connection
// Run with: node test-api.js

const https = require('https');

// Load environment variables
require('dotenv').config();

const CLIENT_ID = process.env.VITE_CW_CLIENT_ID || '2c1f013e-0e56-4b3c-b89b-79375481f44a';
const PUBLIC_KEY = process.env.VITE_CW_PUBLIC_KEY || 'NC7dEXWKGOibYNZs';
const PRIVATE_KEY = process.env.VITE_CW_PRIVATE_KEY || 'X7W5Y13tUdaWQX7N';
const BASE_URL = process.env.VITE_CW_BASE_URL || 'https://na.myconnectwise.net';
const COMPANY_ID = process.env.VITE_CW_COMPANY_ID || 'wolfflogics';

console.log('=== ConnectWise API Test ===\n');
console.log('Configuration:');
console.log('  Base URL:', BASE_URL);
console.log('  Company ID:', COMPANY_ID);
console.log('  Client ID:', CLIENT_ID.substring(0, 20) + '...');
console.log('  Public Key:', PUBLIC_KEY.substring(0, 10) + '...');
console.log('  Private Key:', PRIVATE_KEY ? 'SET' : 'MISSING');

// Create Basic Auth string
const authString = Buffer.from(`${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64');

// Test 1: Standard endpoint
console.log('\n--- Test 1: Standard /system/members endpoint ---');
const url1 = `${BASE_URL}/v4_6_release/apis/3.0/system/members?pageSize=1`;
console.log('URL:', url1);

const urlObj1 = new URL(url1);
const options1 = {
  hostname: urlObj1.hostname,
  path: urlObj1.pathname + urlObj1.search,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authString}`,
    'clientId': CLIENT_ID,
  },
};

const req1 = https.request(options1, (res) => {
  console.log('Status:', res.statusCode, res.statusMessage);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log('✅ Success! Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response (not JSON):', data);
      }
    } else {
      console.error('❌ Error Response:', data);
    }
    
    // Test 2: Alternative format with company in path
    console.log('\n--- Test 2: Alternative format with company in path ---');
    const url2 = `${BASE_URL}/v4_6_release/apis/3.0/company/${COMPANY_ID}/system/members?pageSize=1`;
    console.log('URL:', url2);
    
    const urlObj2 = new URL(url2);
    const options2 = {
      hostname: urlObj2.hostname,
      path: urlObj2.pathname + urlObj2.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': CLIENT_ID,
      },
    };
    
    const req2 = https.request(options2, (res2) => {
      console.log('Status:', res2.statusCode, res2.statusMessage);
      let data2 = '';
      res2.on('data', (chunk) => { data2 += chunk; });
      res2.on('end', () => {
        if (res2.statusCode === 200) {
          try {
            const json = JSON.parse(data2);
            console.log('✅ Success! Response:', JSON.stringify(json, null, 2));
          } catch (e) {
            console.log('Response (not JSON):', data2);
          }
        } else {
          console.error('❌ Error Response:', data2);
        }
      });
    });
    
    req2.on('error', (e) => {
      console.error('Request error:', e.message);
    });
    
    req2.end();
  });
});

req1.on('error', (e) => {
  console.error('Request error:', e.message);
});

req1.end();

