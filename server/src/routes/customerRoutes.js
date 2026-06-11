const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadCustomers,
  getCustomers,
  getCustomerById,
  getCustomerStats,
} = require('../controllers/customerController');

// Multer configured for memory storage (CSV stays in buffer, never hits disk)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadCustomers);
router.get('/stats', getCustomerStats); // Must be before /:id to avoid conflict
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

module.exports = router;
