const audienceAgent = require('./audienceAgent');
const campaignAgent = require('./campaignAgent');
const channelAgent = require('./channelAgent');
const analyticsAgent = require('./analyticsAgent');
const optimizationAgent = require('./optimizationAgent');
const Customer = require('../models/Customer');
const { buildMongoQuery } = require('../controllers/segmentController');

/**
 * Agent Orchestrator — chains all 5 agents in sequence.
 *
 * Flow:
 *   Goal → Audience Agent → Campaign Agent → Channel Agent
 *   Results → Analytics Agent → Optimization Agent → Learnings
 *
 * Each agent's output becomes context for the next.
 */

/**
 * Run the full growth pipeline: from goal to campaign-ready plan.
 * Used by the AI Chat copilot for end-to-end campaign creation.
 *
 * @param {string} goal - Marketer's intent, e.g. "Bring back churning VIPs"
 * @param {Object} customerStats - Aggregate stats from DB
 * @returns {Object} Complete campaign plan ready for marketer approval
 */
async function runGrowthPipeline(goal, customerStats = {}) {
  console.log(`🤖 Running Growth Pipeline for goal: "${goal}"`);

  // Step 1: Audience Agent — find the right customers
  console.log('  → Step 1: Audience Agent');
  const audience = await audienceAgent.run(goal, customerStats);

  // Calculate actual audience size from DB
  let audienceSize = 0;
  try {
    const mongoQuery = buildMongoQuery(audience.rules || {});
    audienceSize = await Customer.countDocuments(mongoQuery);
  } catch (err) {
    console.warn('  ⚠️  Could not calculate audience size:', err.message);
  }
  audience.audienceSize = audienceSize;

  // Step 2: Channel Agent — pick the best channel
  console.log('  → Step 2: Channel Agent');
  const channelPrediction = await channelAgent.run(audience, { goal });

  // Step 3: Campaign Agent — create message variants
  console.log('  → Step 3: Campaign Agent');
  const campaign = await campaignAgent.run(
    goal,
    audience,
    channelPrediction.recommendation || 'whatsapp'
  );

  // Assemble the complete plan
  const plan = {
    goal,
    audience: {
      segmentName: audience.segmentName,
      description: audience.description,
      rules: audience.rules,
      audienceSize,
      explanation: audience.explanation,
    },
    channel: {
      recommendation: channelPrediction.recommendation,
      reasoning: channelPrediction.reasoning,
      predictions: channelPrediction.predictions,
      explanation: channelPrediction.explanation,
    },
    campaign: {
      name: campaign.campaignName,
      variants: campaign.variants,
      recommendedVariant: campaign.recommendedVariant,
      recommendationReason: campaign.recommendationReason,
      explanation: campaign.explanation,
    },
    ready: true,
    summary: `Found ${audienceSize} customers matching "${audience.segmentName}". Recommended ${channelPrediction.recommendation} with ${campaign.variants?.length || 0} message variants ready.`,
  };

  console.log(`  ✅ Pipeline complete: ${audienceSize} customers, ${channelPrediction.recommendation} channel`);
  return plan;
}

/**
 * Run the autonomous campaign mode: from revenue goal to multi-campaign plan.
 * Used for Feature 9: "Increase revenue by ₹50,000"
 *
 * @param {string} revenueGoal - e.g. "Increase revenue by ₹50,000 this month"
 * @param {Object} customerStats - Aggregate stats
 * @returns {Object} Multi-campaign plan
 */
async function runAutonomousPlan(revenueGoal, customerStats = {}) {
  console.log(`🤖 Running Autonomous Plan for: "${revenueGoal}"`);

  // Generate 3 different campaign opportunities
  const campaigns = [];
  const subGoals = [
    `Win back churning VIP customers to ${revenueGoal}`,
    `Upsell to frequent active buyers to ${revenueGoal}`,
    `Reactivate one-time buyers to ${revenueGoal}`,
  ];

  for (const subGoal of subGoals) {
    try {
      const plan = await runGrowthPipeline(subGoal, customerStats);
      campaigns.push(plan);
    } catch (err) {
      console.warn(`  ⚠️  Sub-goal failed: ${subGoal}`, err.message);
    }
  }

  const totalPredictedRevenue = campaigns.reduce((sum, c) => {
    const avgConversion = c.channel?.predictions?.[0]?.conversion || 5;
    const avgOrderValue = customerStats.avgSpent || 1000;
    return sum + (c.audience.audienceSize * (avgConversion / 100) * avgOrderValue);
  }, 0);

  return {
    revenueGoal,
    campaigns,
    totalPredictedRevenue: Math.round(totalPredictedRevenue),
    summary: `Generated ${campaigns.length} campaigns targeting ${campaigns.reduce((s, c) => s + c.audience.audienceSize, 0)} customers. Predicted revenue: ₹${Math.round(totalPredictedRevenue).toLocaleString()}.`,
    ready: true,
  };
}

/**
 * Run post-campaign analysis: Analytics Agent → Optimization Agent.
 *
 * @param {Object} campaignData - Completed campaign with stats
 * @param {Array} pastLearnings - Previous learnings
 * @returns {Object} Analysis + learnings
 */
async function runPostCampaignAnalysis(campaignData, pastLearnings = []) {
  console.log(`🤖 Running Post-Campaign Analysis for: "${campaignData.name}"`);

  const analytics = await analyticsAgent.run(campaignData);
  const learnings = await optimizationAgent.run(campaignData, pastLearnings);

  return {
    analytics,
    learnings,
    summary: `Campaign scored ${analytics.performanceScore}/100. Generated ${learnings.recommendations?.length || 0} recommendations for improvement.`,
  };
}

module.exports = { runGrowthPipeline, runAutonomousPlan, runPostCampaignAnalysis };
