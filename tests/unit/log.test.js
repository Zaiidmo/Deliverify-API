const logController = require('../../controllers/logController');
const logService = require('../../services/logService');

// Mock dependencies
jest.mock('../../services/logService');

describe('Log Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: { _id: 'user123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLogs', () => {
    it('should fetch logs successfully for admin', async () => {
      const mockLogs = [{ _id: 'log1', action: 'TEST' }];
      logService.getLogs.mockResolvedValue(mockLogs);

      req.body = { user: 'user123', action: 'TEST', limit: 10, page: 1 };

      await logController.getLogs(req, res);

      expect(logService.getLogs).toHaveBeenCalledWith(
        { user: 'user123', action: 'TEST' },
        { timestamp: -1 },
        10,
        0
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
        message: 'Logs fetched successfully',
        pagination: { page: 1, limit: 10 }
      });
    });

    it('should handle errors when fetching logs', async () => {
      const mockError = new Error('Database error');
      logService.getLogs.mockRejectedValue(mockError);

      await logController.getLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch logs',
        error: 'Database error'
      });
    });
  });

  describe('getUserLogs', () => {
    it('should fetch logs successfully for a specific user', async () => {
      const mockLogs = [{ _id: 'log1', action: 'USER_ACTION' }];
      logService.getLogs.mockResolvedValue(mockLogs);

      req.body = { action: 'USER_ACTION', limit: 20, page: 2 };

      await logController.getUserLogs(req, res);

      expect(logService.getLogs).toHaveBeenCalledWith(
        { user: 'user123', action: 'USER_ACTION' },
        { timestamp: -1 },
        20,
        20
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
        message: 'User logs retrieved successfully',
        pagination: { page: 2, limit: 20 }
      });
    });

    it('should return 404 when no logs are found for the user', async () => {
      logService.getLogs.mockResolvedValue([]);

      await logController.getUserLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No logs found for this user.'
      });
    });

    it('should handle errors when fetching user logs', async () => {
      const mockError = new Error('Database error');
      logService.getLogs.mockRejectedValue(mockError);

      await logController.getUserLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch user logs',
        error: 'Database error'
      });
    });
  });
});