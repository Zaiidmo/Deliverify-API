const roleController = require('../../controllers/roleController');
const Role = require('../../models/Role');

// Mock dependencies
jest.mock('../../models/Role');

describe("Role Controller - createRole", () => {
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

  it("should create a new role", async () => {
    req.body = { roleName: "Admin" };
    const mockRole = { _id: "role1", name: "Admin" };
    Role.create.mockResolvedValue(mockRole);

    await roleController.createRole(req, res);

    expect(Role.create).toHaveBeenCalledWith({ name: "Admin" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Role created",
      role: mockRole
    });
  });

  it("should return 500 if there is a server error", async () => {
    req.body = { roleName: "Admin" };
    Role.create.mockRejectedValue(new Error("Create error"));

    await roleController.createRole(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "Create error"
    });
  });
});
