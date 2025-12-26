// Quick test script to verify backend is running and CORS is working
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:5173'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is configured correctly!');
    } else {
      console.log('❌ CORS headers missing');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection error: ${e.message}`);
  console.log('Make sure the backend server is running on port 3000');
});

req.end();

