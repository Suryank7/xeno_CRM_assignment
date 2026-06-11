const Campaign = require('../models/Campaign');
const Learning = require('../models/Learning');
const { runPostCampaignAnalysis } = require('../agents/orchestrator');

/**
 * Feature 12: Self-Learning Engine
 *
 * After a campaign completes, analyze its performance and store
 * learnings that improve future campaigns.
 */

/**
 * Analyze a completed campaign and store learnings.
 *
 * @param {string} campaignId - The completed campaign's ID
 * @returns {Object} The analysis results and stored learning
 */
async function learnFromCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId).populate('segmentId').lean();
  if (!campaign) throw new Error('Campaign not found');

  // Get past learnings for context
  const pastLearnings = await Learning.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Run the analytics + optimization agents
  const analysis = await runPostCampaignAnalysis(
    {
      ...campaign,
      segmentName: campaign.segmentId?.name || 'Unknown',
    },
    pastLearnings
  );

  // Store the learning
  const learning = await Learning.create({
    campaignId: campaign._id,
    insights: analysis.learnings.insights || [],
    recommendations: analysis.learnings.recommendations || [],
    performanceScore: analysis.analytics.performanceScore || 0,
    segmentType: campaign.segmentId?.name || 'Unknown',
    channelUsed: campaign.channel,
  });

  return { analysis, learning };
}

/**
 * Get recent learnings for the dashboard feed.
 */
async function getRecentLearnings(limit = 10) {
  return Learning.find()
    .populate('campaignId', 'name channel')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

module.exports = { learnFromCampaign, getRecentLearnings };
