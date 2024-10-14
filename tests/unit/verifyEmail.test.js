const mongoose = require("mongoose");
const User = require("../../models/User");
const jwtService = require("../../services/jwtService");
const { verifyEmail } = require("../../controllers/verifyEmailController");

jest.mock("../../models/User");
jest.mock("../../services/jwtService");

describe("Verify Email Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    jest.clearAllMocks();
  });

  it("should verify email successfully", async () => {
    // Setup
    req.query.token = "valid_token";
    const mockUser = {
      _id: "valid_user_id",
      isVerified: false,
      save: jest.fn().mockResolvedValue(true),
    };

    jwtService.verifyToken.mockReturnValue({ _id: "valid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    User.findById.mockResolvedValue(mockUser);

    // Execute
    await verifyEmail(req, res);

    // Verify
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email verified successfully. You can now log in.",
      user: mockUser,
    });
  });

  it("should return 400 for invalid token", async () => {
    req.query.token = "invalid_token";
    jwtService.verifyToken.mockReturnValue(null);

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired verification link.",
    });
  });

  it("should return 400 for invalid user ID", async () => {
    req.query.token = "valid_token";
    jwtService.verifyToken.mockReturnValue({ _id: "invalid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found.",
    });
  });

  it("should return 400 if user is not found", async () => {
    req.query.token = "valid_token";
    jwtService.verifyToken.mockReturnValue({ _id: "valid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    User.findById.mockResolvedValue(null);

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found.",
    });
  });

  it("should return 400 if user is already verified", async () => {
    req.query.token = "valid_token";
    const mockUser = {
      _id: "valid_user_id",
      isVerified: true,
      save: jest.fn().mockResolvedValue(true),
    };

    jwtService.verifyToken.mockReturnValue({ _id: "valid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    User.findById.mockResolvedValue(mockUser);

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already verified.",
    });
  });

  it("should handle errors during user save", async () => {
    req.query.token = "valid_token";
    const mockUser = {
      _id: "valid_user_id",
      isVerified: false,
      save: jest.fn().mockRejectedValue(new Error("Save error")),
    };

    jwtService.verifyToken.mockReturnValue({ _id: "valid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    User.findById.mockResolvedValue(mockUser);

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "An error occurred while verifying email.",
    });
  });

  it("should handle general errors", async () => {
    req.query.token = "valid_token";
    jwtService.verifyToken.mockReturnValue({ _id: "valid_user_id" });
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    User.findById.mockRejectedValue(new Error("Database error"));

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "An error occurred while verifying email.",
    });
  });
});
