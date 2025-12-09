// Test script to discover the correct company identifier
import https from 'https';
import { readFileSync } from 'fs';

// Load .env file manually
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();

const CLIENT_ID = env.VITE_CW_CLIENT_ID || '2c1f013e-0e56-4b3c-b89b-79375481f44a';
const PUBLIC_KEY = env.VITE_CW_PUBLIC_KEY || 'NC7dEXWKGOibYNZs';
const PRIVATE_KEY = env.VITE_CW_PRIVATE_KEY || 'X7W5Y13tUdaWQX7N';
const BASE_URL = env.VITE_CW_BASE_URL || 'https://na.myconnectwise.net';
const COMPANY_ID = env.VITE_CW_COMPANY_ID || 'wolfflogics';

console.log('=== Discovering Company Identifier ===\n');

const authString = Buffer.from(`${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64');

// Test various endpoints that might help us discover the company
const tests = [
  { name: 'System Info', path: '/v4_6_release/apis/3.0/system/info' },
  { name: 'System Members (no company)', path: '/v4_6_release/apis/3.0/system/members?pageSize=5' },
  { name: 'Company Info', path: `/v4_6_release/apis/3.0/company/info` },
  { name: 'Company Members (lowercase)', path: `/v4_6_release/apis/3.0/company/${COMPANY_ID.toLowerCase()}/system/members?pageSize=5` },
  { name: 'Company Members (uppercase)', path: `/v4_6_release/apis/3.0/company/${COMPANY_ID.toUpperCase()}/system/members?pageSize=5` },
  { name: 'Company Members (original)', path: `/v4_6_release/apis/3.0/company/${COMPANY_ID}/system/members?pageSize=5` },
];

function makeRequest(name, path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': CLIENT_ID,
      },
    };

    console.log(`Testing: ${name}`);
    console.log(`  URL: ${url}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`  ✅ SUCCESS! Status: ${res.statusCode}`);
            if (Array.isArray(json)) {
              console.log(`  Found ${json.length} items`);
              if (json.length > 0 && json[0].identifier) {
                console.log(`  Sample identifier: ${json[0].identifier}`);
              }
              // Search for dsolomon
              const found = json.filter(m => 
                m && (
                  (m.firstName && m.firstName.toLowerCase().includes('dsolomon')) ||
                  (m.lastName && m.lastName.toLowerCase().includes('dsolomon')) ||
                  (m.identifier && m.identifier.toLowerCase().includes('dsolomon')) ||
                  (m.emailAddress && m.emailAddress.toLowerCase().includes('dsolomon'))
                )
              );
              if (found.length > 0) {
                console.log(`  🎯 FOUND dsolomon in this response!`);
                found.forEach(m => {
                  console.log(`     - ${m.firstName || ''} ${m.lastName || ''} (ID: ${m.id}, Identifier: ${m.identifier || 'N/A'})`);
                });
              }
            } else {
              console.log(`  Response: ${JSON.stringify(json).substring(0, 200)}...`);
            }
            resolve({ success: true, data: json });
          } catch (e) {
            console.log(`  ⚠️  Status: ${res.statusCode} (Response not JSON)`);
            console.log(`  Response: ${data.substring(0, 200)}`);
            resolve({ success: false, status: res.statusCode, data });
          }
        } else {
          console.log(`  ❌ Status: ${res.statusCode} - ${data.substring(0, 100)}`);
          resolve({ success: false, status: res.statusCode, data });
        }
        console.log('');
      });
    });

    req.on('error', (e) => {
      console.log(`  ❌ Error: ${e.message}\n`);
      resolve({ success: false, error: e.message });
    });

    req.end();
  });
}

async function runTests() {
  for (const test of tests) {
    await makeRequest(test.name, test.path);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('=== Test Complete ===');
}

runTests();

