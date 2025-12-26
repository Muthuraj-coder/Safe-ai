import re
from flask import Flask, request, jsonify
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.predefined_recognizers import IpRecognizer
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

app = Flask(__name__)

custom_recognizers = [
    PatternRecognizer(
        supported_entity="SESSION_TOKEN",
        patterns=[
            Pattern("long_hex", r"0x[a-fA-F0-9]{16,}", 0.5),
            Pattern("long_b64", r"[A-Za-z0-9+\/=]{20,}", 0.5),
            Pattern(
                "jwt_like",
                r"[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+",
                0.6,
            ),
        ],
    ),
    PatternRecognizer(
        supported_entity="USER_ID",
        patterns=[
            Pattern("user_prefix", r"\buser_[A-Za-z0-9]+\b", 0.6),
            Pattern("uid_prefix", r"\buid-[A-Za-z0-9]+\b", 0.6),
            Pattern("userId_kv", r"\buserId\s*=\s*[A-Za-z0-9]+\b", 0.6),
        ],
    ),
    PatternRecognizer(
        supported_entity="API_KEY",
        patterns=[
            Pattern("sk_prefix", r"\bsk_[A-Za-z0-9]{8,}\b", 0.85),
            Pattern("api_prefix", r"\bapi_[A-Za-z0-9]{8,}\b", 0.85),
            Pattern("key_prefix", r"\bkey_[A-Za-z0-9]{8,}\b", 0.85),
            Pattern("token_prefix", r"\btoken_[A-Za-z0-9]{8,}\b", 0.85),
            Pattern("api_key_short", r"\bapi_[A-Za-z0-9]{4,}\b", 0.85),
            Pattern("api_key_digits", r"\bapi[_-]?[A-Za-z0-9]{6,}\b", 0.85),
        ],
    ),
]

# Analyzer setup
analyzer = AnalyzerEngine()
analyzer.registry.add_recognizer(IpRecognizer())
for r in custom_recognizers:
    analyzer.registry.add_recognizer(r)

anonymizer = AnonymizerEngine()

_SENSITIVE_KEYS = r"(password|secret|token|session|auth|credential)"
_kv_pattern = re.compile(rf"(?i)\b{_SENSITIVE_KEYS}\b\s*[:=]\s*([^\s,;]+)")
_ip_kv_pattern = re.compile(
    r"(?i)\bIP\s*=\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
)
_api_key_kv_pattern = re.compile(r"(?i)\bAPI\s*Key\s*=\s*(\S+)")

# ✅ CRITICAL FIX: Exclude exception patterns from entropy masking
# Match exception stack traces: "SomeException at File.java:line"
_exception_line_pattern = re.compile(r'\b\w+Exception\b.*\bat\b.*\.\w+:\d+')

# Modified entropy patterns that WON'T match exception lines
_entropy_pattern = re.compile(
    r"(?=.{21,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+"
)
_failsafe_pattern = re.compile(
    r"(?=.{31,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+"
)


def is_exception_line(text: str) -> bool:
    """Check if line contains exception stack trace."""
    return bool(_exception_line_pattern.search(text))


def post_process_mask(text: str, is_exception: bool = False) -> str:
    """Mask sensitive key-value pairs and high-entropy secrets."""
    # Don't mask exception lines
    if is_exception:
        return text
    
    text = _ip_kv_pattern.sub("IP = <IP_ADDRESS>", text)
    text = _api_key_kv_pattern.sub("API Key = <API_KEY>", text)
    text = _kv_pattern.sub(lambda m: f"{m.group(1)} = <SECRET>", text)
    text = _entropy_pattern.sub("<SECRET>", text)
    return text


def failsafe_mask(text: str, is_exception: bool = False) -> str:
    """Final guard: mask any remaining long, high-entropy tokens."""
    # Don't mask exception lines
    if is_exception:
        return text
    
    return _failsafe_pattern.sub("<UNKNOWN>", text)


@app.post("/mask")
def mask():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text")

    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "text is required"}), 400

    operators = {
        "SESSION_TOKEN": OperatorConfig("replace", {"new_value": "<TOKEN>"}),
        "USER_ID": OperatorConfig("replace", {"new_value": "<USER_ID>"}),
        "API_KEY": OperatorConfig("replace", {"new_value": "<API_KEY>"}),
        "IP_ADDRESS": OperatorConfig("replace", {"new_value": "<IP_ADDRESS>"}),
    }

    masked_parts = []
    for line in text.splitlines(keepends=True):
        # Check if this is an exception line
        exception_detected = is_exception_line(line)
        
        # Debug logging (remove after testing)
        if exception_detected:
            print(f"[DEBUG] Exception line detected: {line.strip()}")
        
        # For exception lines, preserve exactly as-is
        if exception_detected:
            masked_parts.append(line)
            continue

        # Process non-exception lines with Presidio
        analyzer_results = analyzer.analyze(
            text=line,
            language="en",
            entities=["IP_ADDRESS", "API_KEY", "SESSION_TOKEN", "USER_ID"],
        )

        anonymized = anonymizer.anonymize(
            text=line,
            analyzer_results=analyzer_results,
            operators=operators,
        )

        # Apply post-processing masks (with exception protection)
        post_processed = post_process_mask(anonymized.text, is_exception=False)
        final_masked = failsafe_mask(post_processed, is_exception=False)
        masked_parts.append(final_masked)

    return jsonify({"maskedText": "".join(masked_parts)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)