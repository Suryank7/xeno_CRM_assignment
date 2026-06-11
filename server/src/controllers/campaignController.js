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

/**
 * Launch a campaign: resolve segment, personalize messages, send to channel service.
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

    // Update campaign status
    campaign.status = 'sending';
    campaign.stats.total = customers.length;
    await campaign.save();

    // Create Message documents and send to channel service (fire-and-forget)
    // We respond immediately, sending happens in the background.
    res.json({
      success: true,
      message: `Campaign launched! Sending to ${customers.length} customers.`,
      data: campaign,
    });

    // --- Background sending loop ---
    for (const customer of customers) {
      const personalizedContent = renderTemplate(campaign.messageTemplate, {
        name: customer.name,
        city: customer.city,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
      });

      // Create message record
      const message = await Message.create({
        campaignId: campaign._id,
        customerId: customer._id,
        channel: campaign.channel,
        content: personalizedContent,
        status: 'queued',
        statusHistory: [{ status: 'queued', timestamp: new Date() }],
      });

      // Send to channel service (non-blocking, with basic error handling)
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

        // Mark as sent
        message.status = 'sent';
        message.sentAt = new Date();
        message.statusHistory.push({ status: 'sent', timestamp: new Date() });
        await message.save();

        campaign.stats.sent += 1;
      } catch (err) {
        message.status = 'failed';
        message.statusHistory.push({ status: 'failed', timestamp: new Date() });
        await message.save();

        campaign.stats.failed += 1;
        console.error(`Failed to send message ${message._id}: ${err.message}`);
      }
    }

    // Mark campaign as completed after all sends
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();
    console.log(`✅ Campaign ${campaign._id} completed: ${campaign.stats.sent} sent, ${campaign.stats.failed} failed`);
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
