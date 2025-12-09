// Test script to fetch ConnectWise members and find dsolomon
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

console.log('=== Testing ConnectWise API for dsolomon ===\n');
console.log('Configuration:');
console.log('  Base URL:', BASE_URL);
console.log('  Company ID:', COMPANY_ID);
console.log('  Client ID:', CLIENT_ID.substring(0, 20) + '...\n');

// Create Basic Auth string
const authString = Buffer.from(`${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64');

// Test 1: System endpoint (no company ID)
console.log('--- Test 1: System endpoint /system/members ---');
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
  console.log('Status:', res.statusCode, res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const members = JSON.parse(data);
        console.log(`✅ Success! Found ${members.length} members\n`);
        
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
      
      // Try alternative with company ID
      console.log('\n--- Test 2: Company endpoint /company/{companyId}/system/members ---');
      const url2 = `${BASE_URL}/v4_6_release/apis/3.0/company/${COMPANY_ID}/system/members?pageSize=1000&conditions=inactiveFlag=false`;
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
              const members2 = JSON.parse(data2);
              console.log(`✅ Success with company endpoint! Found ${members2.length} members\n`);
              
              const searchTerm = 'dsolomon';
              const found2 = members2.filter(m => 
                (m.firstName && m.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.lastName && m.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.identifier && m.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.emailAddress && m.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              
              if (found2.length > 0) {
                console.log(`🎯 Found ${found2.length} member(s) matching "dsolomon":\n`);
                found2.forEach((member, idx) => {
                  console.log(`  ${idx + 1}. ${member.firstName || ''} ${member.lastName || ''} (ID: ${member.id})`);
                  console.log(`     Identifier: ${member.identifier || 'N/A'}`);
                  console.log(`     Email: ${member.emailAddress || 'N/A'}`);
                  console.log(`     Inactive: ${member.inactiveFlag ? 'Yes' : 'No'}`);
                  console.log('');
                });
              } else {
                console.log(`❌ No members found matching "dsolomon"`);
              }
            } catch (e) {
              console.error('Error parsing response:', e.message);
              console.log('Response:', data2.substring(0, 500));
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
    }
  });
});

req1.on('error', (e) => {
  console.error('Request error:', e.message);
});

req1.end();

