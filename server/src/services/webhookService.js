const axios = require('axios');
const crypto = require('crypto');
const WebhookSubscription = require('../models/WebhookSubscription');

/**
 * Fires an event to all subscribed webhooks.
 * @param {String} eventName - e.g. "campaign.completed"
 * @param {Object} payload - The data to send
 */
exports.fireWebhook = async (eventName, payload) => {
  try {
    const subscriptions = await WebhookSubscription.find({ event: eventName, isActive: true });
    
    if (subscriptions.length === 0) return;

    const eventPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload
    };

    const promises = subscriptions.map(sub => {
      const headers = { 'Content-Type': 'application/json' };
      
      if (sub.secret) {
        const signature = crypto
          .createHmac('sha256', sub.secret)
          .update(JSON.stringify(eventPayload))
          .digest('hex');
        headers['X-Xeno-Signature'] = signature;
      }

      // Fire and forget (in a real system we would queue this via BullMQ for retries)
      return axios.post(sub.targetUrl, eventPayload, { headers, timeout: 5000 })
        .catch(err => console.warn(`[Webhook Error] Failed to send ${eventName} to ${sub.targetUrl}: ${err.message}`));
    });

    await Promise.allSettled(promises);
    console.log(`[Webhook] Fired ${eventName} to ${subscriptions.length} endpoints.`);
  } catch (error) {
    console.error(`[Webhook Service Error]`, error);
  }
};
