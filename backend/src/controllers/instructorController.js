import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * Get instructor's profile and sections
 * GET /api/instructor/profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const instructor = await prisma.instructor.findUnique({
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
        sections: {
          include: {
            batch: true,
            students: {
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

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found',
      });
    }

    logger.debug(`Instructor profile retrieved: ${req.user.email}`);

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    logger.error('Get instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all sections for the instructor
 * GET /api/instructor/sections
 */
export async function getSections(req, res) {
  try {
    const userId = req.user.userId;

    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            batch: true,
            students: true,
            assignments: true,
            lessons: true,
          },
        },
      },
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found',
      });
    }

    logger.debug(`Sections retrieved for instructor: ${req.user.email}`);

    res.json({
      success: true,
      data: instructor.sections,
    });
  } catch (error) {
    logger.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Create an assignment for a section
 * POST /api/instructor/assignments
 * Body: { title, description, starterCode, dueDate, sectionId }
 */
export async function createAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { title, description, starterCode, dueDate, sectionId } = req.body;

    // Validation
    if (!title || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Title and sectionId are required',
      });
    }

    // Verify instructor owns this section
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          where: { id: sectionId },
        },
      },
    });

    if (!instructor || instructor.sections.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this section',
      });
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        starterCode: starterCode || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        sectionId,
      },
      include: {
        section: {
          include: {
            batch: true,
          },
        },
      },
    });

    logger.info(`Assignment created by ${req.user.email}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    logger.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all assignments for instructor's sections
 * GET /api/instructor/assignments
 */
export async function getAssignments(req, res) {
  try {
    const userId = req.user.userId;

    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            assignments: {
              include: {
                section: {
                  include: {
                    batch: true,
                  },
                },
                submissions: {
                  include: {
                    student: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found',
      });
    }

    // Flatten assignments from all sections
    const allAssignments = instructor.sections.flatMap(
      (section) => section.assignments
    );

    logger.debug(`Assignments retrieved for instructor: ${req.user.email}`);

    res.json({
      success: true,
      data: allAssignments,
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
 * Get submissions for a specific assignment
 * GET /api/instructor/assignments/:assignmentId/submissions
 */
export async function getAssignmentSubmissions(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    // Verify instructor owns the section containing this assignment
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            assignments: {
              where: { id: assignmentId },
              include: {
                submissions: {
                  include: {
                    student: {
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

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found',
      });
    }

    // Find the assignment in instructor's sections
    let assignment = null;
    for (const section of instructor.sections) {
      const found = section.assignments.find((a) => a.id === assignmentId);
      if (found) {
        assignment = found;
        break;
      }
    }

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    logger.debug(
      `Submissions retrieved for assignment ${assignmentId} by ${req.user.email}`
    );

    res.json({
      success: true,
      data: assignment.submissions,
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
 * Update assignment
 * PUT /api/instructor/assignments/:assignmentId
 */
export async function updateAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;
    const { title, description, starterCode, dueDate } = req.body;

    // Verify instructor owns this assignment
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            assignments: {
              where: { id: assignmentId },
            },
          },
        },
      },
    });

    let hasAccess = false;
    if (instructor) {
      for (const section of instructor.sections) {
        if (section.assignments.length > 0) {
          hasAccess = true;
          break;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    // Update assignment
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title,
        description,
        starterCode,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    logger.info(
      `Assignment ${assignmentId} updated by ${req.user.email}`
    );

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated,
    });
  } catch (error) {
    logger.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Delete assignment
 * DELETE /api/instructor/assignments/:assignmentId
 */
export async function deleteAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    // Verify instructor owns this assignment
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            assignments: {
              where: { id: assignmentId },
            },
          },
        },
      },
    });

    let hasAccess = false;
    if (instructor) {
      for (const section of instructor.sections) {
        if (section.assignments.length > 0) {
          hasAccess = true;
          break;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this assignment',
      });
    }

    // Delete assignment (submissions will cascade delete)
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    logger.info(
      `Assignment ${assignmentId} deleted by ${req.user.email}`
    );

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    logger.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
