const express = require("express");
const router = express.Router();
const axios = require("axios");
const ErrorLog = require("../models/ErrorLog");
const generateFingerprint = require("../utils/fingerprint");
const { maskLog } = require("../services/presidioService");

const NIM_CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_MODEL = "meta/llama-4-maverick-17b-128e-instruct";

async function generateAiSolution(maskedLog) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.NIM_API_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NVIDIA NIM API key");
  }

  const response = await axios.post(
    NIM_CHAT_COMPLETIONS_URL,
    {
      model: NIM_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a backend debugging assistant. You will be given a masked error log. Only use evidence present in the log. Do not invent stack traces, line numbers, files, services, or runtime context. Output plain text only (no markdown). Provide: (1) Root cause, (2) Why it occurred, (3) Step-by-step solution, (4) Preventive measures."
        },
        { role: "user", content: `Masked error log:\n${maskedLog}` }
      ],
      max_tokens: 512,
      stream: false
    },
    {
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  const content =
    response?.data?.choices?.[0]?.message?.content ??
    response?.data?.choices?.[0]?.text ??
    null;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty AI response");
  }

  return content.trim();
}

// Submit error log
router.post("/submit", async (req, res) => {
  const { userId, rawLog } = req.body;

  try {
    const maskedLog = await maskLog(rawLog);
    const fingerprint = generateFingerprint(maskedLog);
    const legacyFingerprint = generateFingerprint(rawLog);

    let existingLog = await ErrorLog.findOne({
      userId,
      fingerprint: { $in: [fingerprint, legacyFingerprint] }
    });

    if (existingLog) {
      existingLog.hitCount += 1;
      await existingLog.save();

      return res.json({
        fromCache: true,
        solution: existingLog.aiSolution,
        _id: existingLog._id
      });
    }

    const aiSolution = await generateAiSolution(maskedLog);

    const newLog = new ErrorLog({
      userId,
      fingerprint,
      maskedLog,
      aiSolution
    });

    await newLog.save();

    res.json({
      fromCache: false,
      message: aiSolution,
      solution: aiSolution,
      _id: newLog._id
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get error log by ID
router.get('/get/:id', async (req, res) => {
  try {
    const log = await ErrorLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
