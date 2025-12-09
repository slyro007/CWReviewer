// Test script with fixed authentication format
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

// Use correct values from working implementation
// Note: These should match your .env file
const CLIENT_ID = env.VITE_CW_CLIENT_ID || '2c1f013e-0e56-4b3c-b89b-79375481f44a';
const PUBLIC_KEY = env.VITE_CW_PUBLIC_KEY || 'NC7dEXWKGOibYNZs';
const PRIVATE_KEY = env.VITE_CW_PRIVATE_KEY || 'X7W5Y13tUdaWQX7N';
// IMPORTANT: Base URL should be api-na.myconnectwise.net (with api- prefix)
const BASE_URL = env.VITE_CW_BASE_URL || 'https://api-na.myconnectwise.net';
// IMPORTANT: Company ID is case-sensitive - must be WolffLogics (capital W and L)
const COMPANY_ID = env.VITE_CW_COMPANY_ID || 'WolffLogics';

console.log('=== Testing Fixed ConnectWise API ===\n');
console.log('Configuration:');
console.log('  Base URL:', BASE_URL);
console.log('  Company ID:', COMPANY_ID);
console.log('  Client ID:', CLIENT_ID.substring(0, 20) + '...\n');

// FIXED: Use companyId+publicKey:privateKey format
const authString = Buffer.from(`${COMPANY_ID}+${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64');
console.log('Auth format: companyId+publicKey:privateKey');
console.log('Auth string (first 30 chars):', authString.substring(0, 30) + '...\n');

// Test system/members endpoint (no company in path)
console.log('--- Test: System Members Endpoint (no company in path) ---');
const url1 = `${BASE_URL}/v4_6_release/apis/3.0/system/members?pageSize=1000&conditions=inactiveFlag=false`;
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
  console.log('Status:', res.statusCode, res.statusText);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const members = JSON.parse(data);
        console.log(`✅ SUCCESS! Found ${members.length} members\n`);
        
        // Search for dsolomon
        const searchTerm = 'dsolomon';
        const found = members.filter(m => 
          (m.firstName && m.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (m.lastName && m.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (m.identifier && m.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (m.emailAddress && m.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        if (found.length > 0) {
          console.log(`🎯 Found ${found.length} member(s) matching "dsolomon":\n`);
          found.forEach((member, idx) => {
            console.log(`  ${idx + 1}. ${member.firstName || ''} ${member.lastName || ''} (ID: ${member.id})`);
            console.log(`     Identifier: ${member.identifier || 'N/A'}`);
            console.log(`     Email: ${member.emailAddress || 'N/A'}`);
            console.log(`     Inactive: ${member.inactiveFlag ? 'Yes' : 'No'}`);
            console.log('');
          });
        } else {
          console.log(`❌ No members found matching "dsolomon"\n`);
          console.log('First 10 members for reference:');
          members.slice(0, 10).forEach((member, idx) => {
            console.log(`  ${idx + 1}. ${member.firstName || ''} ${member.lastName || ''} (ID: ${member.id}, Identifier: ${member.identifier || 'N/A'})`);
          });
        }
      } catch (e) {
        console.error('Error parsing response:', e.message);
        console.log('Response:', data.substring(0, 500));
      }
    } else {
      console.error('❌ Error Response:', data);
    }
  });
});

req1.on('error', (e) => {
  console.error('Request error:', e.message);
});

req1.end();

