const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const logService = require('../services/logService');


// Create a new role
const createRole = async (req, res) => {
    try {
        const { roleName } = req.body;

        const role = await Role.create({ name: roleName });
        
        try {
            const user = await User.findById(req.user._id);
            await logService.addLog( user._id ,"CREATE_ROLE",{role : role.name ,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
          } catch (logError) {
            console.error(" Error durring add user action to Logs :", logError);
          }


        return res.status(201).json({ message: 'Role created', role });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign permissions to a role
const assignPermissions = async (req, res) => {
    try {
        const { roleId, permissionIds } = req.body;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const permissions = await Permission.find({ _id: { $in: permissionIds } });
        if (permissions.length !== permissionIds.length) {
            return res.status(400).json({ message: 'Some permissions not found' });
        }

        role.permissions = [...role.permissions, ...permissionIds];
        await role.save();

        try {
            const user = await User.findById(req.user._id);
            await logService.addLog( user._id ,"ASSIGN_PERMISSIONS",{role : role.name ,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
          } catch (logError) {
            console.error(" Error durring add user action to Logs :", logError);
          }


        return res.status(200).json({ message: 'Permissions assigned', role });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign roles to users
const assignRoles = async (req, res) => {
    try {
        const { userId, roleIds } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const roles = await Role.find({ _id: { $in: roleIds } });
        if (roles.length !== roleIds.length) {
            return res.status(400).json({ message: 'Some roles not found' });
        }

        user.roles = [...user.roles, ...roleIds];
        await user.save();

        try {
            const user = await User.findById(req.user._id);
            await logService.addLog( user._id ,"ASSIGN_ROLES",{role : role.name ,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
          } catch (logError) {
            console.error(" Error durring add user action to Logs :", logError);
          }

        return res.status(200).json({ message: 'Roles assigned', user });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all roles
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions');
        return res.status(200).json({ roles });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createRole,
    assignPermissions,
    assignRoles,
    getAllRoles
};
