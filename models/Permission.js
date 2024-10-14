const mongoose = require('mongoose');
const permissionValidations = require('../validations/permissionValidations');

const permissionSchema = new mongoose.Schema({
    name: permissionValidations.name,
    description: permissionValidations.description
}, { timestamps: true });

//create Permission Model
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;