const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNotification } = require('../utils/mailer');
const prisma = new PrismaClient();

function generateSixDigitOtp() {
  return String(100000 + crypto.randomInt(900000));
}

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

    // Send login credentials to user's email
    const mailConfigured = !!(process.env.MAIL_USER && process.env.MAIL_PASS);
    if (mailConfigured) {
      try {
        await sendNotification(
          user.email,
          'PLM Sentry — Your Account Credentials',
          `Your PLM Sentry account has been created.\n\nEmail (Login ID): ${user.email}\nPassword: ${password}\n\nSign in at your application URL. Please change your password after first login for security.`,
          `<h2>Welcome to PLM Sentry</h2><p>Your account has been created. Use these credentials to sign in:</p><p><b>Email (Login ID):</b> ${user.email}</p><p><b>Password:</b> ${password}</p><p style="margin-top:16px;color:#64748b;font-size:13px">Please change your password after your first login for security.</p>`
        );
      } catch (err) {
        console.error('Welcome email failed:', err.message);
      }
    }

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

/** Request OTP by email (Nodemailer). */
const forgotPassword = async (req, res) => {
  const generic =
    'If that email is registered, you will receive a one-time code shortly.';
  try {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !isValidGmail(normalizedEmail)) {
      return res.json({ message: generic });
    }

    const mailConfigured = !!(process.env.MAIL_USER && process.env.MAIL_PASS);
    if (!mailConfigured && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'Password reset email is not configured.' });
    }

    await prisma.passwordResetOtp.deleteMany({ where: { userId: user.id } });

    const otp = generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetOtp.create({
      data: { userId: user.id, otpHash, expiresAt }
    });

    const payload = { message: generic };

    if (mailConfigured) {
      try {
        await sendNotification(
          user.email,
          'PLM Sentry — password reset code',
          `Your one-time password reset code is: ${otp}\nIt expires in 15 minutes.\nIf you did not request this, ignore this email.`,
          `<p>Your one-time password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#1e40af">${otp}</p><p style="color:#64748b;font-size:14px">This code expires in <b>15 minutes</b>.</p><p style="font-size:12px;color:#94a3b8">If you did not request a reset, you can ignore this email.</p>`
        );
      } catch (err) {
        console.error('Forgot-password email failed:', err.message);
        if (process.env.NODE_ENV !== 'production') {
          payload.devOtp = otp;
          payload.message = `${generic} (dev: email failed; use devOtp below)`;
        } else {
          return res.status(503).json({ message: 'Could not send email. Try again later.' });
        }
      }
    } else {
      console.warn('[auth] MAIL_USER/MAIL_PASS not set — OTP (dev only):', otp);
      if (process.env.NODE_ENV !== 'production') {
        payload.devOtp = otp;
        payload.message = `${generic} (dev: check server console or devOtp)`;
      }
    }

    return res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Set new password using email + OTP from email. */
const resetPasswordWithOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = req.body?.newPassword;

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const rows = await prisma.passwordResetOtp.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    let matched = null;
    for (const row of rows) {
      const ok = await bcrypt.compare(otp, row.otpHash);
      if (ok) {
        matched = row;
        break;
      }
    }

    if (!matched) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      await tx.passwordResetOtp.deleteMany({ where: { userId: user.id } });
    });

    res.json({ message: 'Password updated. You can sign in now.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

module.exports = {
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
};