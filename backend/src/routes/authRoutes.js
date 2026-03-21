const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  listUsers,
  forgotPassword,
  resetPasswordWithOtp,
  resetPassword,
  deleteUser,
  updateUser,
  deleteAllUsers
} = require('../controllers/authController');
const {verifyToken,isAdmin} = require('../middleware/auth');


// POST /api/auth/login
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordWithOtp);

// POST /api/auth/logout
router.post('/logout', logout);
router.get('/users', verifyToken, listUsers);
router.patch('/reset-password', verifyToken, resetPassword);
router.post('/register', verifyToken, isAdmin, register);
router.patch('/users/:id', verifyToken, isAdmin, updateUser);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteAllUsers);

module.exports = router;