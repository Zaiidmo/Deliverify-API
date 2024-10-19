// config/socket.js
const socketIO = require('socket.io');

function initializeSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Connection handling
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Handle client authentication
        socket.on('authenticate', (data) => {
            const { userId, roles } = data;
            socket.userId = userId;
            socket.roles = roles;
            console.log(`User ${userId} authenticated with roles:`, roles);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = initializeSocket;