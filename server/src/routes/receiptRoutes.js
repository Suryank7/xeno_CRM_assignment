const express = require('express');
const router = express.Router();
const { receiveReceipt } = require('../controllers/receiptController');

router.post('/', receiveReceipt);

module.exports = router;
