const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// REGISTER: Create a new user
const register = async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'ENGINEER' // Default role
      }
    });

    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN: (Already implemented, ensure it matches this style)
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET ,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role, name: user.name, userId: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGOUT: Stateless logout
const logout = async (req, res) => {
  // In a stateless JWT app, the server doesn't need to do much.
  // We just send a success message. Member B will delete the token from LocalStorage.
  res.json({ message: "Logged out successfully." });
};

const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      orderBy: { email: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword || "", user.password);
    if (!valid) return res.status(401).json({ message: "Current password is invalid" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, logout, listUsers, resetPassword };