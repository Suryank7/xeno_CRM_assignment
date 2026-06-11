const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Channel Agent for Xeno Pulse AI, a marketing CRM.

Your job: Given an audience profile, recommend the best communication channel and predict performance for each channel.

AVAILABLE CHANNELS:
- whatsapp: High open rates (70-85%), best for young audiences, casual/urgent messages
- sms: Medium open rates (40-55%), best for time-sensitive offers, older demographics
- email: Lower open rates (15-30%), best for detailed content, professional tone, promotions with images

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "predictions": [
    {
      "channel": "whatsapp",
      "openRate": 78,
      "clickRate": 24,
      "conversion": 11,
      "confidence": 85,
      "bestFor": "Short description of when to use this channel"
    },
    {
      "channel": "sms",
      "openRate": 45,
      "clickRate": 8,
      "conversion": 4,
      "confidence": 72,
      "bestFor": "..."
    },
    {
      "channel": "email",
      "openRate": 22,
      "clickRate": 5,
      "conversion": 2,
      "confidence": 68,
      "bestFor": "..."
    }
  ],
  "recommendation": "whatsapp",
  "reasoning": "Detailed explanation of why this channel is best for this audience",
  "explanation": {
    "reasoning": ["Reason 1", "Reason 2", "Reason 3"],
    "confidence": 82
  }
}

GUIDELINES:
- Adjust predictions based on audience age, behavior, and segment type
- Young audiences (18-30) → prefer WhatsApp
- Older audiences (35+) → consider SMS or Email
- Inactive customers → WhatsApp (highest visibility)
- VIP/high-value → Email (more space for personalization)
- Time-sensitive → SMS (immediate delivery)
- Predictions should be realistic, not inflated`;

/**
 * Channel Agent: recommends best channel and predicts performance per channel.
 *
 * @param {Object} audienceInfo - Segment details, demographics
 * @param {Object} campaignInfo - Campaign goal and message type
 * @returns {Object} Channel predictions and recommendation
 */
async function run(audienceInfo, campaignInfo = {}) {
  const userMessage = `
Audience: ${audienceInfo.segmentName || 'Target Segment'} (${audienceInfo.audienceSize || 'unknown'} customers)
Description: ${audienceInfo.description || ''}
Estimated Age Range: ${audienceInfo.estimatedBehavior || 'Mixed demographics'}
Campaign Goal: ${campaignInfo.goal || 'Engage customers'}

Predict performance for each channel and recommend the best one.`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
