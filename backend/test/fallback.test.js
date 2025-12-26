const axios = require("axios");

(async () => {
  const res = await axios.post("http://localhost:3000/api/logs/submit", {
    userId: "tester2",
    rawLog: "Token=sk_test_fallback"
  });

  console.log(res.data);
})();
