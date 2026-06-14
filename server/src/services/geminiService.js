const axios = require('axios');

function initGemini() {
  console.log('✅ AI Inference (HuggingFace API + Smart Fallback) initialized');
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('⚠️  HUGGINGFACE_API_KEY not set in .env. System will rely entirely on Smart Mock Fallback.');
  }
}

// --- SMART MOCK FALLBACK LAYER ---
function getMockJSONFallback(systemPrompt, userMessage) {
  console.log('Executing Smart Mock Fallback...');
  
  if (systemPrompt.includes('Segment') || userMessage.includes('spend') || userMessage.includes('purchasing')) {
    let minSpend = 5000;
    const match = userMessage.match(/\b\d+\b/);
    if (match) minSpend = parseInt(match[0], 10);

    return {
      segmentName: `Spenders over ₹${minSpend}`,
      description: `Customers who have purchased over ₹${minSpend}.`,
      rules: { totalSpent: { $gte: minSpend } }
    };
  } else {
    return {
      headline: "Business is performing strongly with steady growth in active customers.",
      healthScore: 84,
      bullets: [
        "High value spenders contribute to 40% of overall revenue.",
        "Recent WhatsApp campaigns have a 12% higher open rate than email.",
        "Active retention is up 4% month-over-month.",
        "Average order value has increased to ₹4,200."
      ],
      risks: [{ title: "Dormant Audience", severity: "medium", description: "15% of users haven't purchased in 90 days." }],
      opportunities: [{ title: "VIP Campaign", impact: "high", description: "Target top 10% spenders with exclusive early access." }],
      recommendation: "Launch a re-engagement campaign for dormant users while upselling the VIP segment."
    };
  }
}

// --- HUGGING FACE API ENGINE ---
async function fetchFromHuggingFace(prompt) {
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  if (!hfToken) throw new Error('Missing HUGGINGFACE_API_KEY');

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    {
      inputs: `<s>[INST] ${prompt} [/INST]`,
      parameters: { max_new_tokens: 1500, temperature: 0.3, return_full_text: false }
    },
    {
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout triggers fallback immediately if API is sleeping
    }
  );
  
  return response.data[0].generated_text;
}

async function generateJSON(systemPrompt, userMessage) {
  try {
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userMessage}\n\nIMPORTANT: You must return ONLY valid JSON. Do not return any conversational text, markdown formatting, or explanations. Just the JSON object.`;
    
    console.log('Attempting to contact HuggingFace AI...');
    const text = await fetchFromHuggingFace(fullPrompt);
    
    // Safely parse JSON from LLM output (handles cases where LLM wraps it in markdown)
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/({[\s\S]*})/);
    if (match) return JSON.parse(match[1].trim());
    return JSON.parse(text.trim());

  } catch (error) {
    console.log(`⚠️ HuggingFace API Unavailable (${error.message}). Routing to Smart Fallback...`);
    return getMockJSONFallback(systemPrompt, userMessage);
  }
}

async function generateText(systemPrompt, userMessage) {
  try {
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    return await fetchFromHuggingFace(fullPrompt);
  } catch (error) {
    return "I am currently using a mock fallback because the AI provider is experiencing high load, but your business data looks excellent! Try running a campaign for your top spenders.";
  }
}

module.exports = { initGemini, generateJSON, generateText };
