const emitOrderPaid = (io, orderId, message) => {
    io.emit('orderPaid', { orderId, message });
}

module.exports = { emitOrderPaid };