const orderController = require('../../controllers/orderController');
const User = require('../../models/User');
const Order = require('../../models/Order');
const jwtService = require('../../services/jwtService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Order');
jest.mock('../../services/jwtService');

describe('Delivery Controller - Confirm Delivery', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('confirmDelivery', () => {
    it('should return 401 if no token is provided', async () => {
      req.headers.authorization = '';

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Missing token' });
    });

    it('should return 401 if the token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwtService.verifyToken.mockReturnValue(null);

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    });

    it('should return 403 if user is not a delivery person', async () => {
      req.headers.authorization = 'Bearer validtoken';
      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      
      // Mock a user without the Delivery role
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnValue({ roles: [{ name: 'Customer' }] }),
      }));

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Only Delivery Persons' });
    });

    it('should return 404 if the order is not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      req.body = { orderId: 'invalidOrderId', OtpConfirm: '123456' };

      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnValue({ roles: [{ name: 'Delivery' }] }),
      }));
      Order.findById.mockResolvedValue(null);

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });

    it('should return 400 if the OTP is invalid', async () => {
      req.headers.authorization = 'Bearer validtoken';
      req.body = { orderId: 'validOrderId', OtpConfirm: 'wrongOtp' };

      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Delivery' }],
      };
      const mockOrder = {
        _id: 'validOrderId',
        otpConfirm: 'correctOtp',
      };
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnValue(mockUser),
      }));
      Order.findById.mockResolvedValue(mockOrder);

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
    });

    it('should confirm delivery and update order status', async () => {
      req.headers.authorization = 'Bearer validtoken';
      req.body = { orderId: 'validOrderId', OtpConfirm: 'correctOtp' };

      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Delivery' }],
      };
      const mockOrder = {
        _id: 'validOrderId',
        otpConfirm: 'correctOtp',
        status: 'Pending',
        save: jest.fn().mockResolvedValue(true), // Mock save function
      };
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnValue(mockUser),
      }));
      Order.findById.mockResolvedValue(mockOrder);

      await orderController.confirmDelivery(req, res);

      expect(mockOrder.status).toBe('Delivered'); // Make sure to set this in the actual controller
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Delivery confirmed successfully',
        order: mockOrder,
      });
    });

    it('should return 500 if an error occurs', async () => {
      req.headers.authorization = 'Bearer validtoken';
      req.body = { orderId: 'validOrderId', OtpConfirm: 'correctOtp' };

      const decodedToken = { _id: 'user_id' };
      jwtService.verifyToken.mockReturnValue(decodedToken);
      const mockUser = {
        _id: 'user_id',
        roles: [{ name: 'Delivery' }],
      };
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnValue(mockUser),
      }));
      Order.findById.mockRejectedValue(new Error('Database error')); // Simulate an error

      await orderController.confirmDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error: Database error',
      });
    });
  });
});
