const fingerprint = require("../utils/fingerprint");

const logA = `Database failed:
IP = <IP_ADDRESS>
TimeoutException at DBService.java:78`;

const logB = `Database failed:
IP = <IP_ADDRESS>
TimeoutException at DBService.java:78`;

console.log("Fingerprint A:", fingerprint(logA));
console.log("Fingerprint B:", fingerprint(logB));
console.log("Same?", fingerprint(logA) === fingerprint(logB));
