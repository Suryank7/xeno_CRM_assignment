const axios = require('axios');

/**
 * Manages callbacks to the CRM receipt API with retry logic and exponential backoff.
 */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s

/**
 * Send a status callback to the CRM.
 * Retries up to 3 times with exponential backoff on failure.
 *
 * @param {string} callbackUrl - The CRM receipt endpoint
 * @param {string} messageId
 * @param {string} campaignId
 * @param {string} status
 */
async function sendCallback(callbackUrl, messageId, campaignId, status) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await axios.post(callbackUrl, {
        messageId,
        campaignId,
        status,
      }, {
        timeout: 5000, // 5 second timeout
      });

      console.log(`  📬 Callback sent: message=${messageId.slice(-6)} → ${status}`);
      return; // Success
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`  ❌ Callback failed after ${MAX_RETRIES} retries: message=${messageId.slice(-6)} → ${status}`);
        
        // Push to Dead-Letter Queue API
        try {
          const dlqUrl = callbackUrl.replace('/api/receipt', '/api/receipt/dlq');
          await axios.post(dlqUrl, {
            messageId,
            campaignId,
            status,
            error: error.message,
            payload: { messageId, campaignId, status }
          });
          console.log(`  📩 Sent to DLQ successfully.`);
        } catch (dlqErr) {
          console.error(`  💥 Failed to send to DLQ: ${dlqErr.message}`);
        }
        return;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`  ⚠️  Callback failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Creates a bound callback function for a specific callbackUrl.
 */
function createCallbackSender(callbackUrl) {
  return (messageId, campaignId, status) => sendCallback(callbackUrl, messageId, campaignId, status);
}

module.exports = { sendCallback, createCallbackSender };
