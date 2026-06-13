const axios = require('axios');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Message = require('../models/Message');
const { buildMongoQuery } = require('./segmentController');
const { renderTemplate } = require('../utils/templateEngine');
const { AppError } = require('../middleware/errorHandler');

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';

/**
 * Create a new campaign.
 * POST /api/campaigns
 */
exports.createCampaign = async (req, res, next) => {
  try {
    const {
      name, segmentId, channel, messageTemplate,
      messageVariants, simulation, aiExplanation,
    } = req.body;

    if (!name || !segmentId || !channel || !messageTemplate) {
      throw new AppError('name, segmentId, channel, and messageTemplate are required', 400);
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) throw new AppError('Segment not found', 404);

    const campaign = await Campaign.create({
      name,
      segmentId,
      channel,
      messageTemplate,
      messageVariants: messageVariants || [],
      simulation: simulation || {},
      aiExplanation: aiExplanation || {},
      stats: { total: segment.audienceSize },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

// Helper function to process the campaign in the background
async function processCampaign(campaign, customers) {
  try {
    campaign.status = 'sending';
    await campaign.save();

    const hasVariants = campaign.messageVariants && campaign.messageVariants.length > 0;

    const BATCH_SIZE = 10;
    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(async (customer, index) => {
        // A/B Test Variant Selection (Round Robin)
        const globalIndex = i + index;
        let selectedVariant = null;
        let templateToUse = campaign.messageTemplate;

        if (hasVariants) {
          selectedVariant = campaign.messageVariants[globalIndex % campaign.messageVariants.length];
          templateToUse = selectedVariant.message;
        }

        const personalizedContent = renderTemplate(templateToUse, {
          name: customer.name,
          city: customer.city,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
        });

        const message = await Message.create({
          campaignId: campaign._id,
          customerId: customer._id,
          channel: campaign.channel,
          content: personalizedContent,
          variantId: selectedVariant ? selectedVariant.variantId : null,
          status: 'queued',
          statusHistory: [{ status: 'queued', timestamp: new Date() }],
        });

        try {
          await axios.post(`${CHANNEL_SERVICE_URL}/send`, {
            messageId: message._id.toString(),
            campaignId: campaign._id.toString(),
            recipient: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
            },
            channel: campaign.channel,
            content: personalizedContent,
            callbackUrl: `${process.env.CRM_BASE_URL || 'http://localhost:5000'}/api/receipt`,
          });

          message.status = 'sent';
          message.sentAt = new Date();
          message.statusHistory.push({ status: 'sent', timestamp: new Date() });
          await message.save();
          return 'sent';
        } catch (err) {
          message.status = 'failed';
          message.statusHistory.push({ status: 'failed', timestamp: new Date() });
          await message.save();
          console.error(`Failed to send message ${message._id}: ${err.message}`);
          return 'failed';
        }
      }));

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value === 'sent') campaign.stats.sent += 1;
        else campaign.stats.failed += 1;
      }
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();
    console.log(`✅ Campaign ${campaign._id} completed: ${campaign.stats.sent} sent, ${campaign.stats.failed} failed`);

    try {
      const { learnFromCampaign } = require('../services/learningEngine');
      const learningResult = await learnFromCampaign(campaign._id);
      console.log(`📚 Auto-learning complete: Score ${learningResult.analysis?.analytics?.performanceScore}/100`);
      
      const { fireWebhook } = require('../services/webhookService');
      await fireWebhook('campaign.completed', {
        campaignId: campaign._id,
        name: campaign.name,
        stats: campaign.stats
      });
    } catch (learnErr) {
      console.warn(`⚠️  Auto-learning or webhook failed: ${learnErr.message}`);
    }
  } catch (error) {
    console.error(`❌ Background processing failed for campaign ${campaign._id}:`, error);
    campaign.status = 'failed';
    await campaign.save();
  }
}

/**
 * Launch a campaign (send messages to its segment).
 * POST /api/campaigns/:id/launch
 */
exports.launchCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segmentId');
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status !== 'draft') throw new AppError('Campaign already launched', 400);

    const segment = campaign.segmentId;
    const mongoQuery = buildMongoQuery(segment.rules);
    const customers = await Customer.find(mongoQuery).lean();

    if (customers.length === 0) {
      throw new AppError('No customers match this segment', 400);
    }

    campaign.stats.total = customers.length;

    // Check if scheduled
    const now = new Date();
    if (campaign.scheduledAt && new Date(campaign.scheduledAt) > now) {
      const delayMs = new Date(campaign.scheduledAt) - now;
      campaign.status = 'scheduled';
      await campaign.save();

      // Simple scheduling via setTimeout (good for short delays/prototypes)
      setTimeout(() => processCampaign(campaign, customers), delayMs);
      console.log(`⏱️  Campaign ${campaign._id} scheduled to run in ${Math.round(delayMs / 1000)}s`);

      return res.json({
        success: true,
        message: `Campaign scheduled! Sending to ${customers.length} customers at ${new Date(campaign.scheduledAt).toLocaleString()}.`,
        data: campaign,
      });
    }

    // Otherwise, launch immediately
    campaign.status = 'sending';
    await campaign.save();

    res.json({
      success: true,
      message: `Campaign launched! Sending to ${customers.length} customers.`,
      data: campaign,
    });

    // Run in background
    processCampaign(campaign, customers);
  } catch (error) {
    next(error);
  }
};

/**
 * List all campaigns.
 * GET /api/campaigns
 */
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name audienceSize')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single campaign with live stats.
 * GET /api/campaigns/:id
 */
exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId')
      .lean();
    if (!campaign) throw new AppError('Campaign not found', 404);

    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual message statuses for a campaign.
 * GET /api/campaigns/:id/messages
 */
exports.getCampaignMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ campaignId: req.params.id })
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ campaignId: req.params.id }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated channel performance stats.
 * GET /api/campaigns/stats/channels
 */
exports.getChannelStats = async (req, res, next) => {
  try {
    const stats = await Campaign.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
          _id: '$channel',
          campaigns: { $sum: 1 },
          sent: { $sum: '$stats.sent' },
          delivered: { $sum: '$stats.delivered' },
          opened: { $sum: '$stats.opened' },
          clicked: { $sum: '$stats.clicked' },
          purchased: { $sum: '$stats.purchased' }
        }
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
