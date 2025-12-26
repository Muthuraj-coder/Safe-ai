const axios = require("axios");

const PRESIDIO_URL = "http://localhost:5001/mask";

const FALLBACK_MASK = "<MASKED>";

function basicRegexMask(text) {
  if (typeof text !== "string") return "";

  let masked = text;

  // Emails
  masked = masked.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    FALLBACK_MASK
  );

  // URLs
  masked = masked.replace(
    /\bhttps?:\/\/[^\s]+/gi,
    FALLBACK_MASK
  );

  // Long tokens (hex/base64-ish)
  masked = masked.replace(
    /\b[A-Za-z0-9+\/=_-]{20,}\b/g,
    FALLBACK_MASK
  );

  // Key/value secrets
  masked = masked.replace(
    /\b(password|secret|token|session|auth|credential)\b\s*[:=]\s*[^\s,;]+/gi,
    "$1=" + FALLBACK_MASK
  );

  return masked;
}

async function maskLog(rawLog) {
  if (typeof rawLog !== "string") return "";

  try {
    const response = await axios.post(
      PRESIDIO_URL,
      { text: rawLog },
      { timeout: 4000 }
    );

    if (response?.data?.maskedText) {
      return response.data.maskedText;
    }

    return basicRegexMask(rawLog);
  } catch (err) {
    return basicRegexMask(rawLog);
  }
}

module.exports = {
  maskLog
};

