const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const { AppError } = require('../middleware/errorHandler');

/**
 * Translate segment rules into a date-aware MongoDB query.
 * Handles special keys like "daysSinceLastOrder" that need to be converted
 * to date comparisons on the fly.
 */
function buildMongoQuery(rules) {
  const query = {};

  for (const [key, condition] of Object.entries(rules)) {
    if (key === 'daysSinceLastOrder') {
      // Convert "daysSinceLastOrder: { $gt: 60 }" to a date comparison
      const dateQuery = {};
      if (condition.$gt) {
        dateQuery.$lt = new Date(Date.now() - condition.$gt * 24 * 60 * 60 * 1000);
      }
      if (condition.$lt) {
        dateQuery.$gt = new Date(Date.now() - condition.$lt * 24 * 60 * 60 * 1000);
      }
      if (condition.$gte) {
        dateQuery.$lte = new Date(Date.now() - condition.$gte * 24 * 60 * 60 * 1000);
      }
      if (condition.$lte) {
        dateQuery.$gte = new Date(Date.now() - condition.$lte * 24 * 60 * 60 * 1000);
      }
      query.lastOrderDate = dateQuery;
    } else {
      query[key] = condition;
    }
  }

  return query;
}

/**
 * Create a segment with manual or AI-generated rules.
 * POST /api/segments
 */
exports.createSegment = async (req, res, next) => {
  try {
    const { name, description, rules, createdBy, aiExplanation } = req.body;
    if (!name || !rules) throw new AppError('Name and rules are required', 400);

    // Calculate audience size
    const mongoQuery = buildMongoQuery(rules);
    const audienceSize = await Customer.countDocuments(mongoQuery);

    const segment = await Segment.create({
      name,
      description,
      rules,
      audienceSize,
      createdBy: createdBy || 'manual',
      aiExplanation,
    });

    res.status(201).json({ success: true, data: segment });
  } catch (error) {
    next(error);
  }
};

/**
 * List all segments.
 * GET /api/segments
 */
exports.getSegments = async (req, res, next) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: segments });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview audience for a segment (count + sample customers).
 * GET /api/segments/:id/preview
 */
exports.previewSegment = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) throw new AppError('Segment not found', 404);

    const mongoQuery = buildMongoQuery(segment.rules);
    const [count, sample] = await Promise.all([
      Customer.countDocuments(mongoQuery),
      Customer.find(mongoQuery).limit(10).lean(),
    ]);

    // Update stored audience size
    segment.audienceSize = count;
    await segment.save();

    res.json({ success: true, data: { audienceSize: count, sample } });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a segment.
 * DELETE /api/segments/:id
 */
exports.deleteSegment = async (req, res, next) => {
  try {
    const segment = await Segment.findByIdAndDelete(req.params.id);
    if (!segment) throw new AppError('Segment not found', 404);
    res.json({ success: true, message: 'Segment deleted' });
  } catch (error) {
    next(error);
  }
};

// Export helper for reuse in campaign controller
exports.buildMongoQuery = buildMongoQuery;
