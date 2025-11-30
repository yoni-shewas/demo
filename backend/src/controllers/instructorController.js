import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import logger from '../config/logger.js';
import { validateSolutionCode } from '../services/codeExecutor.js';
import { getFileUrl, deleteFile } from '../config/upload.js';

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
            students: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                students: true,
                assignments: true,
                lessons: true,
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
 * Body: { title, description, starterCode, solutionCode, testCases, startDate, dueDate, sectionId }
 */
export async function createAssignment(req, res) {
  try {
    const userId = req.user.userId;
    const { title, description, starterCode, solutionCode, testCases, hiddenTestCases, startDate, dueDate, sectionId } = req.body;

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

    // Parse JSON strings if provided
    let parsedStarterCode = null;
    let parsedSolutionCode = null;
    let parsedTestCases = null;

    if (starterCode) {
      try {
        parsedStarterCode = typeof starterCode === 'string' ? JSON.parse(starterCode) : starterCode;
      } catch (e) {
        parsedStarterCode = starterCode;
      }
    }

    if (solutionCode) {
      try {
        parsedSolutionCode = typeof solutionCode === 'string' ? JSON.parse(solutionCode) : solutionCode;
      } catch (e) {
        parsedSolutionCode = solutionCode;
      }
    }

    if (testCases) {
      try {
        parsedTestCases = typeof testCases === 'string' ? JSON.parse(testCases) : testCases;
      } catch (e) {
        parsedTestCases = testCases;
      }
    }

    let parsedHiddenTestCases = null;
    if (hiddenTestCases) {
      try {
        parsedHiddenTestCases = typeof hiddenTestCases === 'string' ? JSON.parse(hiddenTestCases) : hiddenTestCases;
      } catch (e) {
        parsedHiddenTestCases = hiddenTestCases;
      }
    }

    // Validate solution code against test cases if provided
    if (parsedSolutionCode && (parsedTestCases || parsedHiddenTestCases)) {
      const allTestCases = [...(parsedTestCases || []), ...(parsedHiddenTestCases || [])];
      
      if (allTestCases.length > 0) {
        logger.info('Validating solution code against test cases...');
        const validation = await validateSolutionCode(
          parsedSolutionCode,
          parsedTestCases || [],
          parsedHiddenTestCases || []
        );

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: 'Solution code validation failed',
            error: validation.error,
            testResults: validation.results,
          });
        }

        logger.info(`Solution code validated successfully: ${validation.message}`);
      }
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        starterCode: parsedStarterCode,
        solutionCode: parsedSolutionCode,
        testCases: parsedTestCases,
        hiddenTestCases: parsedHiddenTestCases,
        startDate: startDate ? new Date(startDate) : null,
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
 * Get all submissions for instructor's assignments
 * GET /api/instructor/submissions
 */
export async function getAllSubmissions(req, res) {
  try {
    const userId = req.user.userId;

    // Get instructor with all sections and their assignments
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            assignments: {
              include: {
                submissions: {
                  include: {
                    student: {
                      include: {
                        user: {
                          select: {
                            id: true,
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

    // Flatten all submissions from all assignments
    const allSubmissions = instructor.sections.flatMap((section) =>
      section.assignments.flatMap((assignment) =>
        assignment.submissions.map((submission) => ({
          ...submission,
          student: {
            id: submission.student.id,
            studentId: submission.student.studentId,
            firstName: submission.student.user.firstName,
            lastName: submission.student.user.lastName,
            email: submission.student.user.email,
          },
        }))
      )
    );

    logger.debug(`All submissions retrieved for instructor: ${req.user.email} (${allSubmissions.length} total)`);

    res.json({
      success: true,
      submissions: allSubmissions,
      total: allSubmissions.length,
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
    const { title, description, starterCode, solutionCode, testCases, hiddenTestCases, startDate, dueDate } = req.body;

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

    // Parse JSON strings if provided
    const updateData = {
      title,
      description,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (starterCode !== undefined) {
      try {
        updateData.starterCode = typeof starterCode === 'string' ? JSON.parse(starterCode) : starterCode;
      } catch (e) {
        updateData.starterCode = starterCode;
      }
    }

    if (solutionCode !== undefined) {
      try {
        updateData.solutionCode = typeof solutionCode === 'string' ? JSON.parse(solutionCode) : solutionCode;
      } catch (e) {
        updateData.solutionCode = solutionCode;
      }
    }

    if (testCases !== undefined) {
      try {
        updateData.testCases = typeof testCases === 'string' ? JSON.parse(testCases) : testCases;
      } catch (e) {
        updateData.testCases = testCases;
      }
    }

    if (hiddenTestCases !== undefined) {
      try {
        updateData.hiddenTestCases = typeof hiddenTestCases === 'string' ? JSON.parse(hiddenTestCases) : hiddenTestCases;
      } catch (e) {
        updateData.hiddenTestCases = hiddenTestCases;
      }
    }

    // Update assignment
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
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

    // First, explicitly delete all submissions for this assignment
    // This ensures cascade delete works properly
    const deleteSubmissions = await prisma.submission.deleteMany({
      where: { assignmentId },
    });

    logger.info(
      `Deleted ${deleteSubmissions.count} submissions for assignment ${assignmentId}`
    );

    // Now delete the assignment
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    logger.info(
      `Assignment ${assignmentId} deleted by ${req.user.email}`
    );

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
      deletedSubmissions: deleteSubmissions.count,
    });
  } catch (error) {
    logger.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Create a new lesson
 * POST /api/instructor/lessons
 */
export async function createLesson(req, res) {
  try {
    const userId = req.user.userId;
    const { title, content, sectionId } = req.body;

    // Validation
    if (!title || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Title and section ID are required',
      });
    }

    // Verify instructor owns the section
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
        message: 'You can only create lessons for your own sections',
      });
    }

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

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content: content || null,
        sectionId,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
      },
      include: {
        section: {
          include: {
            batch: true,
          },
        },
      },
    });

    // Add file URLs to response
    const lessonWithUrls = {
      ...lesson,
      attachments: attachments.map(att => ({
        ...att,
        url: getFileUrl(req, att.filepath),
      })),
    };

    logger.info(`Instructor created lesson: ${title} for section ${sectionId}`);

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson: lessonWithUrls,
    });
  } catch (error) {
    logger.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all lessons for instructor's sections
 * GET /api/instructor/lessons
 */
export async function getLessons(req, res) {
  try {
    const userId = req.user.userId;
    const { sectionId } = req.query;

    // Get instructor's sections
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      include: {
        sections: {
          include: {
            lessons: {
              orderBy: { createdAt: 'desc' },
            },
            batch: true,
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

    let lessons = [];
    
    if (sectionId) {
      // Get lessons for specific section
      const section = instructor.sections.find(s => s.id === sectionId);
      if (section) {
        lessons = section.lessons;
      }
    } else {
      // Get all lessons from all sections
      instructor.sections.forEach(section => {
        lessons.push(...section.lessons.map(lesson => ({
          ...lesson,
          section: {
            id: section.id,
            name: section.name,
            batch: section.batch,
          },
        })));
      });
      
      // Sort by creation date
      lessons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Add file URLs to attachments
    const lessonsWithUrls = lessons.map(lesson => {
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
      };
    });

    res.status(200).json({
      success: true,
      lessons: lessonsWithUrls,
      total: lessonsWithUrls.length,
    });
  } catch (error) {
    logger.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Update a lesson
 * PUT /api/instructor/lessons/:lessonId
 */
export async function updateLesson(req, res) {
  try {
    const userId = req.user.userId;
    const { lessonId } = req.params;
    const { title, content } = req.body;

    // Verify lesson belongs to instructor
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          instructorId: {
            in: await prisma.instructor.findMany({
              where: { userId },
              select: { id: true },
            }).then(instructors => instructors.map(i => i.id)),
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or access denied',
      });
    }

    // Handle new file attachments
    let existingAttachments = [];
    if (lesson.attachments) {
      try {
        existingAttachments = JSON.parse(lesson.attachments);
      } catch (e) {
        logger.warn('Failed to parse existing attachments:', e);
      }
    }

    const newAttachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        newAttachments.push({
          filename: file.originalname,
          filepath: path.relative(path.join(process.cwd(), 'uploads'), file.path),
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const allAttachments = [...existingAttachments, ...newAttachments];

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(allAttachments.length > 0 && { attachments: JSON.stringify(allAttachments) }),
      },
      include: {
        section: {
          include: {
            batch: true,
          },
        },
      },
    });

    // Add file URLs to response
    const lessonWithUrls = {
      ...updatedLesson,
      attachments: allAttachments.map(att => ({
        ...att,
        url: getFileUrl(req, att.filepath),
      })),
    };

    logger.info(`Instructor updated lesson: ${lessonId}`);

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: lessonWithUrls,
    });
  } catch (error) {
    logger.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Delete a lesson
 * DELETE /api/instructor/lessons/:lessonId
 */
export async function deleteLesson(req, res) {
  try {
    const userId = req.user.userId;
    const { lessonId } = req.params;

    // Verify lesson belongs to instructor
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          instructorId: {
            in: await prisma.instructor.findMany({
              where: { userId },
              select: { id: true },
            }).then(instructors => instructors.map(i => i.id)),
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or access denied',
      });
    }

    // Delete associated files
    if (lesson.attachments) {
      try {
        const attachments = JSON.parse(lesson.attachments);
        attachments.forEach(att => {
          deleteFile(att.filepath);
        });
      } catch (e) {
        logger.warn('Failed to delete lesson attachments:', e);
      }
    }

    // Delete lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    logger.info(`Instructor deleted lesson: ${lessonId}`);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    logger.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Grade a submission
 * PUT /api/instructor/submissions/:submissionId/grade
 */
export async function gradeSubmission(req, res) {
  try {
    const userId = req.user.userId;
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found',
      });
    }

    // Get submission with assignment and section
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Verify instructor owns this section
    if (submission.assignment.section.instructorId !== instructor.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grade this submission',
      });
    }

    // Validate grade
    if (grade !== undefined && grade !== null) {
      const gradeNum = parseFloat(grade);
      if (isNaN(gradeNum) || gradeNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Grade must be a non-negative number',
        });
      }
    }

    // Update submission with grade and feedback
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade !== undefined && grade !== null ? parseFloat(grade) : null,
        feedback: feedback || null,
        gradedAt: new Date(),
        gradedBy: instructor.id,
      },
      include: {
        student: {
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
        assignment: {
          select: {
            title: true,
          },
        },
      },
    });

    logger.info(`Instructor ${req.user.email} graded submission ${submissionId}`);

    res.json({
      success: true,
      message: 'Submission graded successfully',
      submission: updatedSubmission,
    });
  } catch (error) {
    logger.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
