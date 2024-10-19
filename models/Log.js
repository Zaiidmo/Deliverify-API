//C:\Users\Youcode\Desktop\Deliverify-API\models\Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;