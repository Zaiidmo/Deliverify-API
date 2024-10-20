const Log = require("../models/Log");

const logService = {
  /**
   * Adds a log entry to the database.
   * 
   * This function is used to create a log entry that records actions performed by a user. 
   * You need to pass the user's ID, the type of action, and any additional details related to the action.
   * 
   * **Example Usage:**
   * 
   * ```javascript
   * const userId = "5f8f8f8f8f8f8f8f8f8f8"; // ID of the user performing the action
   * const actionType = "USER_LOGIN" or "ORDER_CREATION" or "USER_SIGNUP", or "PASSWORD_CHANGE"; 
   * // The type of action (e.g., USER_LOGIN, ORDER_CREATION, ORDER_STATUS_UPDATE, USER_SIGNUP, PASSWORD_CHANGE, etc.) 
   * const details = { username: "JohnDoe", orderId: "12345", email: "2hQjH@example.com"
   *  }; // Additional details (optional)
   * 
   * 
   * // Log the action
   * await logService.addLog(userId, actionType, details);
   * ```
   * 
   * @param {string} userId - The ID of the user performing the action.
   *   - **Example:** `"5f8f8f8f8f8f8f8f8f8f8"`
   * @param {string} actionType - The type of action being logged. You can specify different actions based on your needs.
   *   - **Examples:** `"USER_LOGIN"`, `"ORDER_CREATION"`, `"USER_SIGNUP"`, `"PASSWORD_CHANGE"`
   * @param {object} [details={}] - An optional object containing any additional details about the action. 
   *   - **Example:** `{ username: "JohnDoe", orderId: "12345" you can add what do you want here, you are free }`
   * @returns {Promise<void>} - This function does not return any data, but logs the action.
   */
  async addLog(userId, actionType, details = {}) {
    try {
      const log = new Log({
        user: userId,
        action: actionType,
        details
      });
      await log.save();
      console.log("Log added successfully:", actionType);
    } catch (error) {
      console.error("Error adding log:", error);
      throw error;
    }
  },

 /**
 * Fetch logs from the database with optional filters, sorting, and pagination.
 * 
 * If no filters are provided, this function will return all logs. If filters are provided, 
 * they will be applied to narrow down the results.
 * 
 * **Example Usage:**
 * 
 * ```
 * // Get all logs (no filters)
 * const allLogs = await logService.getLogs();
 * 
 * // Get logs for a specific user
 * const userLogs = await logService.getLogs({ user: "5f8f8f8f8f8f8f8f8f8f8" });
 * 
 * // Get logs for a specific action and user
 * const filteredLogs = await logService.getLogs({ user: "5f8f8f8f8f8f8f8f8f8", action: "USER_LOGIN" });
 * ```
 * 
 * @param {object} [filters={}] - Filters to apply to the logs query. Leave empty for no filtering.
 *   - **Examples:** 
 *     - To filter by user: `{ user: "5f8f8f8f8f8f8f8f8f8f8" }`
 *     - To filter by action type: `{ action: "USER_LOGIN" }`
 *     - To filter by both user and action: `{ user: "5f8f8f8f8f8f8f8f8f8", action: "USER_LOGIN" }`
 *     - To filter by multiple properties: `{ user: "5f8f8f8f8f8f8f8f8f8f8", action: "USER_LOGIN", details: { username: "JohnDoe" } }`
 *     - To filter by all properties: `{ user: "5f8f8f8f8f8f8f8f8f8f8", action: "USER_LOGIN", details: { username: "JohnDoe", orderId: "12345" } }`
 *     - You can add what do you want here, you are free
 * @param {object} [sort={ timestamp: -1 }] - Sorting options (default is newest logs first).
 * @param {number} [limit=100] - Maximum number of logs to return. Default is 100.
 * @param {number} [skip=0] - Number of logs to skip (for pagination). Default is 0.
 * @returns {Promise<Array>} - The fetched logs based on the provided filters.
 */
async getLogs(filters = {}, sort = { timestamp: -1 }, limit = 100, skip = 0) {
  try {
    // By passing 'filters' (which can be an empty object) to Log.find(),
    // the function will either find all logs or apply the provided filters.
    const logs = await Log.find(filters)
      .sort(sort)   // Apply sorting (newest logs first by default)
      .limit(limit) // Limit the number of results
      .skip(skip)   // Skip logs (used for pagination)
      .populate('user', 'username'); // Populate the 'user' field with the 'username'
    
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}


  
};

module.exports = logService;