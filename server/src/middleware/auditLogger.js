const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log all mutations (POST, PUT, PATCH, DELETE).
 * Captures user context from req.user if available.
 */
exports.auditLogger = (req, res, next) => {
  // Only log mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // We hook into the finish event so we have the response status
    res.on('finish', async () => {
      try {
        const actionMap = {
          POST: 'CREATE',
          PUT: 'UPDATE',
          PATCH: 'UPDATE',
          DELETE: 'DELETE'
        };

        let resource = req.baseUrl.split('/').pop() || 'unknown';

        // Redact sensitive info like passwords from payload
        const payload = { ...req.body };
        if (payload.password) payload.password = '[REDACTED]';

        await AuditLog.create({
          userId: req.user ? req.user.userId : null,
          userEmail: req.user ? req.user.email : null,
          action: `${actionMap[req.method]}_${resource.toUpperCase()}`,
          resource: resource,
          method: req.method,
          path: req.originalUrl,
          payload: payload,
          status: res.statusCode,
          ipAddress: req.ip || req.connection.remoteAddress
        });
      } catch (err) {
        console.error('Audit Log failed:', err.message);
      }
    });
  }
  next();
};
