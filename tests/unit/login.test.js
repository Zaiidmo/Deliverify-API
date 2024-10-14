const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwtService = require('../../services/jwtService');
const passwordService = require('../../services/passwordService');
const mailService = require('../../services/mailService');
const otpService = require('../../services/otpService');
const deviceService = require('../../services/deviceService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../services/jwtService');
jest.mock('../../services/passwordService');
jest.mock('../../services/mailService');
jest.mock('../../services/otpService');
jest.mock('../../services/deviceService');

describe('Auth Controller - Login and Authentication', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
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

  describe('login', () => {
    it('should send OTP for a valid user and untrusted device', async () => {
      req.body = {
        identifier: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John' },
        email: 'john@example.com',
        password: 'hashedPassword',
        isVerified: true,
        trustedDevices: [],
      };

      User.findOne.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
      otpService.generateOTP.mockReturnValue('123456');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'OTP sent to your email. Please verify to complete login.',
        user: expect.any(Object),
        otpCode: '123456',
      }));
      expect(mailService.sendOTP).toHaveBeenCalledWith('john@example.com', '123456');
    });

    it('should log in with a trusted device', async () => {
      req.body = {
        identifier: 'john@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John' },
        email: 'john@example.com',
        password: 'hashedPassword',
        isVerified: true,
        trustedDevices: [{
          agent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
          deviceName: 'localhost',
          addedAt: new Date(),
        }],
      };

      const actualDevice = {
        agent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        deviceName: 'localhost',
      };

      deviceService.getTheDevice.mockReturnValue(actualDevice);
      User.findOne.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
      jwtService.generateAccessToken.mockReturnValue('access_token');
      jwtService.generateRefreshToken.mockReturnValue('refresh_token');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh_token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful.',
        user: expect.any(Object),
        accessToken: 'access_token',
      }));
    });

    it('should return 404 if user not found', async () => {
      req.body = {
        identifier: 'nonexistent@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = {
        identifier: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user_id',
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      User.findOne.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials.',
      });
    });

    it('should send verification email for unverified user', async () => {
      req.body = {
        identifier: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John' },
        email: 'john@example.com',
        password: 'hashedPassword',
        isVerified: false,
      };

      User.findOne.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
      jwtService.generateVerificationToken.mockReturnValue('verification_token');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please verify your email. A new verification email has been sent.',
        token: 'verification_token',
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and complete login', async () => {
      // Set up the request body
      req.body = {
        identifier: 'john@example.com',
        otp: '123456',
        rememberDevice: true,
      };
    
      // Create a mock user object
      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        roles: ['User'],
        trustedDevices: [], // Initially empty
        save: jest.fn().mockResolvedValue(true), // Mock save method for the user
      };
    
      // Mock external service calls
      User.findOne.mockResolvedValue(mockUser);
      otpService.verifyOTP.mockReturnValue(true);
      jwtService.generateAccessToken.mockReturnValue('access_token');
      jwtService.generateRefreshToken.mockReturnValue('refresh_token');
    
      // Mock device information
      const actualDevice = {
        agent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        deviceName: 'localhost',
      };
      deviceService.getTheDevice.mockReturnValue(actualDevice);
    
      // Set up the mock response object
      const res = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    
      // Execute the verifyOtp function and handle potential errors
      try {
        await authController.verifyOtp(req, res);
      } catch (error) {
        console.error('Error during OTP verification in tests:', error);
      }
    
      // Assertions
      expect(otpService.verifyOTP).toHaveBeenCalledWith(req.body.identifier, req.body.otp);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh_token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'OTP verified successfully. Login successful.',
        user: expect.objectContaining({
          _id: mockUser._id,
          fullname: mockUser.fullname,
          username: mockUser.username,
          email: mockUser.email,
          phoneNumber: mockUser.phoneNumber,
          roles: mockUser.roles,
          trustedDevices: expect.any(Array),
        }),
        accessToken: 'access_token',
      }));
    });
    
    

    it('should remember device if requested', async () => {
      req.body = {
        identifier: 'john@example.com',
        otp: '123456',
        rememberDevice: true,
      };

      const mockUser = {
        _id: 'user_id',
        fullname: { fname: 'John' },
        username: 'johndoe',
        email: 'john@example.com',
        trustedDevices: [], // Initially empty
      };

      User.findOne.mockResolvedValue(mockUser);
      otpService.verifyOTP.mockReturnValue(true);
      jwtService.generateAccessToken.mockReturnValue('access_token');
      jwtService.generateRefreshToken.mockReturnValue('refresh_token');

      const actualDevice = {
        agent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        deviceName: 'localhost',
      };

      deviceService.getTheDevice.mockReturnValue(actualDevice);
      // Mock the save method to simulate saving the trusted device
      mockUser.save = jest.fn().mockResolvedValue(mockUser);

      await authController.verifyOtp(req, res);

      expect(mockUser.trustedDevices).toHaveLength(1); // Check if the device is added
      expect(mockUser.trustedDevices[0]).toEqual(expect.objectContaining({
        agent: actualDevice.agent,
        ipAddress: actualDevice.ipAddress,
        deviceName: actualDevice.deviceName,
      }));
      expect(mockUser.save).toHaveBeenCalled(); // Ensure save method is called
    });

    it('should return 404 if user not found', async () => {
      req.body = {
        identifier: 'nonexistent@example.com',
        otp: '123456',
      };

      User.findOne.mockResolvedValue(null);

      await authController.verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.',
      });
    });

    it('should return 401 for invalid OTP', async () => {
      req.body = {
        identifier: 'john@example.com',
        otp: '654321',
      };

      const mockUser = {
        _id: 'user_id',
        email: 'john@example.com',
      };

      User.findOne.mockResolvedValue(mockUser);
      otpService.verifyOTP.mockReturnValue(false);

      await authController.verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired OTP.',
      });
    });
  });
});
