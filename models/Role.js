const mongoose = require('mongoose');
const roleValidations = require('../validations/roleValidations');

const roleSchema = new mongoose.Schema({
    name: roleValidations.name,
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;