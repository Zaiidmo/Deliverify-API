const name = {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Permission name must be at least 3 characters long'],
    maxlength: [30, 'Permission name cannot exceed 30 characters'],
};

const description = {
    type: String,
    required: false,
    trim: true,
    minlength: [3, 'Permission description must be at least 3 characters long'],
    maxlength: [100, 'Permission description cannot exceed 100 characters'],
};

module.exports = { name, description };
