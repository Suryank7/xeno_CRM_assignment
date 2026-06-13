const express = require('express');
const router = express.Router();
const { receiveReceipt, handleDLQ } = require('../controllers/receiptController');

router.post('/', receiveReceipt);
router.post('/dlq', handleDLQ);

module.exports = router;
