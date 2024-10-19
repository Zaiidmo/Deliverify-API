const Order = require('../models/Order');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }

    initialize(io) {
        this.io = io;
        
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Handle user authentication
            socket.on('authenticate', async (data) => {
                try {
                    const { userId, roles } = data;
                    
                    this.connectedUsers.set(userId, {
                        socketId: socket.id,
                        roles: roles
                    });
                    
                    socket.userId = userId;
                    socket.roles = roles;
                    
                    console.log(`User ${userId} authenticated with roles:`, roles);
                    
                    // Acknowledge successful authentication
                    socket.emit('authenticated', { 
                        success: true, 
                        message: 'Successfully authenticated'
                    });
                } catch (error) {
                    console.error('Authentication error:', error);
                    socket.emit('authenticated', { 
                        success: false, 
                        message: 'Authentication failed'
                    });
                }
            });

            // Handle order acceptance by delivery person
            socket.on('acceptOrder', async (data) => {
                try {
                    const { orderId } = data;
                    const order = await Order.findById(orderId);
                    
                    if (order && order.status === 'Paid') {
                        order.status = 'Accepted';
                        order.Delivery = socket.userId;
                        await order.save();

                        // Notify user that their order was accepted
                        this.notifyUser(order.user, 'orderAccepted', {
                            orderId: order._id,
                            deliveryPersonId: socket.userId,
                            status: 'Accepted'
                        });

                        // Confirm to delivery person
                        socket.emit('orderAcceptanceConfirmed', {
                            orderId: order._id,
                            status: 'Accepted'
                        });
                    }
                } catch (error) {
                    console.error('Error accepting order:', error);
                    socket.emit('orderAcceptanceError', {
                        message: 'Failed to accept order'
                    });
                }
            });

            // Handle delivery status updates
            socket.on('updateDeliveryStatus', async (data) => {
                try {
                    const { orderId, status } = data;
                    const order = await Order.findById(orderId);
                    
                    if (order && order.Delivery.toString() === socket.userId) {
                        order.status = status;
                        await order.save();

                        // Notify user about status update
                        this.notifyUser(order.user, 'deliveryStatusUpdate', {
                            orderId: order._id,
                            status: status
                        });
                    }
                } catch (error) {
                    console.error('Error updating delivery status:', error);
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                    console.log(`User ${socket.userId} disconnected`);
                }
            });
        });
    }

    notifyDeliveryPersons(order) {
        console.log('Notifying delivery persons:', order._id);
        this.connectedUsers.forEach((user, userId) => {
            if (user.roles.includes('delivery')) {
                this.io.to(user.socketId).emit('newOrder', {
                    orderId: order._id,
                    totalAmount: order.totalAmount,
                    items: order.items,
                    status: order.status
                });
            }
        });
    }

    notifyUser(userId, event, data) {
        const userConnection = this.connectedUsers.get(userId.toString());
        if (userConnection) {
            this.io.to(userConnection.socketId).emit(event, data);
        }
    }
}

const socketService = new SocketService();
module.exports = socketService;
