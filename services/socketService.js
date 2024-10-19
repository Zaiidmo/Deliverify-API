const emitOrderPaid = (io, orderId, message) => {
    if (io) {
        io.emit('orderPaid', {
            orderId: orderId,
            message: message,
        });
        console.log(`Notified clients about order payment: ${orderId}`);
    } else {
        console.log('Socket.io instance is not available.');
    }
};

module.exports = { emitOrderPaid };
