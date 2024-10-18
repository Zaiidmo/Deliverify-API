const { Server } = require("socket.io");

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // Adjust according to your frontend
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    return io;
};

module.exports = initializeSocket;
