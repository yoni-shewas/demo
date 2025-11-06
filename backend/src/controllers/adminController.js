import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import logger from '../config/logger.js';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Create a single user (Admin only)
 * POST /api/admin/users
 */
export async function createUser(req, res) {
  try {
    const { username, email, password, role, firstName, lastName, studentId } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and role are required',
      });
    }

    const validRoles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, INSTRUCTOR, or STUDENT',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const normalizedRole = role.toUpperCase();

    // Create user with role profile
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: normalizedRole,
        firstName: firstName || null,
        lastName: lastName || null,
        ...(normalizedRole === 'ADMIN' && {
          adminProfile: { create: {} },
        }),
        ...(normalizedRole === 'INSTRUCTOR' && {
          instructorProfile: { create: {} },
        }),
        ...(normalizedRole === 'STUDENT' && {
          studentProfile: { 
            create: { 
              studentId: studentId || null 
            } 
          },
        }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        studentProfile: {
          select: {
            studentId: true,
          },
        },
      },
    });

    logger.info(`Admin created user: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Import users from CSV (flexible format)
 * POST /api/admin/users/import/csv
 * Expects multipart/form-data with 'file' field
 */
export async function importUsersFromCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required',
      });
    }

    logger.info(`CSV import started: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse CSV
    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty or invalid',
      });
    }

    const results = {
      total: records.length,
      successful: [],
      failed: [],
    };

    // Process each record
    for (const record of records) {
      try {
        // Flexible field mapping (case-insensitive)
        const fieldMap = normalizeFields(record);
        
        const username = fieldMap.username || fieldMap.email?.split('@')[0];
        const email = fieldMap.email;
        const password = fieldMap.password || generateRandomPassword();
        const role = (fieldMap.role || 'STUDENT').toUpperCase();
        const firstName = fieldMap.firstname || fieldMap.first_name;
        const lastName = fieldMap.lastname || fieldMap.last_name;
        const studentId = fieldMap.studentid || fieldMap.student_id || fieldMap.id_number;

        if (!email) {
          results.failed.push({
            record,
            error: 'Email is required',
          });
          continue;
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, ...(username ? [{ username }] : [])],
          },
        });

        if (existingUser) {
          results.failed.push({
            record,
            error: 'User already exists',
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
          data: {
            username: username || email.split('@')[0],
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            ...(role === 'ADMIN' && {
              adminProfile: { create: {} },
            }),
            ...(role === 'INSTRUCTOR' && {
              instructorProfile: { create: {} },
            }),
            ...(role === 'STUDENT' && {
              studentProfile: { 
                create: { 
                  studentId 
                } 
              },
            }),
          },
        });

        results.successful.push({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          generatedPassword: fieldMap.password ? null : password,
        });
      } catch (error) {
        results.failed.push({
          record,
          error: error.message,
        });
      }
    }

    logger.info(`CSV import completed: ${results.successful.length}/${results.total} successful`);

    res.status(200).json({
      success: true,
      message: `Imported ${results.successful.length} out of ${results.total} users`,
      results,
    });
  } catch (error) {
    logger.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Import users from SQL export (flexible JSON format)
 * POST /api/admin/users/import/sql
 * Body: JSON array of user objects
 */
export async function importUsersFromSQL(req, res) {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty',
      });
    }

    const results = {
      total: users.length,
      successful: [],
      failed: [],
    };

    for (const record of users) {
      try {
        const fieldMap = normalizeFields(record);
        
        const username = fieldMap.username || fieldMap.email?.split('@')[0];
        const email = fieldMap.email;
        const password = fieldMap.password || generateRandomPassword();
        const role = (fieldMap.role || 'STUDENT').toUpperCase();
        const firstName = fieldMap.firstname || fieldMap.first_name;
        const lastName = fieldMap.lastname || fieldMap.last_name;
        const studentId = fieldMap.studentid || fieldMap.student_id || fieldMap.id_number;

        if (!email) {
          results.failed.push({
            record,
            error: 'Email is required',
          });
          continue;
        }

        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, ...(username ? [{ username }] : [])],
          },
        });

        if (existingUser) {
          results.failed.push({
            record,
            error: 'User already exists',
          });
          continue;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
          data: {
            username: username || email.split('@')[0],
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            ...(role === 'ADMIN' && {
              adminProfile: { create: {} },
            }),
            ...(role === 'INSTRUCTOR' && {
              instructorProfile: { create: {} },
            }),
            ...(role === 'STUDENT' && {
              studentProfile: { 
                create: { 
                  studentId 
                } 
              },
            }),
          },
        });

        results.successful.push({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          generatedPassword: fieldMap.password ? null : password,
        });
      } catch (error) {
        results.failed.push({
          record,
          error: error.message,
        });
      }
    }

    logger.info(`SQL/JSON import completed: ${results.successful.length}/${results.total} successful`);

    res.status(200).json({
      success: true,
      message: `Imported ${results.successful.length} out of ${results.total} users`,
      results,
    });
  } catch (error) {
    logger.error('SQL import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Export all users to CSV
 * GET /api/admin/users/export/csv
 */
export async function exportUsersToCSV(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        studentProfile: {
          select: {
            studentId: true,
          },
        },
      },
    });

    const records = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      studentId: user.studentProfile?.studentId || '',
      createdAt: user.createdAt.toISOString(),
    }));

    const csv = stringify(records, {
      header: true,
      columns: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'studentId', 'createdAt'],
    });

    logger.info(`CSV export completed: ${users.length} users exported`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all users (with pagination)
 * GET /api/admin/users
 */
export async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 50, role } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = role ? { role: role.toUpperCase() } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          studentProfile: {
            select: {
              studentId: true,
              batchId: true,
              sectionId: true,
            },
          },
          instructorProfile: {
            select: {
              id: true,
            },
          },
          adminProfile: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Delete a user
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (user.id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    logger.info(`Admin deleted user: ${user.email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Helper functions

/**
 * Normalize field names to lowercase for flexible mapping
 */
function normalizeFields(record) {
  const normalized = {};
  for (const [key, value] of Object.entries(record)) {
    normalized[key.toLowerCase().replace(/[^a-z0-9_]/g, '')] = value;
  }
  return normalized;
}

/**
 * Generate random password
 */
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
