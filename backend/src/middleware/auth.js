const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET );
    req.user = decoded; // Adds userId and role to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Role-based Access Control (RBAC)
const isApprover = (req, res, next) => {
  if (req.user.role !== 'APPROVER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Requires Approver role" });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Requires Admin role" });
  }
  next();
};

const isCreator = (req, res, next) => {
  if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Requires Engineer or Admin role" });
  }
  next();
};

module.exports = { verifyToken, isApprover, isAdmin, isCreator };