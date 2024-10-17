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
    { name: "CREATE_USER", description: "Create a new user" },
    { name: "UPDATE_USER", description: "Update an existing user" },
    { name: "DELETE_USER", description: "Delete an existing user" },
    { name: "VIEW_USER", description: "View an existing user" },
    { name: "CREATE_RESTAURANT", description: "Create a new restaurant" },
    { name: "UPDATE_RESTAURANT", description: "Update an existing restaurant" },
    { name: "DELETE_RESTAURANT", description: "Delete an existing restaurant" },
    { name: "CREATE_REVIEW", description: "Create a new review" },
    { name: "UPDATE_REVIEW", description: "Update an existing review" },
    {
      name: "DELETE_REVIEW",
      dAlloMediaescription: "Delete an existing review",
    },
    { name: "CREATE_LIKE", description: "Create a new like" },
    { name: "DELETE_LIKE", description: "Delete an existing like" },
    { name: "CREATE_FAVORITE", description: "Create a new favorite" },
    { name: "DELETE_FAVORITE", description: "Delete an existing favorite" },
    { name: "TAKE_ORDER", description: "Take an order" },
  ];

  // Create permissions
  const initialPermissions = await Permission.insertMany(permissions);
  console.log("Permissions created: ", initialPermissions);

  // Define initial roles
  const roles = [
    {
      name: "Admin",
      permissions: [...initialPermissions.map((permission) => permission._id)],
    },
    {
      name: "Client",
      permissions: [
        initialPermissions[4]._id,
        initialPermissions[10]._id,
        initialPermissions[11]._id,
        initialPermissions[12]._id,
        initialPermissions[13]._id,
      ],
    },
    {
      name: "Manager",
      permissions: [
        initialPermissions[4]._id,
        initialPermissions[5]._id,
        initialPermissions[6]._id,
        initialPermissions[9]._id,
      ],
    },
    {
      name: "Delivery",
      permissions: [initialPermissions[14]._id],
    },
  ];

  // Create roles
  const initialRoles = await Role.insertMany(roles);
  console.log("Roles created: ", initialRoles);

  // Define initial users
  const users = [
    {
      fullname: { fname: "Admin", lname: "Test" },
      username: "Admin",
      email: "admin@email.com",
      phoneNumber: "1234567890",
      password: "password",
      roles: [initialRoles[0]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Client", lname: "Test" },
      username: "Client",
      email: "client@email.com",
      phoneNumber: "1234522310",
      password: "password",
      roles: [initialRoles[1]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Manager", lname: "Test" },
      username: "Manager",
      email: "manager@email.com",
      phoneNumber: "1234542410",
      password: "password",
      roles: [initialRoles[2]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Delivery", lname: "Test" },
      username: "Delivery",
      email: "delivery@email.com",
      phoneNumber: "1234562290",
      password: "password",
      roles: [initialRoles[3]._id],
      isVerified: true,
    },
  ];

  // Create users
  const initialUsers = await User.insertMany(users);
  //   console.log("Users created: ", initialUsers);

  // Close the connection
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Error seeding the database: ", error);
  process.exit(1);
});
