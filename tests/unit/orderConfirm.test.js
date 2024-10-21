//tests\unit\orderConfirm.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const jwtService = require('../services/jwtService');
const Order = require('../models/Order');
const orderController = require('../controllers/orderController');

describe('Order Controller - confirmDelivery', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer validToken'
            },
            body: {
                orderId: 'validOrderId'
            }
        };

        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };

        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 401 if token is missing', async () => {
        req.headers.authorization = undefined;

        await orderController.confirmDelivery(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: 'Unauthorized: Missing token' })).to.be.true;
    });

    it('should return 401 if token is invalid', async () => {
        sinon.stub(jwtService, 'verifyToken').returns(null);

        await orderController.confirmDelivery(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: 'Unauthorized: Invalid token' })).to.be.true;
    });

    it('should return 404 if order is not found', async () => {
        sinon.stub(jwtService, 'verifyToken').returns({ _id: 'userId' });
        sinon.stub(Order, 'findById').returns(null);

        await orderController.confirmDelivery(req, res, next);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Order not found' })).to.be.true;
    });

    it('should confirm delivery successfully', async () => {
        const mockOrder = {
            _id: 'validOrderId',
            isDelivered: false,
            save: sinon.stub().resolves()
        };

        sinon.stub(jwtService, 'verifyToken').returns({ _id: 'userId' });
        sinon.stub(Order, 'findById').returns(mockOrder);

        await orderController.confirmDelivery(req, res, next);

        expect(mockOrder.isDelivered).to.be.true;
        expect(mockOrder.save.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ message: 'Delivery confirmed successfully', order: mockOrder })).to.be.true;
    });

    it('should handle internal server error', async () => {
        const errorMessage = 'Internal Server Error';
        sinon.stub(jwtService, 'verifyToken').returns({ _id: 'userId' });
        sinon.stub(Order, 'findById').throws(new Error(errorMessage));

        await orderController.confirmDelivery(req, res, next);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: `Internal Server Error: ${errorMessage}` })).to.be.true;
    });
});
