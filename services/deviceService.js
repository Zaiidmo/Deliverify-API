const crypto = require("crypto");

const getTheDevice = (req) => {
  const agent = req.headers["user-agent"] || "unknown-user-agent";
  const deviceName = req.body.deviceName || "Unknown Device";
  const ipAddress = req.ip || "unknown-ip";
  const device = {
    agent,
    deviceName,
    ipAddress,
  }
  return device;
};

module.exports = { getTheDevice };
