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

// Delete batch
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        sections: true,
        students: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Check if batch has sections
    if (batch.sections.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete batch with existing sections. Delete sections first.',
      });
    }

    // Delete the batch
    await prisma.batch.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
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
