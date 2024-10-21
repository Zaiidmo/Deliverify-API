const orderController = require('../../controllers/orderController');
const User = require('../../models/User');
const Order = require('../../models/Order');
const jwtService = require('../../services/jwtService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Order');
jest.mock('../../services/jwtService');

describe('Delivery Controller - Get Pending Orders', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPendingOrders', () => {
    it('should return 401 if no token is provided', async () => {
      req.headers.authorization = '';

      await orderController.getPendingOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Missing token' });
    });

    it('should return 401 if the token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwtService.verifyToken.mockReturnValue(null);

      await orderController.getPendingOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    });

    it('should return 403 if user is not a delivery person or admin', async () => {
      req.headers.authorization = 'Bearer validtoken';
      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      
      // Mock a user without Delivery or Admin roles
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Customer' }],
      };
      User.findById.mockResolvedValue(mockUser);

      await orderController.getPendingOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Only Delivery Persons' });
    });

    it('should return pending orders if the user is a delivery person', async () => {
      req.headers.authorization = 'Bearer validtoken';
      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Delivery' }],
      };
      User.findById.mockResolvedValue(mockUser);

      const mockOrders = [
        { _id: 'order1', status: 'Pending' },
        { _id: 'order2', status: 'Paid' },
      ];
      Order.find.mockResolvedValue(mockOrders);

      await orderController.getPendingOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ orders: mockOrders });
    });

    it('should return 500 if an error occurs', async () => {
      req.headers.authorization = 'Bearer validtoken';
      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Delivery' }],
      };
      User.findById.mockResolvedValue(mockUser);
      Order.find.mockRejectedValue(new Error('Database error')); 

      await orderController.getPendingOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error: Database error',
      });
    });
  });
});
