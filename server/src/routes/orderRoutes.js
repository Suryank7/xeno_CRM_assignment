const express = require('express');
const multer = require('multer');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { parseCSV } = require('../utils/csvParser');
const { AppError } = require('../middleware/errorHandler');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload orders via CSV.
 * POST /api/orders/upload
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No CSV file uploaded', 400);

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) throw new AppError('CSV file is empty', 400);

    let created = 0;
    for (const row of rows) {
      // Find customer by email
      const customer = await Customer.findOne({
        email: row.customerEmail || row.customer_email || row.email,
      });

      if (!customer) continue; // Skip orders for unknown customers

      await Order.create({
        customerId: customer._id,
        orderNumber: row.orderNumber || row.order_number || `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        amount: row.amount || row.Amount || 0,
        items: row.items
          ? JSON.parse(row.items)
          : [{ name: row.itemName || 'Product', category: row.category || 'General', price: row.amount || 0 }],
        status: row.status || 'delivered',
        orderDate: row.orderDate || row.order_date || new Date(),
      });

      // Update customer aggregates
      customer.totalOrders += 1;
      customer.totalSpent += Number(row.amount || 0);
      const orderDate = new Date(row.orderDate || row.order_date || Date.now());
      if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
      }
      await customer.save();
      created++;
    }

    res.status(200).json({
      success: true,
      message: `Created ${created} orders from ${rows.length} rows`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * List orders (paginated).
 * GET /api/orders
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('customerId', 'name email')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
