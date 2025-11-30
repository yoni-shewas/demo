import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all batches
export const getAllBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        sections: true,
        students: true,
        _count: {
          select: {
            sections: true,
            students: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { name: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message,
    });
  }
};

// Get single batch by ID
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
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
            students: true,
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
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch',
      error: error.message,
    });
  }
};

// Create new batch
export const createBatch = async (req, res) => {
  try {
    const { name, type, year } = req.body;

    // Validate required fields
    if (!name || !type || !year) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and year are required',
      });
    }

    // Validate type
    if (!['RCD', 'ECD'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either RCD or ECD',
      });
    }

    // Validate year
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid number between 2000 and 2100',
      });
    }

    // Check if batch with same name already exists
    const existingBatch = await prisma.batch.findUnique({
      where: { name },
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: 'Batch with this name already exists',
      });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        type,
        year: yearNum,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      batch,
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message,
    });
  }
};

// Update batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, year } = req.body;

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Validate type if provided
    if (type && !['RCD', 'ECD'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either RCD or ECD',
      });
    }

    // Validate year if provided
    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Year must be a valid number between 2000 and 2100',
        });
      }
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(year && { year: parseInt(year) }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      batch,
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch',
      error: error.message,
    });
  }
};

// Delete batch with cascading deletes
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            assignments: true,
            lessons: true,
          },
        },
        students: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Cascade delete all related data
    const sectionIds = batch.sections.map(s => s.id);

    if (sectionIds.length > 0) {
      // Get all assignment IDs from these sections
      const assignments = await prisma.assignment.findMany({
        where: { sectionId: { in: sectionIds } },
        select: { id: true },
      });
      const assignmentIds = assignments.map(a => a.id);

      // Delete submissions for assignments in these sections
      if (assignmentIds.length > 0) {
        await prisma.submission.deleteMany({
          where: { assignmentId: { in: assignmentIds } },
        });
      }

      // Delete assignments in these sections
      await prisma.assignment.deleteMany({
        where: { sectionId: { in: sectionIds } },
      });

      // Delete lessons in these sections
      await prisma.lesson.deleteMany({
        where: { sectionId: { in: sectionIds } },
      });

      // Delete sections
      await prisma.section.deleteMany({
        where: { id: { in: sectionIds } },
      });
    }

    // Unassign students from this batch
    await prisma.student.updateMany({
      where: { batchId: id },
      data: { batchId: null, sectionId: null },
    });

    // Delete the batch
    await prisma.batch.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Batch and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch',
      error: error.message,
    });
  }
};
