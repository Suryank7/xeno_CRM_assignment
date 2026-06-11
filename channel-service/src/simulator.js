/**
 * Simulates the message delivery lifecycle.
 *
 * Probability chain:
 *   sent → 90% delivered / 10% failed
 *   delivered → 60% opened
 *   opened → 40% clicked
 *   clicked → 15% purchased
 *
 * Each transition happens after a random delay to simulate real-world async behavior.
 */

function randomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function shouldHappen(probability) {
  return Math.random() < probability;
}

/**
 * Runs the delivery simulation for a single message.
 * Calls back to the CRM receipt API at each stage.
 *
 * @param {Object} messageData - { messageId, campaignId, callbackUrl }
 * @param {Function} sendCallback - async function(status) to POST to CRM
 */
async function simulateDelivery(messageData, sendCallback) {
  const { messageId, campaignId } = messageData;

  // Stage 1: Delivered or Failed (1-3 seconds)
  await sleep(randomDelay(1000, 3000));

  if (shouldHappen(0.90)) {
    await sendCallback(messageId, campaignId, 'delivered');
  } else {
    await sendCallback(messageId, campaignId, 'failed');
    return; // Stop here if failed
  }

  // Stage 2: Opened (2-5 seconds after delivery)
  await sleep(randomDelay(2000, 5000));

  if (shouldHappen(0.60)) {
    await sendCallback(messageId, campaignId, 'opened');
  } else {
    return; // Not opened
  }

  // Stage 3: Read (1-2 seconds after open)
  await sleep(randomDelay(1000, 2000));
  await sendCallback(messageId, campaignId, 'read');

  // Stage 4: Clicked (1-3 seconds after read)
  await sleep(randomDelay(1000, 3000));

  if (shouldHappen(0.40)) {
    await sendCallback(messageId, campaignId, 'clicked');
  } else {
    return; // Not clicked
  }

  // Stage 5: Purchased (2-4 seconds after click)
  await sleep(randomDelay(2000, 4000));

  if (shouldHappen(0.15)) {
    await sendCallback(messageId, campaignId, 'purchased');
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { simulateDelivery };
