const express = require('express');
const router = express.Router();
const {
  chat,
  discoverOpportunities,
  suggestSegment,
  generatePersonas,
  generateMessage,
  simulateCampaign,
  autonomousPlan,
  learn,
  getLearnings,
  getOpportunities,
  getPersonas,
} = require('../controllers/aiController');

// Core chat copilot
router.post('/chat', chat);

// Feature 1: Opportunity discovery
router.post('/discover-opportunities', discoverOpportunities);
router.get('/opportunities', getOpportunities);

// Feature 2: NL Audience builder
router.post('/suggest-segment', suggestSegment);

// Feature 3: AI Personas
router.post('/generate-personas', generatePersonas);
router.get('/personas', getPersonas);

// Feature 5: Campaign Simulator
router.post('/simulate-campaign', simulateCampaign);

// Feature 6: Message Tournament
router.post('/generate-message', generateMessage);

// Feature 9: Autonomous mode
router.post('/autonomous-plan', autonomousPlan);

// Feature 12: Self-learning
router.post('/learn', learn);
router.get('/learnings', getLearnings);

module.exports = router;
