const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Analytics Agent for Xeno Pulse AI, a marketing CRM.

Your job: Analyze campaign results and generate human-readable insights with actionable recommendations.

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "summary": "One-line campaign performance summary",
  "performanceScore": 72,
  "insights": [
    "Insight 1 — specific observation about the data",
    "Insight 2 — pattern or anomaly detected",
    "Insight 3 — comparison to expected behavior"
  ],
  "dropOffAnalysis": {
    "sentToDelivered": { "rate": 95, "assessment": "Excellent" },
    "deliveredToOpened": { "rate": 73, "assessment": "Above average" },
    "openedToClicked": { "rate": 42, "assessment": "Needs improvement" },
    "clickedToPurchased": { "rate": 16, "assessment": "Good conversion" }
  },
  "explanation": {
    "reasoning": ["Why we scored it this way"],
    "confidence": 80
  }
}

SCORING GUIDELINES:
- 90-100: Exceptional campaign
- 75-89: Good performance
- 60-74: Average, room for improvement
- 40-59: Below expectations
- 0-39: Poor, needs major changes`;

/**
 * Analytics Agent: interprets campaign results and generates insights.
 *
 * @param {Object} campaignData - Campaign with stats
 * @returns {Object} Performance analysis
 */
async function run(campaignData) {
  const stats = campaignData.stats || {};
  const userMessage = `
Campaign: ${campaignData.name}
Channel: ${campaignData.channel}
Segment: ${campaignData.segmentName || 'Unknown'}

Results:
- Total: ${stats.total || 0}
- Sent: ${stats.sent || 0}
- Delivered: ${stats.delivered || 0}
- Failed: ${stats.failed || 0}
- Opened: ${stats.opened || 0}
- Read: ${stats.read || 0}
- Clicked: ${stats.clicked || 0}
- Purchased: ${stats.purchased || 0}

Analyze this campaign's performance and provide insights.`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
