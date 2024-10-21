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
            default: [],
        },
    ],
    location: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
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
        description: {
            type: String,
            required: [true, "Category description is required"],
            trim: true,
        },
    }, 
    isApprouved: {
        type: Boolean,  
        default: false,
      },
      isDeleted: {
        type: Boolean,
        default: false, 
      },
});
restaurantSchema.pre("save", function (next) {
    if (this.images.length > 5) {
        return next(new Error("You cannot upload more than 5 images!"));
    }
    next();
});
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', category: 'text'});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
