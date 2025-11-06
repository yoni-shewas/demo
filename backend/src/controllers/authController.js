import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { createJWT } from '../utils/jwtUtils.js';
import logger from '../config/logger.js';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Register endpoint - DISABLED
 * Public registration is disabled. Users must be created by admin.
 * POST /api/auth/register
 */
export async function register(req, res) {
  return res.status(403).json({
    success: false,
    message: 'Public registration is disabled. Please contact your administrator to create an account.',
  });
}

/**
 * Login user and create JWT
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    logger.debug(`Login attempt for email: ${email}`);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate JWT
    const token = createJWT(
      payload,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN || '1d'
    );

    // Create session in database (optional tracking)
    const expiresInSeconds = parseExpiresIn(process.env.JWT_EXPIRES_IN || '1d');
    await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      },
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresInSeconds * 1000, // milliseconds
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in successfully: ${email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token, // Include token in response for Postman testing
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get current user info (protected route)
 * GET /api/auth/me
 */
export async function me(req, res) {
  try {
    // req.user is set by authMiddleware
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Optionally: Delete session from database
    // This would require storing session ID in JWT or cookie

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Helper function to parse expiresIn string
 */
function parseExpiresIn(expiresIn) {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 86400; // Default 1 day
  return parseInt(match[1], 10) * units[match[2]];
}
