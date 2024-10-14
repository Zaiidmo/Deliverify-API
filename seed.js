const connectDB = require("./config/db");
const Role = require("./models/Role");
const User = require("./models/User");
const Permission = require("./models/Permission");

const seedDatabase = async () => {
    await connectDB();

    // Clear existing Data 
    await Role.deleteMany();
    await User.deleteMany();
    await Permission.deleteMany();

    // Define initial permissions
    const permissions = [
        { name: "CREATE_USER" , description: "Create a new user" },
        { name: "UPDATE_USER" , description: "Update an existing user" },
        { name: "DELETE_USER" , description: "Delete an existing user" },
        { name: "VIEW_USER" , description: "View an existing user" },
        { name: "LOGIN_USER" , description: "Login to the application" }

    ];

    // Create permissions
    const initialPermissions = await Permission.insertMany(permissions);
    console.log("Permissions created: ", initialPermissions);

    // Define initial roles
    const roles = [
        { name: "Admin", permissions: [initialPermissions[0]._id, initialPermissions[1]._id, initialPermissions[2]._id, initialPermissions[3]._id] },
        { name: "User", permissions: [initialPermissions[4]._id] }
    ];

    // Create roles
    const initialRoles = await Role.insertMany(roles);
    console.log("Roles created: ", initialRoles);

    // Define initial users
    const users = [
        { username: "Admin", email: "admin@email.com", password: "password", roles: [initialRoles[0]._id],isVerified: true},
        { username: "User", email: "user@email.com", password: "password", roles: [initialRoles[1]._id],isVerified: true},
    ];

    // Create users
    const initialUsers = await User.insertMany(users);
    console.log("Users created: ", initialUsers);

    // Close the connection
    process.exit(0);
};

seedDatabase().catch(error => {
    console.error("Error seeding the database: ", error);
    process.exit(1);
});