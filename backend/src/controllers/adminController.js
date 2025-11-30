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
    const { username, email, password, role, firstName, lastName, studentId, batchId, sectionId } = req.body;

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
              studentId: studentId || null,
              batchId: batchId || null,
              sectionId: sectionId || null,
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
          password: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          studentProfile: {
            select: {
              studentId: true,
              batchId: true,
              sectionId: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  year: true,
                },
              },
              section: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          instructorProfile: {
            select: {
              id: true,
              sections: {
                select: {
                  id: true,
                  name: true,
                  batch: {
                    select: {
                      name: true,
                      type: true,
                    },
                  },
                },
              },
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
 * Update a user
 * PUT /api/admin/users/:id
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, password, role, firstName, lastName, studentProfile } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check for duplicate username/email (excluding current user)
    if (username || email) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists',
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role.toUpperCase();
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (password) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Update student profile batch/section if provided
    if (studentProfile && user.role === 'STUDENT') {
      const studentRecord = await prisma.student.findUnique({
        where: { userId: id },
      });

      if (studentRecord) {
        const studentUpdateData = {};
        if (studentProfile.batchId !== undefined) studentUpdateData.batchId = studentProfile.batchId || null;
        if (studentProfile.sectionId !== undefined) studentUpdateData.sectionId = studentProfile.sectionId || null;

        if (Object.keys(studentUpdateData).length > 0) {
          await prisma.student.update({
            where: { id: studentRecord.id },
            data: studentUpdateData,
          });
          logger.info(`Updated student batch/section for: ${user.email}`);
        }
      }
    }

    logger.info(`Admin updated user: ${user.email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Delete a user with cascading deletes
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: true,
        studentProfile: true,
        adminProfile: true,
      },
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

    // Perform cascading deletes based on role
    if (user.role === 'INSTRUCTOR' && user.instructorProfile) {
      // Unassign instructor from all sections
      await prisma.section.updateMany({
        where: { instructorId: user.instructorProfile.id },
        data: { instructorId: null },
      });

      // Delete assignments created by this instructor (if any)
      // Note: Assignments are linked to sections, not instructors directly
      
      // Delete lessons created by this instructor
      await prisma.lesson.deleteMany({
        where: { sectionId: { in: await getSectionIdsForInstructor(user.instructorProfile.id) } },
      });

      // Delete instructor profile
      await prisma.instructor.delete({
        where: { id: user.instructorProfile.id },
      });
    } else if (user.role === 'STUDENT' && user.studentProfile) {
      // Delete all submissions by this student
      await prisma.submission.deleteMany({
        where: { studentId: user.studentProfile.id },
      });

      // Delete student profile (this will automatically unassign from section)
      await prisma.student.delete({
        where: { id: user.studentProfile.id },
      });
    } else if (user.role === 'ADMIN' && user.adminProfile) {
      // Delete admin profile
      await prisma.admin.delete({
        where: { id: user.adminProfile.id },
      });
    }

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    // Finally, delete the user
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

/**
 * Get all submissions grouped by section and batch
 * GET /api/admin/submissions
 */
export async function getAllSubmissions(req, res) {
  try {
    // Get all batches with their sections, assignments, and submissions
    const batches = await prisma.batch.findMany({
      include: {
        sections: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            assignments: {
              include: {
                submissions: {
                  include: {
                    student: {
                      include: {
                        user: {
                          select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            username: true,
                          },
                        },
                      },
                    },
                  },
                  orderBy: {
                    submittedAt: 'desc',
                  },
                },
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
      orderBy: {
        year: 'desc',
      },
    });

    // Transform data for frontend
    const groupedData = batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      type: batch.type,
      year: batch.year,
      sections: batch.sections.map((section) => ({
        id: section.id,
        name: section.name,
        studentCount: section._count.students,
        instructor: section.instructor
          ? {
              id: section.instructor.id,
              name: `${section.instructor.user.firstName} ${section.instructor.user.lastName}`,
              email: section.instructor.user.email,
            }
          : null,
        submissions: section.assignments.flatMap((assignment) =>
          assignment.submissions.map((submission) => ({
            id: submission.id,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            submittedAt: submission.submittedAt,
            grade: submission.grade,
            feedback: submission.feedback,
            submittedCode: submission.submittedCode,
            student: {
              id: submission.student.id,
              studentId: submission.student.studentId,
              name: `${submission.student.user.firstName} ${submission.student.user.lastName}`,
              email: submission.student.user.email,
            },
          }))
        ),
      })),
    }));

    // Calculate total statistics
    const totalSubmissions = groupedData.reduce(
      (sum, batch) => sum + batch.sections.reduce((s, section) => s + section.submissions.length, 0),
      0
    );

    const totalGraded = groupedData.reduce(
      (sum, batch) =>
        sum + batch.sections.reduce((s, section) => s + section.submissions.filter((sub) => sub.grade !== null).length, 0),
      0
    );

    logger.info(`Admin retrieved all submissions: ${totalSubmissions} total`);

    res.json({
      success: true,
      data: groupedData,
      stats: {
        totalSubmissions,
        totalGraded,
        totalPending: totalSubmissions - totalGraded,
      },
    });
  } catch (error) {
    logger.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Helper function to get section IDs for an instructor
 */
async function getSectionIdsForInstructor(instructorId) {
  const sections = await prisma.section.findMany({
    where: { instructorId },
    select: { id: true },
  });
  return sections.map(s => s.id);
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
