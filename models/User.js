const mongoose = require("mongoose");
const Role = require("../models/Role");

const userSchema = new mongoose.Schema({
  fullname: {
    fname: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    lname: {
      type: String,
      required: [true, "Last Name is required"],
      trim: true,
    },
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        const phoneRegex = /^[0-9]{10,14}$/;
        return phoneRegex.test(value);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  trustedDevices: [
    {
      agent: {
        type: String,
        trim: true,
      },
      deviceName: {
        type: String,
        trim: true,
        default: "Unknown Device", 
      },
      addedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
});

// Export the User model without passwordService
const User = mongoose.model('User', userSchema);
module.exports = User;
