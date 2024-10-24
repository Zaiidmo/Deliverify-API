const roleController = require('../../controllers/roleController');
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');

// Mock dependencies
jest.mock('../../models/Role');
jest.mock('../../models/Permission');

describe("Role Controller - assignPermissions", () => {
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

  it("should assign permissions to a role", async () => {
    req.body = { roleId: "role1", permissionIds: ["perm1", "perm2"] };
    const mockRole = { _id: "role1", name: "Admin", permissions: [], save: jest.fn() };
    const mockPermissions = [{ _id: "perm1" }, { _id: "perm2" }];

    Role.findById.mockResolvedValue(mockRole);
    Permission.find.mockResolvedValue(mockPermissions);

    await roleController.assignPermissions(req, res);

    expect(Role.findById).toHaveBeenCalledWith("role1");
    expect(Permission.find).toHaveBeenCalledWith({ _id: { $in: ["perm1", "perm2"] } });
    expect(mockRole.permissions).toEqual(["perm1", "perm2"]);
    expect(mockRole.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Permissions assigned",
      role: mockRole
    });
  });

  it("should return 404 if role is not found", async () => {
    req.body = { roleId: "role1", permissionIds: ["perm1", "perm2"] };
    Role.findById.mockResolvedValue(null);

    await roleController.assignPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Role not found"
    });
  });

  it("should return 400 if some permissions are not found", async () => {
    req.body = { roleId: "role1", permissionIds: ["perm1", "perm2"] };
    const mockRole = { _id: "role1", name: "Admin", permissions: [], save: jest.fn() };
    Permission.find.mockResolvedValue([{ _id: "perm1" }]); 

    Role.findById.mockResolvedValue(mockRole);

    await roleController.assignPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some permissions not found"
    });
  });

  it("should return 500 if there is a server error", async () => {
    req.body = { roleId: "role1", permissionIds: ["perm1", "perm2"] };
    Role.findById.mockRejectedValue(new Error("Server error"));

    await roleController.assignPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "Server error"
    });
  });
});
