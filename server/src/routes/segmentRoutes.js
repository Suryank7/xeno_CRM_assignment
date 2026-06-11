const express = require('express');
const router = express.Router();
const {
  createSegment,
  getSegments,
  previewSegment,
  deleteSegment,
} = require('../controllers/segmentController');

router.post('/', createSegment);
router.get('/', getSegments);
router.get('/:id/preview', previewSegment);
router.delete('/:id', deleteSegment);

module.exports = router;
