const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Executive Briefing Agent for Xeno Pulse AI, a marketing CRM.

Your job: Generate a concise, insight-rich executive summary from raw business metrics.
Write as if briefing a CEO who has 30 seconds to read.

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "headline": "One bold sentence summarizing business health",
  "healthScore": 78,
  "bullets": [
    "Key insight about customer growth or decline",
    "Key insight about campaign effectiveness",
    "Key insight about revenue trends",
    "Most urgent action item"
  ],
  "risks": [
    { "title": "Risk name", "severity": "high|medium|low", "description": "Brief explanation" }
  ],
  "opportunities": [
    { "title": "Quick win name", "impact": "high|medium", "description": "What to do" }
  ],
  "recommendation": "The single most important thing to do this week"
}

GUIDELINES:
- healthScore: 0-100 based on overall business trajectory
- Be specific with numbers — "12% increase" not "some increase"
- Compare active vs inactive customer ratios
- Flag if churn indicators are above 30%
- Maximum 4 bullets, maximum 3 risks, maximum 3 opportunities
- recommendation should be a single actionable sentence`;

/**
 * Executive Briefing Agent: generates a 30-second business health snapshot.
 *
 * @param {Object} stats - Customer aggregate stats
 * @param {Object} campaignMetrics - Recent campaign performance
 * @param {Array} opportunities - Active growth opportunities
 * @param {Array} learnings - Recent AI learnings
 * @returns {Object} Executive briefing
 */
async function run(stats = {}, campaignMetrics = {}, opportunities = [], learnings = []) {
  const userMessage = `
Business Metrics:
- Total Customers: ${stats.totalCustomers || 0}
- Active (30 days): ${stats.activeCustomers || 0}
- Inactive (90+ days): ${stats.inactiveCustomers || 0}
- Average Spend: ₹${stats.avgSpent || 0}
- Total Revenue: ₹${stats.totalRevenue || 0}

Campaign Metrics:
- Total Campaigns: ${campaignMetrics.totalCampaigns || 0}
- Completed Campaigns: ${campaignMetrics.completedCampaigns || 0}
- Average Delivery Rate: ${campaignMetrics.avgDeliveryRate || 0}%
- Average Open Rate: ${campaignMetrics.avgOpenRate || 0}%
- Average Conversion Rate: ${campaignMetrics.avgConversionRate || 0}%

Active Growth Opportunities: ${opportunities.length}
${opportunities.slice(0, 3).map(o => `  - ${o.title}: ${o.audienceSize} customers, ₹${o.potentialRevenue?.toLocaleString()} potential`).join('\n')}

Recent AI Learnings: ${learnings.length}
${learnings.slice(0, 3).map(l => `  - Score: ${l.performanceScore}/100 — ${l.insights?.[0] || 'No insight'}`).join('\n')}

Generate an executive briefing based on these metrics.`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
