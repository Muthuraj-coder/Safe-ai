const axios = require("axios");

const rawLog = `Login failed:
User ID = user_new_1
Token = sk_test_newtoken
RuntimeError at LoginService.java:22`;

(async () => {
  const res = await axios.post("http://localhost:3000/api/logs/submit", {
    userId: "tester1",
    rawLog
  });

  console.log(res.data);
})();
