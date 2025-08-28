const connectDB = require("./config/db");
const Role = require("./models/Role");
const User = require("./models/User");
const Permission = require("./models/Permission");
const Restaurant = require("./models/Restaurant");
const Item = require("./models/Item");
const Order = require("./models/Order");
const passwordService = require("./services/passwordService");

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
    {
      name: "DELETE_REVIEW",
      description: "Delete an existing review",
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

const hashedPassword = await passwordService.hashPassword("password");
  const users = [
    {
      fullname: { fname: "Admin", lname: "Test" },
      username: "Admin",
      email: "admin@email.com",
      phoneNumber: "1234567890",
      password: hashedPassword,
      CIN: "AA123456",
      roles: [initialRoles[0]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Client", lname: "Test" },
      username: "Client",
      email: "client@email.com",
      phoneNumber: "1234522310",
      password: hashedPassword,
      CIN: "CC123456",
      roles: [initialRoles[1]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Manager", lname: "Test" },
      username: "Manager",
      email: "manager@email.com",
      phoneNumber: "1234542410",
      password: hashedPassword,
      CIN: "MM123456",
      roles: [initialRoles[2]._id],
      isVerified: true,
    },
    {
      fullname: { fname: "Delivery", lname: "Test" },
      username: "Delivery",
      email: "delivery@email.com",
      phoneNumber: "1234562290",
      password: hashedPassword,
      CIN: "DD123456",
      roles: [initialRoles[3]._id],
      isVerified: true,
    },
  ];

  // Create users
  const initialUsers = await User.insertMany(users);
  //   console.log("Users created: ", initialUsers);
  const initialRestaurants = await Restaurant.insertMany([
    {
      name: "Restaurant 1",
      address: "Address 1",
      phoneNumber: "1122334455",
      logo: "path/to/logo1.jpg", // Chemin vers le logo
      cover: "path/to/cover1.jpg", // Chemin vers la couverture
      images: [
        "path/to/image1.jpg",
        "path/to/image2.jpg",
        "path/to/image3.jpg",
        "path/to/image4.jpg",
      ], // Liste des images
      owner: initialUsers[2]._id,
      openAt: "08:00",
      closeAt: "22:00",
      category: {
        name: "Fast Food",
        description: "Fast Food",
      },
      location: {
        type: "Point",
        coordinates: [40.712776, -74.005974], // Exemple de coordonnées
      },
    },
    {
      name: "Restaurant 2",
      address: "Address 2",
      phoneNumber: "2233445566",
      logo: "path/to/logo2.jpg",
      cover: "path/to/cover2.jpg",
      images: [
        "path/to/image5.jpg",
        "path/to/image6.jpg",
        "path/to/image7.jpg",
        "path/to/image8.jpg",
      ],
      owner: initialUsers[1]._id,
      openAt: "10:00",
      closeAt: "23:00",
      category: {
        name: "Italian",
        description: "Italian Cuisine",
      },
      location: {
        type: "Point",
        coordinates: [34.052235, -118.243683],
      },
    },
    {
      name: "Restaurant 3",
      address: "Address 3",
      phoneNumber: "3344556677",
      logo: "path/to/logo3.jpg",
      cover: "path/to/cover3.jpg",
      images: ["path/to/image9.jpg", "path/to/image10.jpg"],
      owner: initialUsers[0]._id,
      openAt: "09:00",
      closeAt: "21:00",
      category: {
        name: "Chinese",
        description: "Chinese Cuisine",
      },
      location: {
        type: "Point",
        coordinates: [51.507351, -0.127758],
      },
    },
  ]);

  const initialItem = await Item.insertMany([
    {
      name: "Item 1",
      description: "Description 1",
      price: 10,
      restaurant: initialRestaurants[0]._id,
      category: "Category 1",
    },
  ]);

  const initialOrder = await Order.insertMany([
    {
      user: initialUsers[1]._id,
      items: [
        {
          item: initialItem[0]._id,
          quantity: 2,
        },
      ],
      Delivery: initialUsers[3]._id,
      totalAmount: 20,
    },
  ]);
  // Close the connection
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Error seeding the database: ", error);
  process.exit(1);
});
