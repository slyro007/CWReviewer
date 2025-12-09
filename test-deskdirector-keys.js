// Test with DeskDirector API keys
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

// Use DeskDirector API keys
const CLIENT_ID = env.VITE_CW_CLIENT_ID || '2c1f013e-0e56-4b3c-b89b-79375481f44a';
const PUBLIC_KEY = env.VITE_CW_PUBLIC_KEY || '0CbXV3DobrEDeAMr';
const PRIVATE_KEY = env.VITE_CW_PRIVATE_KEY || 'EvRCGOLnBfEa7BgW';
const BASE_URL = env.VITE_CW_BASE_URL || 'https://api-na.myconnectwise.net';
const COMPANY_ID = env.VITE_CW_COMPANY_ID || 'WolffLogics';

console.log('=== Testing with DeskDirector API Keys ===\n');
console.log('Configuration:');
console.log('  Base URL:', BASE_URL);
console.log('  Company ID:', COMPANY_ID);
console.log('  Public Key:', PUBLIC_KEY);
console.log('  Private Key:', PRIVATE_KEY ? 'SET' : 'MISSING');
console.log('  Client ID:', CLIENT_ID.substring(0, 20) + '...\n');

// Use companyId+publicKey:privateKey format
const authString = Buffer.from(`${COMPANY_ID}+${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64');
console.log('Auth format: companyId+publicKey:privateKey');
console.log('Auth string (first 50 chars):', authString.substring(0, 50) + '...\n');

// Test system/members endpoint
console.log('--- Test: System Members Endpoint ---');
const url = `${BASE_URL}/v4_6_release/apis/3.0/system/members?pageSize=1000&conditions=inactiveFlag=false`;
console.log('URL:', url);

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

const req = https.request(options, (res) => {
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

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();

