import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../models/index.js';
import { getJwtSecret } from '../middlewares/authMiddleware.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export class AuthController {
  static async getStatus(req, res) {
    const userCount = await User.count();
    res.json({
      success: true,
      data: { hasUsers: userCount > 0 }
    });
  }

  static async register(req, res) {
    const { name, email, password, workspaceName } = req.body;

    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Name, valid email, and password (min 6 characters) are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'admin'
    });

    const org = await Organization.create({
      name: workspaceName?.trim() || `${name.trim().split(' ')[0]}'s Workspace`,
      userId: user.id,
      currency: 'usd',
      planTier: 'free'
    });

    const token = signToken(user);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        organization: { id: org.id, name: org.name, planTier: org.planTier }
      }
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = signToken(user);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });
  }
}
