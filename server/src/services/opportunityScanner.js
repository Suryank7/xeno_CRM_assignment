const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');

/**
 * Feature 1: AI Opportunity Discovery
 *
 * Scans the customer database for predefined behavioral patterns
 * and generates opportunity cards for the dashboard.
 */

const OPPORTUNITY_PATTERNS = [
  {
    title: 'Churning VIP Customers',
    description: 'High-value customers who haven\'t purchased in 45+ days. Win them back before they churn permanently.',
    query: { totalSpent: { $gt: 5000 }, lastOrderDate: { $lt: daysAgo(45) } },
    suggestedAction: 'Win-back Campaign',
    priority: 'high',
    revenueMultiplier: 0.15, // 15% of their avg spend as potential revenue
  },
  {
    title: 'Rising Stars',
    description: 'Customers with 3+ orders in the last 30 days — they\'re building a habit. Nurture them.',
    query: { totalOrders: { $gte: 3 }, lastOrderDate: { $gte: daysAgo(30) } },
    suggestedAction: 'Loyalty Reward Campaign',
    priority: 'medium',
    revenueMultiplier: 0.20,
  },
  {
    title: 'One-Time Buyers at Risk',
    description: 'Customers who purchased once and haven\'t returned in 30+ days. Convert them to repeat buyers.',
    query: { totalOrders: 1, lastOrderDate: { $lt: daysAgo(30) } },
    suggestedAction: 'Second Purchase Campaign',
    priority: 'high',
    revenueMultiplier: 0.10,
  },
  {
    title: 'High-Spend Silent Customers',
    description: 'Spent ₹10,000+ but no activity in 60+ days. They used to love you — remind them.',
    query: { totalSpent: { $gte: 10000 }, lastOrderDate: { $lt: daysAgo(60) } },
    suggestedAction: 'Premium Win-back Campaign',
    priority: 'high',
    revenueMultiplier: 0.25,
  },
  {
    title: 'Young Weekend Shoppers',
    description: 'Customers aged 18-28 who tend to be active on weekends. Great for flash sales.',
    query: { age: { $gte: 18, $lte: 28 }, totalOrders: { $gte: 2 } },
    suggestedAction: 'Weekend Flash Sale',
    priority: 'medium',
    revenueMultiplier: 0.12,
  },
  {
    title: 'Discount-Sensitive Segment',
    description: 'Customers with high discount sensitivity who respond well to offers.',
    query: { 'digitalTwin.discountSensitivity': 'high', totalOrders: { $gte: 1 } },
    suggestedAction: 'Targeted Discount Campaign',
    priority: 'medium',
    revenueMultiplier: 0.18,
  },
];

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Scan for all opportunities and store them in the DB.
 * Returns the discovered opportunities.
 */
async function scanOpportunities() {
  console.log('🔍 Scanning for opportunities...');
  const opportunities = [];

  for (const pattern of OPPORTUNITY_PATTERNS) {
    try {
      const customers = await Customer.find(pattern.query).lean();
      const audienceSize = customers.length;

      if (audienceSize === 0) continue;

      const avgSpend = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / audienceSize;
      const potentialRevenue = Math.round(audienceSize * avgSpend * pattern.revenueMultiplier);

      const opportunity = await Opportunity.findOneAndUpdate(
        { title: pattern.title },
        {
          title: pattern.title,
          description: pattern.description,
          audienceSize,
          potentialRevenue,
          suggestedAction: pattern.suggestedAction,
          segmentRules: pattern.query,
          priority: pattern.priority,
          status: 'new',
        },
        { upsert: true, new: true }
      );

      opportunities.push(opportunity);
      console.log(`  📊 ${pattern.title}: ${audienceSize} customers, ₹${potentialRevenue.toLocaleString()} potential`);
    } catch (err) {
      console.warn(`  ⚠️  Pattern "${pattern.title}" failed:`, err.message);
    }
  }

  console.log(`✅ Found ${opportunities.length} opportunities`);
  return opportunities;
}

module.exports = { scanOpportunities };
