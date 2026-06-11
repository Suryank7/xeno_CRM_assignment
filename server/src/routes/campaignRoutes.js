const express = require('express');
const router = express.Router();
const {
  createCampaign,
  launchCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignMessages,
} = require('../controllers/campaignController');

router.post('/', createCampaign);
router.post('/:id/launch', launchCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.get('/:id/messages', getCampaignMessages);

module.exports = router;
