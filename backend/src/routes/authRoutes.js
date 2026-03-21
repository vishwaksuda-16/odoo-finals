const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);
router.get('/users', verifyToken, listUsers);
router.patch('/reset-password', verifyToken, resetPassword);
router.post('/register', verifyToken, isAdmin, register);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteAllUsers);

module.exports = router;