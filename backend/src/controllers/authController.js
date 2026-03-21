const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const isValidGmail = (email = '') => /^[^\s@]+@gmail\.com$/i.test(String(email).trim());

// REGISTER: Create a new user
const register = async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!isValidGmail(normalizedEmail)) {
      return res.status(400).json({ message: "Only @gmail.com email addresses are allowed" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
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

// LOGIN: 
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
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

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === req.user.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { userId: id } });
      await tx.eCO.deleteMany({ where: { createdById: id } });
      await tx.user.delete({ where: { id } });
    });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, role } = req.body;
  try {
    if (id === req.user.userId && role && role !== 'ADMIN') {
      return res.status(400).json({ message: "Admin cannot remove own admin access" });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "User not found" });

    if (email !== undefined && !isValidGmail(email)) {
      return res.status(400).json({ message: "Only @gmail.com email addresses are allowed" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined ? { email: String(email).trim().toLowerCase() } : {}),
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(role !== undefined ? { role } : {})
      },
      select: { id: true, email: true, name: true, role: true }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { userId: { not: req.user.userId } } });
      await tx.eCO.deleteMany({ where: { createdById: { not: req.user.userId } } });
      await tx.user.deleteMany({ where: { id: { not: req.user.userId } } });
    });
    res.json({ message: "All other users deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, logout, listUsers, resetPassword, deleteUser, updateUser, deleteAllUsers };