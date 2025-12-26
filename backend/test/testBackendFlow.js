const axios = require('axios');

const testLogs = [
  `Error at login:
   User email = ravi@gmail.com
   User ID = user_123
   Token = sk_test_abcdef123456
   NullPointerException at AuthService.java:45`,

  `Database failed:
   IP = 192.168.1.10
   API Key = api_0987654321
   TimeoutException at DBService.java:78`
];

(async () => {
  for (let rawLog of testLogs) {
    try {
      const submitResp = await axios.post('http://localhost:3000/api/logs/submit', {
        userId: 'test_user_1',
        rawLog
      });

      console.log('-----------------------------------------');
      console.log('Raw Log:');
      console.log(rawLog);

      if(submitResp.data.fromCache) {
        console.log('Cache Hit:');
        console.log(submitResp.data.solution);
      } else {
        console.log('New Log Stored:');
        console.log(submitResp.data.message);
      }

      // Fetch stored log from DB
      const dbEntryResp = await axios.get(`http://localhost:3000/api/logs/get/${submitResp.data._id}`);
      console.log('Stored Masked Log:');
      console.log(dbEntryResp.data.maskedLog);
      console.log('Stored Fingerprint:');
      console.log(dbEntryResp.data.fingerprint);

    } catch(err) {
      console.error('Error:', err.response?.data || err.message);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Response data:', err.response.data);
      } else if (err.request) {
        console.error('No response received. Is the server running?');
        console.error('Request details:', err.config?.url);
      } else {
        console.error('Error details:', err);
      }
    }
  }
})();

