const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwtService = require('../../services/jwtService');
const passwordService = require('../../services/passwordService');
const mailService = require('../../services/mailService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../services/jwtService');
jest.mock('../../services/passwordService');
jest.mock('../../services/mailService');

describe('Auth Controller - Password Reset and Token Management', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for existing user', async () => {
      req.body = { email: 'john@example.com' };

      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John' },
        email: 'john@example.com',
      };

      User.findOne.mockResolvedValue(mockUser);
      jwtService.generateVerificationToken.mockReturnValue('reset_token');

      await authController.requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.',
        token: 'reset_token',
      });
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'John',
        'john@example.com',
        'reset_token'
      );
    });

    it('should return 404 if user not found', async () => {
      req.body = { email: 'nonexistent@example.com' };

      User.findOne.mockResolvedValue(null);

      await authController.requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body = {
        token: 'valid_token',
        newPassword: 'newPassword123',
        confirmNewPassword: 'newPassword123',
      };

      jwtService.verifyToken.mockReturnValue('user_id');
      passwordService.updatePassword.mockResolvedValue({
        _id: 'user_id',
        email: 'john@example.com',
      });

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset successfully.',
        user: expect.any(Object),
      });
    });

    it('should return 400 for unmatched passwords', async () => {
      req.body = {
        token: 'valid_token',
        newPassword: 'newPassword123',
        confirmNewPassword: 'differentPassword',
      };

      const response = await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unmatched passwords',
      });
    });

    it('should return 400 for invalid token', async () => {
      req.body = {
        token: 'invalid_token',
        newPassword: 'newPassword123',
        confirmNewPassword: 'newPassword123',
      };

      jwtService.verifyToken.mockReturnValue(null);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token.',
      });
    });

    it('should handle errors during password update', async () => {
      req.body = {
        token: 'valid_token',
        newPassword: 'newPassword123',
        confirmNewPassword: 'newPassword123',
      };

      jwtService.verifyToken.mockReturnValue('user_id');
      passwordService.updatePassword.mockRejectedValue(new Error("Update failed"));

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Update failed",
      });
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token for valid refresh token', async () => {
      req.cookies = { refreshToken: 'valid_refresh_token' };

      jwtService.verifyToken.mockReturnValue({ _id: 'user_id' });
      jwtService.generateAccessToken.mockReturnValue('new_access_token');

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        newAccessToken: 'new_access_token',
      });
    });

    it('should return 401 if refresh token is missing', async () => {
      req.cookies = {};

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access Denied',
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      req.cookies = { refreshToken: 'invalid_refresh_token' };

      jwtService.verifyToken.mockReturnValue(null);

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized! Invalid token.',
      });
    });
  });
});
