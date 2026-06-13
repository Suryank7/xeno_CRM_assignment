const { runGrowthPipeline, runAutonomousPlan, runPostCampaignAnalysis } = require('../agents/orchestrator');
const audienceAgent = require('../agents/audienceAgent');
const campaignAgent = require('../agents/campaignAgent');
const channelAgent = require('../agents/channelAgent');
const executiveAgent = require('../agents/executiveAgent');
const { scanOpportunities } = require('../services/opportunityScanner');
const { generatePersonas } = require('../services/personaService');
const { learnFromCampaign, getRecentLearnings } = require('../services/learningEngine');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const Persona = require('../models/Persona');
const Opportunity = require('../models/Opportunity');
const Learning = require('../models/Learning');
const { buildMongoQuery } = require('./segmentController');
const { AppError } = require('../middleware/errorHandler');

/**
 * Feature 4 + 9: AI Chat — full copilot conversation.
 * POST /api/ai/chat
 *
 * Detects intent and routes to the right pipeline:
 * - Revenue goals → Autonomous Plan (Feature 9)
 * - Campaign creation → Growth Pipeline (Feature 4)
 * - Segment queries → Audience Agent (Feature 2)
 */
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) throw new AppError('Message is required', 400);

    // Get customer stats for context
    const customerStats = await getCustomerStats();

    // Detect intent
    const lowerMsg = message.toLowerCase();
    const isRevenueGoal = /revenue|₹|rs\.?|rupee|earn|increase.*by|generate.*\d/i.test(lowerMsg);
    const isOpportunityQuery = /opportunit|discover|find.*opportunit|scan|what.*should/i.test(lowerMsg);
    const isPersonaQuery = /persona|tribe|cluster|who.*are.*customer|customer.*type/i.test(lowerMsg);

    let result;
    let type;

    if (isRevenueGoal) {
      type = 'autonomous_plan';
      result = await runAutonomousPlan(message, customerStats);
    } else if (isOpportunityQuery) {
      type = 'opportunities';
      result = { opportunities: await scanOpportunities() };
    } else if (isPersonaQuery) {
      type = 'personas';
      result = { personas: await generatePersonas() };
    } else {
      type = 'campaign_plan';
      result = await runGrowthPipeline(message, customerStats);
    }

    res.json({ success: true, type, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 1: Discover opportunities.
 * POST /api/ai/discover-opportunities
 */
exports.discoverOpportunities = async (req, res, next) => {
  try {
    const opportunities = await scanOpportunities();
    res.json({ success: true, data: opportunities });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 2: NL Audience Builder — suggest segment from natural language.
 * POST /api/ai/suggest-segment
 */
exports.suggestSegment = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) throw new AppError('Query is required', 400);

    const customerStats = await getCustomerStats();
    const result = await audienceAgent.run(query, customerStats);

    // Calculate actual audience size
    let audienceSize = 0;
    let sample = [];
    try {
      const mongoQuery = buildMongoQuery(result.rules || {});
      audienceSize = await Customer.countDocuments(mongoQuery);
      sample = await Customer.find(mongoQuery).limit(5).lean();
    } catch (err) {
      console.warn('Could not calculate audience:', err.message);
    }

    res.json({
      success: true,
      data: { ...result, audienceSize, sample },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 3: Generate AI personas.
 * POST /api/ai/generate-personas
 */
exports.generatePersonas = async (req, res, next) => {
  try {
    const personas = await generatePersonas();
    res.json({ success: true, data: personas });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 6: Generate message variants (tournament).
 * POST /api/ai/generate-message
 */
exports.generateMessage = async (req, res, next) => {
  try {
    const { goal, segmentName, audienceSize, channel } = req.body;
    if (!goal) throw new AppError('Goal is required', 400);

    const result = await campaignAgent.run(
      goal,
      { segmentName: segmentName || 'Target Audience', audienceSize, description: goal },
      channel || 'whatsapp'
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 5: Campaign Simulator — predict conversion per channel.
 * POST /api/ai/simulate-campaign
 */
exports.simulateCampaign = async (req, res, next) => {
  try {
    const { segmentName, audienceSize, description, goal } = req.body;

    const result = await channelAgent.run(
      { segmentName, audienceSize, description },
      { goal: goal || 'Engage customers' }
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 9: Autonomous campaign mode.
 * POST /api/ai/autonomous-plan
 */
exports.autonomousPlan = async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) throw new AppError('Goal is required', 400);

    const customerStats = await getCustomerStats();
    const result = await runAutonomousPlan(goal, customerStats);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 12: Post-campaign learning.
 * POST /api/ai/learn
 */
exports.learn = async (req, res, next) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId) throw new AppError('campaignId is required', 400);

    const result = await learnFromCampaign(campaignId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature 12: Get recent learnings.
 * GET /api/ai/learnings
 */
exports.getLearnings = async (req, res, next) => {
  try {
    const learnings = await getRecentLearnings();
    res.json({ success: true, data: learnings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get opportunities list.
 * GET /api/ai/opportunities
 */
exports.getOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ status: 'new' })
      .sort({ priority: 1, potentialRevenue: -1 })
      .lean();
    res.json({ success: true, data: opportunities });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personas list.
 * GET /api/ai/personas
 */
exports.getPersonas = async (req, res, next) => {
  try {
    const personas = await Persona.find().sort({ customerCount: -1 }).lean();
    res.json({ success: true, data: personas });
  } catch (error) {
    next(error);
  }
};

// --- Helper ---
async function getCustomerStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  const [total, active, inactive, stats] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ lastOrderDate: { $gte: thirtyDaysAgo } }),
    Customer.countDocuments({ lastOrderDate: { $lt: ninetyDaysAgo } }),
    Customer.aggregate([
      { $group: { _id: null, avgSpent: { $avg: '$totalSpent' }, totalRevenue: { $sum: '$totalSpent' } } },
    ]),
  ]);

  return {
    totalCustomers: total,
    activeCustomers: active,
    inactiveCustomers: inactive,
    avgSpent: Math.round(stats[0]?.avgSpent || 0),
    totalRevenue: Math.round(stats[0]?.totalRevenue || 0),
  };
}

/**
 * Executive Brief — AI-generated business health snapshot.
 * GET /api/ai/executive-brief
 */
exports.executiveBrief = async (req, res, next) => {
  try {
    const customerStats = await getCustomerStats();

    // Gather campaign metrics
    const campaigns = await Campaign.find().lean();
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const avgDeliveryRate = completedCampaigns.length > 0
      ? Math.round(completedCampaigns.reduce((sum, c) => sum + (c.stats?.total > 0 ? (c.stats.delivered / c.stats.total) * 100 : 0), 0) / completedCampaigns.length)
      : 0;
    const avgOpenRate = completedCampaigns.length > 0
      ? Math.round(completedCampaigns.reduce((sum, c) => sum + (c.stats?.delivered > 0 ? (c.stats.opened / c.stats.delivered) * 100 : 0), 0) / completedCampaigns.length)
      : 0;
    const avgConversionRate = completedCampaigns.length > 0
      ? Math.round(completedCampaigns.reduce((sum, c) => sum + (c.stats?.total > 0 ? (c.stats.purchased / c.stats.total) * 100 : 0), 0) / completedCampaigns.length)
      : 0;

    const campaignMetrics = {
      totalCampaigns: campaigns.length,
      completedCampaigns: completedCampaigns.length,
      avgDeliveryRate,
      avgOpenRate,
      avgConversionRate,
    };

    const opportunities = await Opportunity.find({ status: 'new' }).lean();
    const learnings = await Learning.find().sort({ createdAt: -1 }).limit(5).lean();

    const brief = await executiveAgent.run(customerStats, campaignMetrics, opportunities, learnings);

    res.json({ success: true, data: brief });
  } catch (error) {
    next(error);
  }
};

/**
 * Export customers as CSV.
 * GET /api/customers/export
 */
exports.exportCustomersCSV = async (req, res, next) => {
  try {
    const customers = await Customer.find().lean();
    
    const headers = ['Name', 'Email', 'Phone', 'Age', 'City', 'Total Orders', 'Total Spent', 'Last Order Date', 'Churn Risk', 'Preferred Channel', 'Tags'];
    const rows = customers.map(c => [
      c.name, c.email, c.phone || '', c.age || '', c.city || '',
      c.totalOrders, c.totalSpent, c.lastOrderDate ? new Date(c.lastOrderDate).toISOString().split('T')[0] : '',
      c.digitalTwin?.churnRisk || '', c.digitalTwin?.preferredChannel || '',
      (c.tags || []).join('; ')
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers_export.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export campaign report as CSV.
 * GET /api/ai/export/campaign/:id
 */
exports.exportCampaignCSV = async (req, res, next) => {
  try {
    const Campaign = require('../models/Campaign');
    const Message = require('../models/Message');

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) throw new AppError('Campaign not found', 404);

    const messages = await Message.find({ campaignId: campaign._id })
      .populate('customerId', 'name email phone')
      .lean();

    let csvData = 'Message ID,Customer Name,Customer Email,Channel,Status,Sent At\n';
    for (const msg of messages) {
      const c = msg.customerId || {};
      const sentAt = msg.sentAt ? msg.sentAt.toISOString() : '';
      csvData += `"${msg._id}","${c.name || ''}","${c.email || ''}","${msg.channel}","${msg.status}","${sentAt}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campaign_${req.params.id}_report.csv`);
    res.send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active anomalies for the dashboard.
 * GET /api/ai/anomalies
 */
exports.getAnomalies = async (req, res, next) => {
  try {
    const Anomaly = require('../models/Anomaly');
    const anomalies = await Anomaly.find({ resolved: false })
      .populate('campaignId', 'name channel')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ success: true, data: anomalies });
  } catch (error) {
    next(error);
  }
};
