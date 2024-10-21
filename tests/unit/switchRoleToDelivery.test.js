const { switchRoleToDelivery } = require("../../controllers/switchRoleController");
const Role = require("../../models/Role");
const User = require("../../models/User");

// Mocking the Role and User models
jest.mock("../../models/Role");
jest.mock("../../models/User");

describe("switchRoleToDelivery", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: "someUserId", 
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it("should switch the user role to Delivery", async () => {
    // Mock the delivery role response
    const deliveryRole = { _id: "deliveryRoleId", name: "Delivery" };
    Role.findOne.mockResolvedValue(deliveryRole);

    // Mock the user response
    const user = {
      _id: "someUserId",
      roles: [],
      save: jest.fn().mockResolvedValue(true), // Mock save method to resolve
    };
    User.findById.mockResolvedValue(user); // Mock the user lookup

    await switchRoleToDelivery(req, res);

    expect(user.roles).toEqual([deliveryRole._id]); // Expect the roles to include deliveryRoleId
    expect(user.save).toHaveBeenCalled(); // Ensure save was called
    expect(res.status).toHaveBeenCalledWith(200); // Check response status
    expect(res.json).toHaveBeenCalledWith({
      message: "Role switched to Delivery",
      user,
    }); // Check response body
  });

  it("should return 404 if user is not found", async () => {
    // Mock the role and user responses
    Role.findOne.mockResolvedValue({ _id: "deliveryRoleId", name: "Delivery" });
    User.findById.mockResolvedValue(null); // Simulate user not found

    await switchRoleToDelivery(req, res);

    expect(res.status).toHaveBeenCalledWith(404); // Expect 404 response
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" }); // Expect appropriate message
  });

  it("should return 500 if there is a server error", async () => {
    // Mock the role response
    Role.findOne.mockResolvedValue({ _id: "deliveryRoleId", name: "Delivery" });
    User.findById.mockRejectedValue(new Error("Database error")); // Simulate a database error

    await switchRoleToDelivery(req, res);

    expect(res.status).toHaveBeenCalledWith(500); // Expect 500 response
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" }); // Expect appropriate message
  });
});
