const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { parseCSV } = require('../utils/csvParser');
const { AppError } = require('../middleware/errorHandler');

/**
 * Upload customers via CSV.
 * POST /api/customers/upload
 */
exports.uploadCustomers = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No CSV file uploaded', 400);

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) throw new AppError('CSV file is empty', 400);

    // Map CSV rows to customer documents
    const customers = rows.map((row) => ({
      name: row.name || row.Name,
      email: row.email || row.Email,
      phone: row.phone || row.Phone || '',
      age: row.age || row.Age || null,
      city: row.city || row.City || '',
      totalOrders: row.totalOrders || row.total_orders || row['Total Orders'] || 0,
      totalSpent: row.totalSpent || row.total_spent || row['Total Spent'] || 0,
      lastOrderDate: row.lastOrderDate || row.last_order_date || row['Last Order'] || null,
      tags: row.tags ? String(row.tags).split(',').map((t) => t.trim()) : [],
    }));

    // Upsert: update if email exists, create if not
    const operations = customers.map((c) => ({
      updateOne: {
        filter: { email: c.email },
        update: { $set: c },
        upsert: true,
      },
    }));

    const result = await Customer.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `Processed ${rows.length} customers`,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers (paginated).
 * GET /api/customers?page=1&limit=20&search=rahul
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Optional search by name, email, or city
    const search = req.query.search;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single customer with order history.
 * GET /api/customers/:id
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) throw new AppError('Customer not found', 404);

    const orders = await Order.find({ customerId: customer._id })
      .sort({ orderDate: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: { ...customer, orders } });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregate stats for dashboard.
 * GET /api/customers/stats
 */
exports.getCustomerStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

    const [total, active, inactive, stats] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ lastOrderDate: { $gte: thirtyDaysAgo } }),
      Customer.countDocuments({ lastOrderDate: { $lt: ninetyDaysAgo } }),
      Customer.aggregate([
        {
          $group: {
            _id: null,
            avgSpent: { $avg: '$totalSpent' },
            avgOrders: { $avg: '$totalOrders' },
            totalRevenue: { $sum: '$totalSpent' },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers: total,
        activeCustomers: active,
        inactiveCustomers: inactive,
        avgSpent: Math.round(stats[0]?.avgSpent || 0),
        avgOrders: Math.round((stats[0]?.avgOrders || 0) * 10) / 10,
        totalRevenue: Math.round(stats[0]?.totalRevenue || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};
