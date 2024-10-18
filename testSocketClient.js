const io = require('socket.io-client');

// Connect to the backend server (ensure the URL matches your backend's running instance)
const socket = io('http://localhost:3000');

// Listen for the 'orderPaid' event
socket.on('orderPaid', (data) => {
    console.log('Received orderPaid event:', data);
});

// Optional: Add any error or connection event listeners for debugging
socket.on('connect', () => {
    console.log('Socket connected successfully!');
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});
