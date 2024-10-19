const io = require('socket.io-client');

// Connect to your backend Socket.IO server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

// Listen for the 'orderPaid' event
socket.on('orderPaid', (data) => {
    console.log('Order Paid Notification:', data);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
