/**
 * Logs Route Module
 * 
 * This module defines the routes for handling log-related requests, including:
 * - Fetching logs for all users (for admins)
 * - Fetching only logs of currently authenticated user
 * 
 * The routes use specific middlewares for authentication and role-based access control.
 * 
 * **Endpoints:**
 * 1. `POST /logs/users`: Fetch all logs with filters (admin-only)
 * 2. `POST /logs/mylogs`: Fetch only logs with filters of authenticated user
 *
 * 
 * **Middlewares Used:**
 * - `authMiddleware`: Ensures the user is authenticated.
 * - `isAdmin`: Ensures the user has admin privileges (used only for admin-specific routes).
 */

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { isAdmin } = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * POST /logs/users
 * 
 * **Description:**
 * Fetch logs for all users with optional filters. This route is accessible only to admins.
 * 
 * **Request Body Parameters:**
 * - `user`: Filter by user ID (optional)
 * - `action`: Filter by action type (optional)
 * - `sort`: Sort order (optional, default is `{ timestamp: -1 }`)
 * - `limit`: Limit the number of logs returned (optional, default is 100)
 * - `page`: Page number for pagination (optional, default is 1)
 * 
 * **Response:**
 * Returns a JSON response with the fetched logs, including pagination details.
 * 
 * **Access Control:**
 * - Requires the user to be authenticated.
 * - Requires the user to have admin privileges.
 * 
 * **Example Usage:**
 * ```
 * // Request: POST /logs/users
 * const logs = await logController.getLogs(req, res);
 * ```
 */
router.post('/users', authMiddleware, isAdmin, logController.getLogs);

/**
 * POST /logs/mylogs
 * 
 * **Description:**
 * Fetch logs for the currently authenticated user. This route allows the user to retrieve logs specific to their account.
 * 
 * **Request Body Parameters:**
 * - `action`: Filter by action type (optional)
 * - `sort`: Sort order (optional, default is `{ timestamp: -1 }`)
 * - `limit`: Limit the number of logs returned (optional, default is 100)
 * - `page`: Page number for pagination (optional, default is 1)
 * 
 * **Response:**
 * Returns a JSON response with the user's logs and pagination details.
 * 
 * **Access Control:**
 * - Requires the user to be authenticated.
 * 
 * **Example Usage:**
 * ```
 * // Request: POST /logs/mylogs
 * const userLogs = await logController.getUserLogs(req, res);
 * ```
 */
router.post('/mylogs', authMiddleware, logController.getUserLogs);

module.exports = router;
