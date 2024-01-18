
const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        // User is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // User is not logged in, redirect or send an unauthorized response
        res.status(401).json({ success: false, message: "Unauthorized access" });
    }
};



module.exports = authenticateUser ;