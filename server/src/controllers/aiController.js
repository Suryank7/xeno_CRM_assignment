const { runGrowthPipeline, runAutonomousPlan, runPostCampaignAnalysis } = require('../agents/orchestrator');
const audienceAgent = require('../agents/audienceAgent');
const campaignAgent = require('../agents/campaignAgent');
const channelAgent = require('../agents/channelAgent');
const { scanOpportunities } = require('../services/opportunityScanner');
const { generatePersonas } = require('../services/personaService');
const { learnFromCampaign, getRecentLearnings } = require('../services/learningEngine');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const Persona = require('../models/Persona');
const Opportunity = require('../models/Opportunity');
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
