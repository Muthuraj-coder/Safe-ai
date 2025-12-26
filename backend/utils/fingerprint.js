const crypto = require("crypto");

function generateFingerprint(rawLog) {

  let text = rawLog.toLowerCase();

  // Remove noise
  text = text.replace(/0x[a-f0-9]+/g, "");
  text = text.replace(/\b[0-9a-f]{8,}\b/g, ""); // hashes
  text = text.replace(/\s+/g, " ").trim();

  let signature = "";

  // 1️⃣ Java / Backend Exceptions
  const exceptionMatch = text.match(
    /\b[a-z]+exception\b.*?(?:\.java|\.js|\.ts)?/i
  );

  // 2️⃣ JS Runtime Errors
  const jsErrorMatch = text.match(
    /(typeerror|referenceerror|syntaxerror)\b.*?(?:\.js)?/i
  );

  // 3️⃣ HTTP Errors
  const httpErrorMatch = text.match(
    /\b(4\d\d|5\d\d)\b.*?(not found|unauthorized|forbidden|error)?/i
  );

  // 4️⃣ DB Errors
  const dbErrorMatch = text.match(
    /(mongoerror|sqlstate|duplicate key|constraint failed)/i
  );

  // 5️⃣ Network Errors
  const networkErrorMatch = text.match(
    /(econnrefused|timeout|network unreachable|connection reset)/i
  );

  if (exceptionMatch) signature = exceptionMatch[0];
  else if (jsErrorMatch) signature = jsErrorMatch[0];
  else if (httpErrorMatch) signature = httpErrorMatch[0];
  else if (dbErrorMatch) signature = dbErrorMatch[0];
  else if (networkErrorMatch) signature = networkErrorMatch[0];
  else signature = text.slice(0, 120); // fallback

  return crypto
    .createHash("sha256")
    .update(signature)
    .digest("hex");
}

module.exports = generateFingerprint;
