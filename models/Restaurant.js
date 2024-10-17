const mongoose = require("mongoose");

const restaurantSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
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
    logo: {
        type: String,
        default: "default-restaurant.jpg",
    },
    cover: {
        type: String,
        default: "default-cover.jpg",
    },
    images: [
        {
            type: String,
        },
    ],
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    openAt: {
        type: String,
        required: [true, "Opening time is required"],
    },
    closeAt: {
        type: String,
        required: [true, "Closing time is required"],
    },
    category: {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },
    }    
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
