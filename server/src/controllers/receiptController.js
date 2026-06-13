const Campaign = require('../models/Campaign');
const Message = require('../models/Message');
const { AppError } = require('../middleware/errorHandler');

/**
 * Valid status transitions — a message can only move forward.
 * This prevents out-of-order callbacks from corrupting state.
 */
const STATUS_ORDER = ['queued', 'sent', 'delivered', 'opened', 'read', 'clicked', 'purchased'];

function isValidTransition(currentStatus, newStatus) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  // "failed" can happen at any stage after "sent"
  if (newStatus === 'failed') return currentIndex >= 1;
  return newIndex > currentIndex;
}

/**
 * Status-to-stat field mapping for incrementing campaign stats.
 */
const STATUS_TO_STAT = {
  delivered: 'delivered',
  failed: 'failed',
  opened: 'opened',
  read: 'read',
  clicked: 'clicked',
  purchased: 'purchased',
};

/**
 * Receive delivery status callback from channel service.
 * POST /api/receipt
 *
 * Expected body: { messageId, campaignId, status }
 */
exports.receiveReceipt = async (req, res, next) => {
  try {
    const { messageId, campaignId, status } = req.body;

    if (!messageId || !campaignId || !status) {
      throw new AppError('messageId, campaignId, and status are required', 400);
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) throw new AppError('Message not found', 404);

    // Idempotency: check if we've already processed this exact status
    const alreadyHasStatus = message.statusHistory.some((h) => h.status === status);
    if (alreadyHasStatus) {
      return res.json({ success: true, message: 'Duplicate callback ignored' });
    }

    // Validate transition order
    if (!isValidTransition(message.status, status)) {
      return res.json({
        success: true,
        message: `Invalid transition from ${message.status} to ${status}, ignored`,
      });
    }

    // Update message
    message.status = status;
    message.statusHistory.push({ status, timestamp: new Date() });
    message.lastUpdatedAt = new Date();
    await message.save();

    // Update campaign stats atomically
    const statField = STATUS_TO_STAT[status];
    if (statField) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { [`stats.${statField}`]: 1 },
      });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    // If it fails internally, try to save to DLQ
    try {
      const FailedCallback = require('../models/FailedCallback');
      await FailedCallback.create({
        messageId: req.body.messageId || 'unknown',
        campaignId: req.body.campaignId || 'unknown',
        status: req.body.status || 'unknown',
        error: error.message,
        payload: req.body
      });
    } catch (dlqErr) {
      console.error('Failed to write to DLQ:', dlqErr.message);
    }
    next(error);
  }
};

/**
 * Handle Dead-Letter Queue items sent explicitly from the channel service
 * POST /api/receipt/dlq
 */
exports.handleDLQ = async (req, res, next) => {
  try {
    const FailedCallback = require('../models/FailedCallback');
    const { messageId, campaignId, status, error, payload } = req.body;
    
    await FailedCallback.create({
      messageId: messageId || 'unknown',
      campaignId: campaignId || 'unknown',
      status: status || 'unknown',
      error: error || 'Max retries exceeded by channel simulator',
      payload: payload || req.body
    });

    res.json({ success: true, message: 'DLQ item recorded' });
  } catch (error) {
    next(error);
  }
};
