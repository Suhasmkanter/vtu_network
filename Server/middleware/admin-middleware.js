const isAdminUser = (req, res, next) => {

    if (req.userInfo.role !== 'admin') {
        return res.status(403).json({
            message: "Access denied. Admin only resource.",
            success: false
        })
    }
    next();
}

module.exports = isAdminUser;