const express = require('express');
const cors = require('cors');
const { simulateDelivery } = require('./simulator');
const { createCallbackSender } = require('./callbackManager');

const app = express();

app.use(cors());
app.use(express.json());

// Track active simulations for observability
let activeSimulations = 0;
let totalProcessed = 0;

/**
 * Health check.
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'xeno-pulse-channel-service',
    activeSimulations,
    totalProcessed,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Receive a message to simulate delivery.
 * POST /send
 *
 * Expected body: {
 *   messageId, campaignId, recipient, channel, content, callbackUrl
 * }
 */
app.post('/send', (req, res) => {
  const { messageId, campaignId, recipient, channel, content, callbackUrl } = req.body;

  if (!messageId || !campaignId || !callbackUrl) {
    return res.status(400).json({
      success: false,
      error: 'messageId, campaignId, and callbackUrl are required',
    });
  }

  console.log(`📨 Received message: ${messageId.slice(-6)} → ${recipient?.name || 'unknown'} via ${channel}`);

  // Respond immediately — simulation runs in the background
  res.json({ success: true, message: 'Message accepted for delivery simulation' });

  // Fire-and-forget: run the simulation asynchronously
  activeSimulations++;
  const callbackSender = createCallbackSender(callbackUrl);

  simulateDelivery({ messageId, campaignId }, callbackSender)
    .catch((err) => console.error(`Simulation error for ${messageId}: ${err.message}`))
    .finally(() => {
      activeSimulations--;
      totalProcessed++;
    });
});

module.exports = app;
