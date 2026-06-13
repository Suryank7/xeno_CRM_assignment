const express = require('express');
const router = express.Router();
const {
  createCampaign,
  launchCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignMessages,
  getChannelStats,
} = require('../controllers/campaignController');

router.post('/', createCampaign);
router.post('/:id/launch', launchCampaign);
router.get('/', getCampaigns);
router.get('/stats/channels', getChannelStats);
router.get('/:id', getCampaignById);
router.get('/:id/messages', getCampaignMessages);

module.exports = router;
