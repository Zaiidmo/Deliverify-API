const authController = require('../../controllers/authController');
const User = require('../../models/User');
const Role = require('../../models/Role');
const jwtService = require('../../services/jwtService');
const passwordService = require('../../services/passwordService');
const mailService = require('../../services/mailService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Role');
jest.mock('../../services/jwtService');
jest.mock('../../services/passwordService');
jest.mock('../../services/mailService');

describe('Auth Controller - Registration', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        roles: ['User'],
      };

      User.findOne.mockResolvedValue(null);
      Role.find.mockResolvedValue([{ _id: 'user_role_id', name: 'User' }]);
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      jwtService.generateVerificationToken.mockReturnValue('verification_token');

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User registered successfully. Please verify your email.',
        user: expect.any(Object),
        token: 'verification_token',
      }));
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'existinguser',
        email: 'existing@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        roles: ['User'],
      };

      User.findOne.mockResolvedValue({ username: 'existinguser' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Username, Email, or Phone Number already exists.',
      });
    });

    it('should return 400 if invalid roles are provided', async () => {
      req.body = {
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        roles: ['InvalidRole'],
      };

      User.findOne.mockResolvedValue(null);
      Role.find.mockResolvedValue([]);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid role(s) provided.',
      });
    });

    it('should return 400 if admin role is provided', async () => {
      req.body = {
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        roles: ['User', 'Admin'],
      };

      User.findOne.mockResolvedValue(null);
      Role.find.mockResolvedValue([
        { _id: 'user_role_id', name: 'User' },
        { _id: 'admin_role_id', name: 'Admin' },
      ]);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Role "admin" is not allowed for registration.',
      });
    });
  });
});