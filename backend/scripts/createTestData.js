import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Get instructor and student
    const instructor = await prisma.instructor.findFirst({
      include: { user: true }
    });
    
    const student = await prisma.student.findFirst({
      include: { user: true }
    });

    if (!instructor || !student) {
      console.log('❌ Need at least one instructor and one student');
      return;
    }

    console.log(`Found instructor: ${instructor.user.email}`);
    console.log(`Found student: ${student.user.email}`);

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        name: 'Web Development Batch 2024',
      },
    });

    console.log(`✅ Created batch: ${batch.name}`);

    // Create section
    const section = await prisma.section.create({
      data: {
        name: 'JavaScript Fundamentals',
        batchId: batch.id,
        instructorId: instructor.id,
      },
    });

    console.log(`✅ Created section: ${section.name}`);

    // Assign student to section
    await prisma.student.update({
      where: { id: student.id },
      data: {
        batchId: batch.id,
        sectionId: section.id,
      },
    });

    console.log(`✅ Assigned student to section`);

    // Create sample assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: 'JavaScript Functions Practice',
        description: 'Create functions to solve basic programming problems',
        starterCode: JSON.stringify({
          language: 'javascript',
          code: '// Write your functions here\nfunction add(a, b) {\n  // TODO: implement\n}'
        }),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        sectionId: section.id,
      },
    });

    console.log(`✅ Created assignment: ${assignment.title}`);

    console.log('\n🎉 Test data created successfully!');
    console.log(`Batch ID: ${batch.id}`);
    console.log(`Section ID: ${section.id}`);
    console.log(`Assignment ID: ${assignment.id}`);
    console.log(`Instructor ID: ${instructor.id}`);
    console.log(`Student ID: ${student.id}`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
