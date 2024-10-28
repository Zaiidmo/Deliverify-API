//controllers\logController.js
const logService = require('../services/logService');

const logController = {
  /**
   * Get logs for admin using POST method.
   * 
   * This function allows an admin to fetch logs with optional filters. 
   * It supports filters, sorting, and pagination provided in the request body.
   * 
   * **Request Body Parameters:**
   * - `user`: Filter by user ID (optional)
   * - `action`: Filter by action type (optional)
   * - `sort`: Sort order (optional, default is `{ timestamp: -1 }`)
   * - `limit`: Limit the number of logs returned (optional, default is 100)
   * - `page`: Page number for pagination (optional, default is 1)
   * 
   * **Example Usage:**
   * ```
   * // Request: POST /api/logs/users
   * const logs = await logController.getLogs(req, res);
   * ```
   * 
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>}
   */
  async getLogs(req, res) {
    try {
      const { user, action, sort, limit, page } = req.body;

      const filters = {};
      if (user) filters.user = user;
      if (action) filters.action = action;

      const sortOrder = sort ? sort : { timestamp: -1 };
      const logsLimit = limit ? parseInt(limit, 10) : 10;
      const logsPage = page ? parseInt(page, 10) : 1;
      const skip = (logsPage - 1) * logsLimit;

      // Fetch logs and total count from the service
      const { logs, total } = await logService.getLogs(filters, sortOrder, logsLimit, skip);

      return res.status(200).json({
        success: true,
        data: logs,
        message: 'Logs fetched successfully',
        pagination: {
          page: logsPage,
          limit: logsLimit,
          total: total, // Include total count for pagination
          totalPages: Math.ceil(total / logsLimit) // Calculate total pages
        }
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch logs',
        error: error.message
      });
    }
  },






  /**
   * Get logs for a specific user (logged-in user) using POST method.
   * 
   * This function allows a logged-in user to fetch and filter only their own logs.
   * It supports filters, sorting, and pagination provided in the request body.
   * The logs will be automatically filtered by the authenticated user's ID.
   * 
   * **Request Body Parameters:**
   * - `action`: Filter by action type (optional)
   * - `sort`: Sort order (optional, default is `{ timestamp: -1 }`)
   * - `limit`: Limit the number of logs returned (optional, default is 100)
   * - `page`: Page number for pagination (optional, default is 1)
   * 
   * **Example Usage:**
   * ```
   * // Request: POST /api/logs/mylogs
   * const userLogs = await logController.getUserLogs(req, res);
   * ```
   * 
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>}
   */
  async getUserLogs(req, res) {
    try {
      const userId = req.user._id;
      const { action, sort, limit, page } = req.body;
      const filters = { user: userId };
      if (action) filters.action = action;

      const sortOrder = sort ? sort : { timestamp: -1 };
      const logsLimit = limit ? parseInt(limit, 10) : 10;
      const logsPage = page ? parseInt(page, 10) : 1;
      const skip = (logsPage - 1) * logsLimit;

      // Fetch user-specific logs and total count from the service
      const { logs, total } = await logService.getLogs(filters, sortOrder, logsLimit, skip);

      if (!logs || logs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No logs found for this user.'
        });
      }

      return res.status(200).json({
        success: true,
        data: logs,
        message: 'User logs retrieved successfully',
        pagination: {
          page: logsPage,
          limit: logsLimit,
          total: total, // Include total count for pagination
          totalPages: Math.ceil(total / logsLimit) // Calculate total pages
        }
      });
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user logs',
        error: error.message
      });
    }
  }
};

module.exports = logController;
