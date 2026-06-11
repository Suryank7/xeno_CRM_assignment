const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Optimization Agent for Xeno Pulse AI, a marketing CRM.

Your job: Learn from completed campaign results and generate actionable recommendations that improve future campaigns. You close the intelligence loop.

You will receive campaign performance data AND past learnings from previous campaigns.

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "insights": [
    "Specific learning from this campaign",
    "Pattern detected across campaigns",
    "Audience behavior observation"
  ],
  "recommendations": [
    "Actionable recommendation for next campaign",
    "Channel optimization suggestion",
    "Message improvement suggestion"
  ],
  "performanceScore": 72,
  "segmentLearnings": "What we learned about this specific customer segment",
  "channelLearnings": "What we learned about the channel used",
  "messageLearnings": "What we learned about the message strategy"
}

GUIDELINES:
- Be specific, not generic. "Increase discount" is bad. "Increase discount from 10% to 20% for high-value churning customers" is good.
- Reference actual numbers from the campaign data
- Consider what worked AND what didn't
- If past learnings are provided, build on them (don't repeat the same advice)
- Each recommendation should be directly actionable`;

/**
 * Optimization Agent: learns from campaign results and generates improvements.
 *
 * @param {Object} campaignData - Completed campaign with stats
 * @param {Array} pastLearnings - Previous Learning documents for context
 * @returns {Object} Learnings and recommendations
 */
async function run(campaignData, pastLearnings = []) {
  const stats = campaignData.stats || {};
  const pastContext = pastLearnings.length > 0
    ? `\nPast Learnings:\n${pastLearnings.map((l, i) => `${i + 1}. ${l.insights?.join(', ')}`).join('\n')}`
    : '\nNo past learnings available yet.';

  const userMessage = `
Campaign: ${campaignData.name}
Channel: ${campaignData.channel}
Segment: ${campaignData.segmentName || 'Unknown'}

Results:
- Sent: ${stats.sent || 0}
- Delivered: ${stats.delivered || 0} (${stats.total ? Math.round((stats.delivered / stats.total) * 100) : 0}%)
- Opened: ${stats.opened || 0} (${stats.delivered ? Math.round((stats.opened / stats.delivered) * 100) : 0}%)
- Clicked: ${stats.clicked || 0} (${stats.opened ? Math.round((stats.clicked / stats.opened) * 100) : 0}%)
- Purchased: ${stats.purchased || 0} (${stats.clicked ? Math.round((stats.purchased / stats.clicked) * 100) : 0}%)
- Failed: ${stats.failed || 0}
${pastContext}

Analyze what happened and generate learnings to improve future campaigns.`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
