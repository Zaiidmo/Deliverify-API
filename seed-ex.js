const connectDB = require("./config/db");
const Role = require("./models/Role");
const User = require("./models/User");
const Permission = require("./models/Permission");
const Restaurant = require("./models/Restaurant");
const Item = require("./models/Item");
const Order = require("./models/Order");

const seedDatabase = async () => {
  await connectDB();

  // Clear existing Data
  await Role.deleteMany();
  await User.deleteMany();
  await Permission.deleteMany();
  await Restaurant.deleteMany();
  await Item.deleteMany();
  await Order.deleteMany();

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
    { name: "DELETE_REVIEW", description: "Delete an existing review" },
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
      CIN: "AA123456",
      roles: [initialRoles[0]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Client", lname: "Test" },
      username: "Client",
      email: "client@email.com",
      phoneNumber: "1234522310",
      password: "password",
      CIN: "CC123456",
      roles: [initialRoles[1]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Manager", lname: "Test" },
      username: "Manager",
      email: "manager@email.com",
      phoneNumber: "1234542410",
      password: "password",
      CIN: "MM123456",
      roles: [initialRoles[2]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Delivery", lname: "Test" },
      username: "Delivery",
      email: "delivery@email.com",
      phoneNumber: "1234562290",
      password: "password",
      CIN: "DD123456",
      roles: [initialRoles[3]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Client 2", lname: "Test" },
      username: "Client2",
      email: "client2@email.com",
      phoneNumber: "0987654321",
      password: "password",
      CIN: "CC654321",
      roles: [initialRoles[1]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Manager 2", lname: "Test" },
      username: "Manager2",
      email: "manager2@email.com",
      phoneNumber: "1122334455",
      password: "password",
      CIN: "MM654321",
      roles: [initialRoles[2]._id],
      isVerified: true,
    },
  ];

  // Create users
  const initialUsers = await User.insertMany(users);
  console.log("Users created: ", initialUsers);

  // Create restaurants
  const initialRestaurants = await Restaurant.insertMany([
    {
      name: "Restaurant 1",
      address: "Address 1",
      phoneNumber: "1122334455",
      website: "",
      description: "Description 1",
      owner: initialUsers[2]._id,
      openAt: "08:00",
      closeAt: "22:00",
      category: {
        name: "Fast Food",
        description: "Fast Food",
      },
    },
    {
      name: "Restaurant 2",
      address: "Address 2",
      phoneNumber: "2233445566",
      website: "http://restaurant2.com",
      description: "Description 2",
      owner: initialUsers[2]._id,
      openAt: "10:00",
      closeAt: "23:00",
      category: {
        name: "Italian",
        description: "Italian Cuisine",
      },
    },
  ]);
  console.log("Restaurants created: ", initialRestaurants);

  // Create items
  const initialItems = await Item.insertMany([
    {
      name: "Item 1",
      description: "Description 1",
      price: 10,
      restaurant: initialRestaurants[0]._id,
      category: "Category 1",
    },
    {
      name: "Item 2",
      description: "Description 2",
      price: 15,
      restaurant: initialRestaurants[1]._id,
      category: "Category 2",
    },
  ]);
  console.log("Items created: ", initialItems);

  // Create orders
  const seedOrders = async () => {
    const orders = [
      {
        user: initialUsers[1]._id, // Replace with a valid user ID
        items: [
          {
            item: initialItems[0]._id, // Replace with a valid item ID
            quantity: 2,
          },
          {
            item: initialItems[1]._id, // Replace with a valid item ID
            quantity: 1,
          },
        ],
        delivery: initialUsers[3]._id, // Replace with a valid user ID if necessary
        status: "Pending",
        totalAmount: 100.0,
        paymentId: "payment12345", // Provide a valid payment ID
        isDelivered: false,
      },
      // Add more orders as needed
    ];

    try {
      await Order.insertMany(orders);
      console.log("Orders seeded successfully!");
    } catch (error) {
      console.error("Error seeding the orders: ", error);
    }
  };

  // Call the seed function and wait for it to complete
  await seedOrders();

  // Close the connection
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Error seeding the database: ", error);
  process.exit(1);
});
