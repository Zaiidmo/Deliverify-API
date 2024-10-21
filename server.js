// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verifyEmail');
const orderRoutes = require('./routes/order');
const webHooksRoutes = require('./routes/webhooks');
const http = require('http');
const cors = require('cors');
const initializeSocketServer = require('./socket-server'); // Import the socket server setup
const socketService = require('./services/socketService');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// MongoDB connection
connectDB();

// Configure CORS
const corsOptions = {
    origin: "http://localhost:5173", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/order', orderRoutes(socketService.io));
app.use('/api/webhooks', webHooksRoutes);
app.use("/api/search", searchRoutes);

// Initialize Socket.IO server
const io = initializeSocketServer(server);

// Start the Server
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


module.exports = { app, server }; 
