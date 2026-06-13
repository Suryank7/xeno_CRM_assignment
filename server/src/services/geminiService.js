const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini API service — single client reused across all agents.
 *
 * Each agent calls generateJSON() with its own system prompt + user message.
 * The response is always parsed as structured JSON.
 */

let genAI = null;
let model = null;

function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will be disabled');
    return;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('✅ Gemini AI initialized');
}

/**
 * Generate a structured JSON response from Gemini.
 *
 * @param {string} systemPrompt - Agent-specific system instructions
 * @param {string} userMessage - The actual request/context
 * @returns {Object} Parsed JSON response
 */
async function generateJSON(systemPrompt, userMessage) {
  if (!model) {
    throw new Error('Gemini not initialized. Set GEMINI_API_KEY in .env');
  }

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemPrompt }],
    },
  });

  const result = await chat.sendMessage(userMessage);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    // If Gemini wraps in markdown code block, extract the JSON
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Generate a free-text response (for chat mode).
 */
async function generateText(systemPrompt, userMessage) {
  if (!model) {
    throw new Error('Gemini not initialized. Set GEMINI_API_KEY in .env');
  }

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemPrompt }],
    },
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

module.exports = { initGemini, generateJSON, generateText };
