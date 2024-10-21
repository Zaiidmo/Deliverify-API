const roleController = require('../../controllers/roleController');
const Role = require('../../models/Role');
const User = require('../../models/User');

// Mock dependencies
jest.mock('../../models/Role');
jest.mock('../../models/User');

describe("Role Controller - assignRoles", () => {
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

  it("should assign roles to a user", async () => {
    req.body = { userId: "user1", roleIds: ["role1", "role2"] };
    const mockUser = { _id: "user1", roles: [], save: jest.fn() };
    const mockRoles = [{ _id: "role1" }, { _id: "role2" }];

    User.findById.mockResolvedValue(mockUser);
    Role.find.mockResolvedValue(mockRoles);

    await roleController.assignRoles(req, res);

    expect(User.findById).toHaveBeenCalledWith("user1");
    expect(Role.find).toHaveBeenCalledWith({ _id: { $in: ["role1", "role2"] } });
    expect(mockUser.roles).toEqual(["role1", "role2"]);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Roles assigned",
      user: mockUser
    });
  });

  it("should return 404 if user is not found", async () => {
    req.body = { userId: "user1", roleIds: ["role1", "role2"] };
    User.findById.mockResolvedValue(null);

    await roleController.assignRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found"
    });
  });

  it("should return 400 if some roles are not found", async () => {
    req.body = { userId: "user1", roleIds: ["role1", "role2"] };
    const mockUser = { _id: "user1", roles: [], save: jest.fn() };
    User.findById.mockResolvedValue(mockUser);
    Role.find.mockResolvedValue([{ _id: "role1" }]); // Only one role found

    await roleController.assignRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some roles not found"
    });
  });

  it("should return 500 if there is a server error", async () => {
    req.body = { userId: "user1", roleIds: ["role1", "role2"] };
    User.findById.mockRejectedValue(new Error("Server error"));

    await roleController.assignRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "Server error"
    });
  });
});
