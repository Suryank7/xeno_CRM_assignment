const { generateJSON } = require('../services/geminiService');

const SYSTEM_PROMPT = `You are the Audience Agent for Xeno Pulse AI, a marketing CRM.

Your job: Convert natural language audience descriptions into MongoDB-compatible filter queries.

CUSTOMER DATA SCHEMA:
- name (String)
- email (String)
- phone (String)
- age (Number) — customer's age
- city (String) — Indian cities
- totalOrders (Number) — lifetime order count
- totalSpent (Number) — lifetime spend in ₹
- lastOrderDate (Date) — most recent order date
- tags (Array of String) — e.g. "vip", "frequent", "inactive", "young", "coffee", "electronics"
- digitalTwin.churnRisk (String) — "low", "medium", "high"
- digitalTwin.preferredChannel (String) — "whatsapp", "sms", "email"
- digitalTwin.discountSensitivity (String) — "low", "medium", "high"

SPECIAL KEY:
- Use "daysSinceLastOrder" with $gt/$lt operators for time-based filters.
  Example: { "daysSinceLastOrder": { "$gt": 60 } } means "last order was more than 60 days ago"

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "segmentName": "Human-readable segment name",
  "description": "What this segment represents",
  "rules": { MongoDB-compatible filter object },
  "estimatedBehavior": "Brief description of expected customer behavior",
  "explanation": {
    "reasoning": ["Reason 1", "Reason 2", "Reason 3"],
    "confidence": 85
  }
}

IMPORTANT:
- Use proper MongoDB operators: $gt, $lt, $gte, $lte, $in, $regex, $exists
- For date comparisons, ALWAYS use "daysSinceLastOrder" with $gt/$lt
- Keep segment names concise and marketing-friendly
- Provide 2-4 clear reasoning points
- Confidence should be 60-95 based on how well the NL maps to structured filters`;

/**
 * Audience Agent: converts natural language to MongoDB segment rules.
 *
 * @param {string} naturalLanguageQuery - e.g. "Customers who haven't bought in 60 days"
 * @param {Object} customerStats - optional aggregate stats for context
 * @param {Array} pastLearnings - past campaign learnings for smarter decisions
 * @returns {Object} Structured segment definition
 */
async function run(naturalLanguageQuery, customerStats = {}, pastLearnings = []) {
  const context = customerStats.totalCustomers
    ? `\nCurrent database has ${customerStats.totalCustomers} customers, ${customerStats.activeCustomers} active, ${customerStats.inactiveCustomers} inactive. Average spend: ₹${customerStats.avgSpent}.`
    : '';

  const learningContext = pastLearnings.length > 0
    ? `\n\nPAST CAMPAIGN LEARNINGS (use these to make smarter decisions):\n${pastLearnings.slice(0, 3).map((l, i) => `${i + 1}. Segment: ${l.segmentType}, Channel: ${l.channelUsed}, Score: ${l.performanceScore}/100 — ${l.insights?.slice(0, 2).join('; ')}`).join('\n')}`
    : '';

  const userMessage = `Create an audience segment for: "${naturalLanguageQuery}"${context}${learningContext}`;

  return generateJSON(SYSTEM_PROMPT, userMessage);
}

module.exports = { run };
