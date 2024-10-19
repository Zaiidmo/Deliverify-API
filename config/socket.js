const { Server } = require("socket.io");

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust according to your frontend
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Add event listener for client connection
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);

        // Emit a test event to check if the client receives it
        socket.emit('orderPaid', {
            message: 'Test order has been paid!',
            orderId: 'test123',
            username: 'testUser'
        });

        // Handle disconnect event
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = initializeSocket;
