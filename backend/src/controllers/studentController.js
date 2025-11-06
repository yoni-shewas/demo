import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * Get student profile with enrollments
 * GET /api/student/profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        batch: true,
        section: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            assignments: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    logger.debug(`Student profile retrieved: ${req.user.email}`);

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    logger.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all assignments for student's section
 * GET /api/student/assignments
 */
export async function getAssignments(req, res) {
  try {
    const userId = req.user.userId;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        section: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: {
                    student: {
                      userId,
                    },
                  },
                  orderBy: {
                    submittedAt: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const assignments = student.section?.assignments || [];

    logger.debug(`Assignments retrieved for student: ${req.user.email}`);

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    logger.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get a specific assignment with student's submissions
 * GET /api/student/assignments/:assignmentId
 */
export async function getAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Get assignment with student's submissions
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        section: true,
        submissions: {
          where: {
            studentId: student.id,
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Verify student is enrolled in this section
    if (student.sectionId !== assignment.sectionId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    logger.debug(
      `Assignment ${assignmentId} retrieved by student: ${req.user.email}`
    );

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Submit code for an assignment
 * POST /api/student/submissions
 * Body: { assignmentId, submittedCode, executionResult }
 */
export async function submitAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId, submittedCode, executionResult } = req.body;

    // Validation
    if (!assignmentId || !submittedCode) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and submitted code are required',
      });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Verify assignment exists and student has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        section: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (student.sectionId !== assignment.sectionId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    // Check if past due date
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      logger.warn(
        `Late submission attempt by ${req.user.email} for assignment ${assignmentId}`
      );
      // Allow submission but log it as late
    }

    // Count existing submissions to determine attempt number
    const existingSubmissions = await prisma.submission.count({
      where: {
        assignmentId,
        studentId: student.id,
      },
    });

    const attemptNumber = existingSubmissions + 1;

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        attemptNumber,
        submittedCode,
        executionResult: executionResult || null,
        score: null, // To be graded by instructor
      },
    });

    logger.info(
      `Submission created by ${req.user.email} for assignment ${assignmentId} (attempt ${attemptNumber})`
    );

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission,
    });
  } catch (error) {
    logger.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all submissions for the student
 * GET /api/student/submissions
 */
export async function getSubmissions(req, res) {
  try {
    const userId = req.user.userId;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        assignment: {
          include: {
            section: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    logger.debug(`Submissions retrieved for student: ${req.user.email}`);

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get submissions for a specific assignment
 * GET /api/student/assignments/:assignmentId/submissions
 */
export async function getAssignmentSubmissions(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Verify student has access to this assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (student.sectionId !== assignment.sectionId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        studentId: student.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    logger.debug(
      `Submissions for assignment ${assignmentId} retrieved by student: ${req.user.email}`
    );

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
