const Ticket = require('../models/Ticket');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all tickets
 * GET /api/tickets
 */
exports.getTickets = async (req, res, next) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email phone')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ticket
 * GET /api/tickets/:id
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email phone totalSpent totalOrders lastOrderDate digitalTwin')
      .populate('assignedTo', 'name')
      .lean();

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new ticket
 * POST /api/tickets
 */
exports.createTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a message to a ticket
 * POST /api/tickets/:id/messages
 */
exports.addTicketMessage = async (req, res, next) => {
  try {
    const { content, sender, senderName } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    ticket.messages.push({ content, sender, senderName });
    ticket.status = sender === 'customer' ? 'open' : 'in-progress';
    
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket status
 * PATCH /api/tickets/:id/status
 */
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};
