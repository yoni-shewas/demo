import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';
import { getFileUrl } from '../config/upload.js';
import path from 'path';

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

// Old submitAssignment function removed - replaced with file upload version below

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

/**
 * Get all lessons for student's section
 * GET /api/student/lessons
 */
export async function getLessons(req, res) {
  try {
    const userId = req.user.userId;

    // Get student's section
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        section: {
          include: {
            lessons: {
              orderBy: { createdAt: 'desc' },
            },
            batch: true,
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

    if (!student.section) {
      return res.status(200).json({
        success: true,
        lessons: [],
        message: 'Student is not enrolled in any section',
      });
    }

    // Add file URLs to lessons
    const lessonsWithUrls = student.section.lessons.map(lesson => {
      let attachments = [];
      if (lesson.attachments) {
        try {
          attachments = JSON.parse(lesson.attachments).map(att => ({
            ...att,
            url: getFileUrl(req, att.filepath),
          }));
        } catch (e) {
          logger.warn('Failed to parse lesson attachments:', e);
        }
      }
      
      return {
        ...lesson,
        attachments,
        section: {
          id: student.section.id,
          name: student.section.name,
          batch: student.section.batch,
          instructor: student.section.instructor,
        },
      };
    });

    res.status(200).json({
      success: true,
      lessons: lessonsWithUrls,
      total: lessonsWithUrls.length,
    });
  } catch (error) {
    logger.error('Get student lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get a specific lesson
 * GET /api/student/lessons/:lessonId
 */
export async function getLesson(req, res) {
  try {
    const userId = req.user.userId;
    const { lessonId } = req.params;

    // Get student's section
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        section: {
          include: {
            lessons: {
              where: { id: lessonId },
            },
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
          },
        },
      },
    });

    if (!student || !student.section) {
      return res.status(404).json({
        success: false,
        message: 'Student or section not found',
      });
    }

    const lesson = student.section.lessons[0];
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or not accessible',
      });
    }

    // Add file URLs to lesson
    let attachments = [];
    if (lesson.attachments) {
      try {
        attachments = JSON.parse(lesson.attachments).map(att => ({
          ...att,
          url: getFileUrl(req, att.filepath),
        }));
      } catch (e) {
        logger.warn('Failed to parse lesson attachments:', e);
      }
    }

    const lessonWithUrls = {
      ...lesson,
      attachments,
      section: {
        id: student.section.id,
        name: student.section.name,
        instructor: student.section.instructor,
      },
    };

    res.status(200).json({
      success: true,
      lesson: lessonWithUrls,
    });
  } catch (error) {
    logger.error('Get student lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Submit assignment with file uploads
 * POST /api/student/submissions
 */
export async function submitAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId, submittedCode } = req.body;

    // Validation
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID is required',
      });
    }

    // Get student and verify assignment access
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        section: {
          include: {
            assignments: {
              where: { id: assignmentId },
            },
          },
        },
      },
    });

    if (!student || !student.section) {
      return res.status(404).json({
        success: false,
        message: 'Student or section not found',
      });
    }

    const assignment = student.section.assignments[0];
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not accessible',
      });
    }

    // Check if assignment is still open (due date validation)
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment submission deadline has passed',
        dueDate: assignment.dueDate,
      });
    }

    // Get current attempt number
    const existingSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        studentId: student.id,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    const attemptNumber = existingSubmissions.length > 0 
      ? existingSubmissions[0].attemptNumber + 1 
      : 1;

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          filepath: path.relative(path.join(process.cwd(), 'uploads'), file.path),
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        attemptNumber,
        submittedCode: submittedCode ? JSON.stringify(submittedCode) : null,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
      },
      include: {
        assignment: {
          select: {
            title: true,
            dueDate: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Add file URLs to response
    const submissionWithUrls = {
      ...submission,
      attachments: attachments.map(att => ({
        ...att,
        url: getFileUrl(req, att.filepath),
      })),
    };

    logger.info(`Student ${student.user?.email} submitted assignment ${assignmentId} (attempt ${attemptNumber})`);

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: submissionWithUrls,
    });
  } catch (error) {
    logger.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
