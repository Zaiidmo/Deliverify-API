//tests\unit\logservicefunctions.test.js
const logService = require('../../services/logService');
const Log = require('../../models/Log');

// Mock dependencies
jest.mock('../../models/Log');


describe('Log Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addLog', () => {
    it('should add a log successfully', async () => {
      const mockSave = jest.fn();
      Log.mockImplementation(() => ({
        save: mockSave
      }));

      const userId = 'user123';
      const actionType = 'USER_LOGIN';
      const details = { ip: '127.0.0.1' };

      await logService.addLog(userId, actionType, details);

      expect(Log).toHaveBeenCalledWith({
        user: userId,
        action: actionType,
        details
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if saving fails', async () => {
      const mockError = new Error('Save failed');
      Log.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(mockError)
      }));

      await expect(logService.addLog('user123', 'USER_LOGIN')).rejects.toThrow('Save failed');
    });
  });

  describe('getLogs', () => {
    it('should fetch logs with default parameters', async () => {
      const mockLogs = [{ _id: 'log1', action: 'TEST' }];
      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue(mockLogs);

      Log.find = mockFind;
      Log.find().sort = mockSort;
      Log.find().sort().limit = mockLimit;
      Log.find().sort().limit().skip = mockSkip;
      Log.find().sort().limit().skip().populate = mockPopulate;

      const result = await logService.getLogs();

      expect(mockFind).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockPopulate).toHaveBeenCalledWith('user', 'username');
      expect(result).toEqual(mockLogs);
    });

    it('should fetch logs with custom parameters', async () => {
      const mockLogs = [{ _id: 'log1', action: 'CUSTOM' }];
      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue(mockLogs);

      Log.find = mockFind;
      Log.find().sort = mockSort;
      Log.find().sort().limit = mockLimit;
      Log.find().sort().limit().skip = mockSkip;
      Log.find().sort().limit().skip().populate = mockPopulate;

      const filters = { user: 'user123', action: 'CUSTOM' };
      const sort = { timestamp: 1 };
      const limit = 50;
      const skip = 10;

      const result = await logService.getLogs(filters, sort, limit, skip);

      expect(mockFind).toHaveBeenCalledWith(filters);
      expect(mockSort).toHaveBeenCalledWith(sort);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockPopulate).toHaveBeenCalledWith('user', 'username');
      expect(result).toEqual(mockLogs);
    });

    it('should throw an error if fetching logs fails', async () => {
      const mockError = new Error('Database error');
      Log.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(mockError)
      });

      await expect(logService.getLogs()).rejects.toThrow('Database error');
    });
  });
});