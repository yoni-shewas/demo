import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: {
        batch: true,
        instructor: {
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
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections',
      error: error.message,
    });
  }
};

// Get single section by ID
export const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        batch: true,
        instructor: {
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
        assignments: true,
        lessons: true,
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    res.status(200).json({
      success: true,
      section,
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section',
      error: error.message,
    });
  }
};

// Create new section
export const createSection = async (req, res) => {
  try {
    const { name, batchId, instructorId } = req.body;

    // Validate required fields
    if (!name || !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Name and batchId are required',
      });
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // If instructorId is provided, verify instructor exists
    if (instructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: instructorId },
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }
    }

    const section = await prisma.section.create({
      data: {
        name,
        batchId,
        instructorId: instructorId || null,
      },
      include: {
        batch: true,
        instructor: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      section,
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create section',
      error: error.message,
    });
  }
};

// Update section
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, batchId, instructorId } = req.body;

    // Check if section exists
    const existingSection = await prisma.section.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // If batchId is provided, verify batch exists
    if (batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found',
        });
      }
    }

    // If instructorId is provided, verify instructor exists
    if (instructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: instructorId },
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }
    }

    const section = await prisma.section.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(batchId && { batchId }),
        ...(instructorId !== undefined && { instructorId: instructorId || null }),
      },
      include: {
        batch: true,
        instructor: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      section,
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: error.message,
    });
  }
};

// Delete section with cascading deletes
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        students: true,
        assignments: true,
        lessons: true,
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Cascade delete all related data
    
    // Get all assignment IDs for this section
    const assignmentIds = section.assignments.map(a => a.id);

    // Delete submissions for these assignments
    if (assignmentIds.length > 0) {
      await prisma.submission.deleteMany({
        where: { assignmentId: { in: assignmentIds } },
      });
    }

    // Delete assignments
    await prisma.assignment.deleteMany({
      where: { sectionId: id },
    });

    // Delete lessons
    await prisma.lesson.deleteMany({
      where: { sectionId: id },
    });

    // Unassign students from this section (set sectionId to null)
    await prisma.student.updateMany({
      where: { sectionId: id },
      data: { sectionId: null },
    });

    // Delete the section
    await prisma.section.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Section and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete section',
      error: error.message,
    });
  }
};

// Assign users to section
export const assignUsersToSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructorId, studentIds } = req.body;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Update instructor if provided
    if (instructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: instructorId },
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }

      await prisma.section.update({
        where: { id },
        data: { instructorId },
      });
    }

    // Assign students if provided
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Update all students to assign them to this section
      await prisma.student.updateMany({
        where: {
          id: { in: studentIds },
        },
        data: {
          sectionId: id,
          batchId: section.batchId, // Also assign to the section's batch
        },
      });
    }

    // Fetch updated section
    const updatedSection = await prisma.section.findUnique({
      where: { id },
      include: {
        batch: true,
        instructor: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        students: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Users assigned to section successfully',
      section: updatedSection,
    });
  } catch (error) {
    console.error('Error assigning users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign users',
      error: error.message,
    });
  }
};

// Remove instructor from section
export const removeInstructorFromSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Remove instructor by setting instructorId to null
    await prisma.section.update({
      where: { id },
      data: { instructorId: null },
    });

    // Fetch updated section
    const updatedSection = await prisma.section.findUnique({
      where: { id },
      include: {
        batch: true,
        instructor: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        students: {
          include: {
            user: {
              select: {
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
    });

    res.status(200).json({
      success: true,
      message: 'Instructor removed from section successfully',
      section: updatedSection,
    });
  } catch (error) {
    console.error('Error removing instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove instructor',
      error: error.message,
    });
  }
};

// Remove students from section
export const removeStudentsFromSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required',
      });
    }

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Remove students from section by setting sectionId to null
    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        sectionId: id, // Ensure they're actually in this section
      },
      data: {
        sectionId: null,
      },
    });

    // Fetch updated section
    const updatedSection = await prisma.section.findUnique({
      where: { id },
      include: {
        batch: true,
        instructor: {
          include: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        students: {
          include: {
            user: {
              select: {
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
    });

    res.status(200).json({
      success: true,
      message: 'Students removed from section successfully',
      section: updatedSection,
    });
  } catch (error) {
    console.error('Error removing students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove students',
      error: error.message,
    });
  }
};

// Get available instructors (not assigned to any section or can be reassigned)
export const getAvailableInstructors = async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
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
        sections: {
          select: {
            id: true,
            name: true,
            batch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors',
      error: error.message,
    });
  }
};

// Get available students (not assigned to a section or in specific batch)
export const getAvailableStudents = async (req, res) => {
  try {
    const { batchId } = req.query;

    const where = {};
    if (batchId) {
      where.batchId = batchId;
    }

    const students = await prisma.student.findMany({
      where,
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
        batch: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};
