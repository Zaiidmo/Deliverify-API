const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
  switchRoleToDelivery,
} = require("../../controllers/userController");
const User = require("../../models/User");
const Role = require("../../models/Role")

// Mock dependencies
jest.mock("../../models/User");
jest.mock("../../models/Role");
jest.mock("../../services/jwtService");
jest.mock("../../services/passwordService");
jest.mock("../../services/mailService");
jest.mock("../../validations/authValidations");

beforeEach(() => {
  req = { body: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("getAllUsers", () => {
  it("should return all users with status 200", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUsers = [
      { id: 1, username: "user1" },
      { id: 2, username: "user2" },
    ];
    User.find.mockResolvedValue(mockUsers);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it("should handle server error and return 500", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.find.mockRejectedValue(new Error("Server error"));
    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("getUserById", () => {
  it("should return user with status 200", async () => {
    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = { id: 1, username: "user1" };
    User.findById.mockResolvedValue(mockUser);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it("should handle server error and return 500", async () => {
    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findById.mockRejectedValue(new Error("Server error"));
    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("should handle not found error and return 404", async () => {
    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findById.mockResolvedValue(null);
    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

describe("createUser", () => {
  it("should create user with status 201", async () => {
    // req.body = {
    //   fullname: { fname: "John", lname: "Doe" },
    //   username: "johndoe",
    //   email: "john@example.com",
    //   phoneNumber: "1234567890",
    //   password: "password123",
    //   roles: ["User"],
    // };
    // User.findOne.mockResolvedValue(null);
    // Role.find.mockResolvedValue([{ _id: "user_role_id", name: "User" }]);
    // passwordService.hashPassword.mockResolvedValue("hashedPassword");
    // await userController.createUser(req, res);
    // expect(res.status).toHaveBeenCalledWith(201);
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: "User registered successfully. Please verify your email.",
    //     user: expect.any(Object),
    //   })
    // );
  });
});

describe("updateUser", () => {
    it("should update user with status 200", async () => {
        const req = { params: { id: 1 }, body: { username: "user1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockUser = { id: 1, username: "user1" };
        User.findByIdAndUpdate.mockResolvedValue(mockUser);
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({"Updated fields": req.body, "User": mockUser});
    });

    it("should handle server error and return 500", async () => {
        const req = { params: { id: 1 }, body: { username: "user1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        User.findByIdAndUpdate.mockRejectedValue(new Error("Server error"));
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });

    it("should handle not found error and return 404", async () => {
        const req = { params: { id: 1 }, body: { username: "user1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        User.findByIdAndUpdate.mockResolvedValue(null);
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
});

describe("banne the user", () => {
    it("should ban user with status 200", async () => {
        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const mockUser = { id: 1, username: "user1" };
        User.findByIdAndUpdate.mockResolvedValue(mockUser);
        await banUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        // expect(res.message).toEqual("User banned");
        expect(res.json).toHaveBeenCalledWith({message: "User banned", "User": mockUser});
    });

    it("should handle server error and return 500", async () => {
        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        User.findByIdAndUpdate.mockRejectedValue(new Error("Server error"));
        await banUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });

    it("should handle not found error and return 404", async () => {
        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        User.findByIdAndUpdate.mockResolvedValue(null);
        await banUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
 });
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


