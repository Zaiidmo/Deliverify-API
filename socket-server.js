const socketIO = require('socket.io');
const socketService = require('./services/socketService');

function initializeSocketServer(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    socketService.initialize(io);
    return io;
}

module.exports = initializeSocketServer;
