const { Server } = require('socket.io');

const initializeSocket = (server) => {
    const io = new Server(server);
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
        });
    });
    return io;
};

module.exports = initializeSocket;