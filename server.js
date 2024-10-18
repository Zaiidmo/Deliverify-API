require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verifyEmail');
const orderRoutes = require('./routes/order');
const webHooksRoutes = require('./routes/webhooks');
const initializeSocket = require('./config/socket');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const io = initializeSocket(server);

// MongoDB connection 
connectDB();

// Configure CORS
const corsOptions = {
    origin: "http://localhost:5173", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
    optionsSuccessStatus: 204, 
  };

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/webhooks', webHooksRoutes);

// Start the Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app instance for testing
module.exports = app;
