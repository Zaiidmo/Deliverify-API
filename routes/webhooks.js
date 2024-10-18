const express = require('express');
const router = express.Router();
const { mollieWebhook } = require('../controllers/webhookController');

router.post('/payment', mollieWebhook);

module.exports = router;
