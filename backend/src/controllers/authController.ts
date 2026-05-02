import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role, Session } from '../models/core';
import { ActivityLog } from '../models/extra';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecretkey456';

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
    });

    // Assign Citizen role by default
    const citizenRole = await Role.findOne({ where: { name: 'CITIZEN' } });
    if (citizenRole) {
      await (user as any).addRole(citizenRole);
    }

    await ActivityLog.create({
      userId: (user as any).id,
      action: 'REGISTER',
      details: `User ${email} registered.`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  const { adminKey, firstName, lastName, email, password, phone } = req.body;

  const expectedKey = process.env.ADMIN_REGISTER_KEY;
  if (!expectedKey || adminKey !== expectedKey) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      isVerified: true,
    });

    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    if (adminRole) {
      await (user as any).addRole(adminRole);
    }

    await ActivityLog.create({
      userId: (user as any).id,
      action: 'REGISTER_ADMIN',
      details: `Admin ${email} registered via private key.`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [Role],
    });

    const u: any = user as any;
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: u.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store session
    await Session.create({
      userId: u.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await ActivityLog.create({
      userId: u.id,
      action: 'LOGIN',
      details: `User ${email} logged in.`,
      ipAddress: req.ip,
    });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        roles: (u as any).roles.map((r: any) => r.name),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await Session.destroy({ where: { refreshToken } });
    }

    res.clearCookie('accessToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};
