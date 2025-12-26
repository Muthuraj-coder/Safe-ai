const axios = require("axios");

const log = `Error at login:
User ID = user_123
Token = sk_test_abcdef
NullPointerException at AuthService.java:45`;

(async () => {
  const res = await axios.post("http://localhost:5001/mask", { text: log });

  console.log("INPUT:\n", log);
  console.log("\nOUTPUT:\n", res.data.maskedText);

  console.log("\nEXPECTED:");
  console.log(`
User ID = <USER_ID>
Token = <SECRET>
NullPointerException at AuthService.java:45
`);
})();
