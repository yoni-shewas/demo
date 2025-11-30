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

// Delete section
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

    // Check if section has students
    if (section.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete section with enrolled students. Remove students first.',
      });
    }

    // Delete the section
    await prisma.section.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
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
