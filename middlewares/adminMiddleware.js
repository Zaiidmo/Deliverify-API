const isAdmin = (req, res, next) => {
    const adminRole = req.user.roles.find(role => role.name === 'Admin');
    if (!adminRole) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { isAdmin };
