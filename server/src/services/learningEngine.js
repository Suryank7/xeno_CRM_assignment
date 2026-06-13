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

  // A/B Test Auto-Winner Selection
  if (campaign.messageVariants && campaign.messageVariants.length > 0) {
    const Message = require('../models/Message');
    const variantStats = await Message.aggregate([
      { $match: { campaignId: campaign._id, variantId: { $ne: null } } },
      { $group: {
          _id: '$variantId',
          total: { $sum: 1 },
          clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
          purchased: { $sum: { $cond: [{ $eq: ['$status', 'purchased'] }, 1, 0] } }
        }
      }
    ]);

    if (variantStats.length > 0) {
      // Sort by purchased first, then clicked
      variantStats.sort((a, b) => {
        if (b.purchased !== a.purchased) return b.purchased - a.purchased;
        return b.clicked - a.clicked;
      });

      const winnerId = variantStats[0]._id;

      // Update the campaign record
      await Campaign.updateOne(
        { _id: campaign._id, 'messageVariants.variantId': winnerId },
        { $set: { 'messageVariants.$.isWinner': true } }
      );

      // Mutate the local campaign object for the AI orchestrator to see it
      campaign.messageVariants.forEach(v => {
        if (v.variantId === winnerId) v.isWinner = true;
      });
      campaign.winnerVariantId = winnerId;
    }
  }

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

  // Anomaly Detection (Sprint 3)
  const Anomaly = require('../models/Anomaly');
  const stats = campaign.stats || {};
  const totalSent = stats.sent || 0;
  
  if (totalSent > 0) {
    const failureRate = (stats.failed || 0) / totalSent;
    const openRate = stats.delivered > 0 ? (stats.opened || 0) / stats.delivered : 0;
    
    if (failureRate > 0.2) {
      await Anomaly.create({
        campaignId: campaign._id,
        type: 'HIGH_FAILURE_RATE',
        severity: 'high',
        description: `High delivery failure rate detected: ${(failureRate * 100).toFixed(1)}%`,
        aiExplanation: 'The channel service rejected or failed to deliver a significant portion of messages. This could indicate stale contact details or an upstream carrier issue.'
      });
    }

    if (openRate < 0.15 && campaign.channel === 'email') {
      await Anomaly.create({
        campaignId: campaign._id,
        type: 'LOW_OPEN_RATE',
        severity: 'medium',
        description: `Low open rate detected: ${(openRate * 100).toFixed(1)}%`,
        aiExplanation: 'The open rate is significantly below the 15% threshold for emails. Consider optimizing subject lines or checking deliverability (spam placement).'
      });
    }
  }

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
