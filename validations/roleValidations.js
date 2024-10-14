const name = {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Role name must be at least 3 characters long'],
    maxlength: [30, 'Role name cannot exceed 30 characters'],
};

module.exports = { name };
