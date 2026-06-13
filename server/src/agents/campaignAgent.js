const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Campaign Agent for Xeno Pulse AI, a marketing CRM.

Your job: Given a marketing goal and audience segment, create compelling personalized messages.

You must generate 4 message variants with different tones and approaches.

TEMPLATE VARIABLES AVAILABLE:
- {{name}} — customer's first name
- {{city}} — customer's city
- {{totalOrders}} — their total order count
- {{totalSpent}} — their total spend

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "campaignName": "Catchy campaign name",
  "variants": [
    {
      "variantId": "A",
      "message": "The message text with {{name}} variables",
      "tone": "friendly | urgent | formal | playful | fomo",
      "approach": "Brief description of the approach",
      "predictedCTR": 12
    },
    { "variantId": "B", ... },
    { "variantId": "C", ... },
    { "variantId": "D", ... }
  ],
  "recommendedVariant": "A",
  "recommendationReason": "Why this variant is expected to perform best",
  "explanation": {
    "reasoning": ["Reason 1", "Reason 2"],
    "confidence": 80
  }
}

GUIDELINES:
- Messages should feel personal, not spammy
- Always include {{name}} for personalization
- Include a clear CTA (Call to Action) in each variant
- Vary the approach: one friendly, one urgent/FOMO, one value-driven, one casual
- Keep messages under 160 characters for SMS, under 300 for WhatsApp
- Predicted CTR should be realistic (5-25%)
- Use emojis sparingly for WhatsApp/SMS, avoid for email`;

/**
 * Campaign Agent: generates 4 message variants for a campaign.
 *
 * @param {string} goal - Marketing goal, e.g. "Bring back inactive customers"
 * @param {Object} audienceInfo - Segment name, size, characteristics
 * @param {string} channel - "whatsapp", "sms", or "email"
 * @param {Array} pastLearnings - past campaign learnings for better copy
 * @returns {Object} Campaign with 4 message variants
 */
async function run(goal, audienceInfo, channel = 'whatsapp', pastLearnings = []) {
  const learningContext = pastLearnings.length > 0
    ? `\n\nPAST CAMPAIGN LEARNINGS (apply these insights to improve messages):\n${pastLearnings.slice(0, 3).map((l, i) => `${i + 1}. ${l.channelUsed} campaign scored ${l.performanceScore}/100 — ${l.recommendations?.slice(0, 2).join('; ')}`).join('\n')}`
    : '';

  const userMessage = `
Goal: ${goal}
Channel: ${channel}
Audience: ${audienceInfo.segmentName || 'Target Segment'} (${audienceInfo.audienceSize || 'unknown'} customers)
Audience Description: ${audienceInfo.description || 'No additional description'}
${learningContext}
Create 4 message variants for this campaign.`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
