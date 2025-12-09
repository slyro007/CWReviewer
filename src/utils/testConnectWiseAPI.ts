import { API_CONFIG } from '../config/api';

/**
 * Test ConnectWise API connection directly
 * This will help diagnose authentication and connection issues
 */
export async function testConnectWiseAPI(): Promise<void> {
  console.log('=== ConnectWise API Connection Test ===');
  
  // Check environment variables
  console.log('\n1. Environment Variables Check:');
  console.log('  Base URL:', API_CONFIG.baseURL);
  console.log('  Company ID:', API_CONFIG.companyId);
  console.log('  Client ID:', API_CONFIG.clientId ? `${API_CONFIG.clientId.substring(0, 20)}...` : 'MISSING');
  console.log('  Public Key:', API_CONFIG.publicKey ? `${API_CONFIG.publicKey.substring(0, 10)}...` : 'MISSING');
  console.log('  Private Key:', API_CONFIG.privateKey ? 'SET' : 'MISSING');
  
  if (!API_CONFIG.clientId || !API_CONFIG.publicKey || !API_CONFIG.privateKey) {
    console.error('❌ Missing required credentials!');
    return;
  }
  
  // Test 1: Basic connection test
  console.log('\n2. Testing API Connection...');
  const authString = btoa(`${API_CONFIG.publicKey}:${API_CONFIG.privateKey}`);
  const baseURL = `${API_CONFIG.baseURL}/v4_6_release/apis/3.0`;
  const testURL = `${baseURL}/system/members?pageSize=1`;
  
  console.log('  Test URL:', testURL);
  console.log('  Auth Header:', `Basic ${authString.substring(0, 20)}...`);
  
  try {
    const response = await fetch(testURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': API_CONFIG.clientId,
      },
    });
    
    console.log('\n3. Response Details:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('  Error Response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('  Error JSON:', JSON.stringify(errorJson, null, 2));
      } catch {
        console.error('  Error Text (not JSON):', errorText);
      }
    } else {
      const data = await response.json();
      console.log('  Success! Data:', data);
      console.log('  Number of members:', Array.isArray(data) ? data.length : 'Not an array');
    }
  } catch (error: any) {
    console.error('\n3. Connection Error:');
    console.error('  Error Type:', error.name);
    console.error('  Error Message:', error.message);
    
    if (error.message.includes('CORS')) {
      console.error('  ⚠️  CORS Error: The API server is blocking requests from the browser.');
      console.error('     This requires a backend proxy or CORS configuration on the ConnectWise server.');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('  ⚠️  Network Error: Could not reach the API server.');
      console.error('     Check if the URL is correct and the server is accessible.');
    }
  }
  
  // Test 2: Try alternative URL format
  console.log('\n4. Testing Alternative URL Format...');
  const altURL = `${API_CONFIG.baseURL}/v4_6_release/apis/3.0/company/${API_CONFIG.companyId}/system/members?pageSize=1`;
  console.log('  Alternative URL:', altURL);
  
  try {
    const altResponse = await fetch(altURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': API_CONFIG.clientId,
      },
    });
    
    console.log('  Status:', altResponse.status, altResponse.statusText);
    if (altResponse.ok) {
      const altData = await altResponse.json();
      console.log('  ✅ Alternative format works!');
      console.log('  Data:', altData);
    } else {
      const altError = await altResponse.text();
      console.log('  Error:', altError);
    }
  } catch (error: any) {
    console.error('  Error:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

