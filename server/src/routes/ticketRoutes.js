const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  addTicketMessage,
  updateTicketStatus
} = require('../controllers/ticketController');

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.post('/:id/messages', addTicketMessage);
router.patch('/:id/status', updateTicketStatus);

module.exports = router;
