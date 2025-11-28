import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Ethiopian names for instructors
const instructorNames = [
  { firstName: 'Abebe', lastName: 'Tadesse', username: 'abebe.tadesse', email: 'abebe.tadesse@codelan.et' },
  { firstName: 'Chaltu', lastName: 'Bekele', username: 'chaltu.bekele', email: 'chaltu.bekele@codelan.et' },
  { firstName: 'Dawit', lastName: 'Haile', username: 'dawit.haile', email: 'dawit.haile@codelan.et' },
  { firstName: 'Emebet', lastName: 'Girma', username: 'emebet.girma', email: 'emebet.girma@codelan.et' },
  { firstName: 'Fikadu', lastName: 'Mengistu', username: 'fikadu.mengistu', email: 'fikadu.mengistu@codelan.et' },
];

// Ethiopian names for students
const studentNames = [
  { firstName: 'Amanuel', lastName: 'Tesfaye', username: 'amanuel.tesfaye' },
  { firstName: 'Bethlehem', lastName: 'Kebede', username: 'bethlehem.kebede' },
  { firstName: 'Dagim', lastName: 'Mulugeta', username: 'dagim.mulugeta' },
  { firstName: 'Eden', lastName: 'Alemu', username: 'eden.alemu' },
  { firstName: 'Fasika', lastName: 'Desta', username: 'fasika.desta' },
  { firstName: 'Gelila', lastName: 'Worku', username: 'gelila.worku' },
  { firstName: 'Henok', lastName: 'Asfaw', username: 'henok.asfaw' },
  { firstName: 'Haben', lastName: 'Gebru', username: 'haben.gebru' },
  { firstName: 'Kalkidan', lastName: 'Solomon', username: 'kalkidan.solomon' },
  { firstName: 'Liya', lastName: 'Tessema', username: 'liya.tessema' },
  { firstName: 'Mahlet', lastName: 'Yohannes', username: 'mahlet.yohannes' },
  { firstName: 'Natnael', lastName: 'Getachew', username: 'natnael.getachew' },
  { firstName: 'Nardos', lastName: 'Assefa', username: 'nardos.assefa' },
  { firstName: 'Robel', lastName: 'Mekonnen', username: 'robel.mekonnen' },
  { firstName: 'Selamawit', lastName: 'Woldemariam', username: 'selamawit.woldemariam' },
  { firstName: 'Tewodros', lastName: 'Abera', username: 'tewodros.abera' },
  { firstName: 'Tigest', lastName: 'Lemma', username: 'tigest.lemma' },
  { firstName: 'Yared', lastName: 'Wolde', username: 'yared.wolde' },
  { firstName: 'Yordanos', lastName: 'Shiferaw', username: 'yordanos.shiferaw' },
  { firstName: 'Zelalem', lastName: 'Fikre', username: 'zelalem.fikre' },
  { firstName: 'Meron', lastName: 'Tadesse', username: 'meron.tadesse' },
  { firstName: 'Eyob', lastName: 'Gebeyehu', username: 'eyob.gebeyehu' },
  { firstName: 'Hana', lastName: 'Negussie', username: 'hana.negussie' },
  { firstName: 'Samuel', lastName: 'Bekele', username: 'samuel.bekele' },
  { firstName: 'Ruth', lastName: 'Hailu', username: 'ruth.hailu' },
];

async function main() {
  console.log('🌱 Starting seed with Ethiopian names...\n');

  // Default password for all users
  const defaultPassword = await bcrypt.hash('password123', 10);

  try {
    // Step 1: Clear existing data (in correct order due to foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.submission.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.section.deleteMany({}); // Delete sections before students and instructors
    await prisma.student.deleteMany({});
    await prisma.instructor.deleteMany({});
    await prisma.batch.deleteMany({});
    
    // Delete sessions for users we're about to delete
    const usersToDelete = await prisma.user.findMany({
      where: { role: { in: ['INSTRUCTOR', 'STUDENT'] } },
      select: { id: true }
    });
    await prisma.session.deleteMany({
      where: { userId: { in: usersToDelete.map(u => u.id) } }
    });
    
    // Delete users with INSTRUCTOR and STUDENT roles only (keep ADMIN)
    await prisma.user.deleteMany({
      where: {
        role: { in: ['INSTRUCTOR', 'STUDENT'] }
      }
    });
    console.log('✅ Cleared existing instructors and students\n');

    // Step 2: Create Batches
    console.log('📚 Creating batches...');
    const batch2024 = await prisma.batch.create({
      data: {
        name: 'Batch 2024',
      },
    });
    const batch2025 = await prisma.batch.create({
      data: {
        name: 'Batch 2025',
      },
    });
    console.log(`✅ Created batches: ${batch2024.name}, ${batch2025.name}\n`);

    // Step 3: Create Instructors
    console.log('👨‍🏫 Creating instructors...');
    const instructors = [];
    for (const instructor of instructorNames) {
      const user = await prisma.user.create({
        data: {
          username: instructor.username,
          email: instructor.email,
          password: defaultPassword,
          role: 'INSTRUCTOR',
          firstName: instructor.firstName,
          lastName: instructor.lastName,
        },
      });

      const instructorProfile = await prisma.instructor.create({
        data: {
          userId: user.id,
        },
      });

      instructors.push({ user, profile: instructorProfile });
      console.log(`   ✓ ${instructor.firstName} ${instructor.lastName}`);
    }
    console.log(`✅ Created ${instructors.length} instructors\n`);

    // Step 4: Create Sections (assigned to instructors)
    console.log('🏫 Creating sections...');
    const sections = [];
    
    const sectionData = [
      { name: 'Section A - Web Development', batchId: batch2024.id, instructorIndex: 0 },
      { name: 'Section B - Data Science', batchId: batch2024.id, instructorIndex: 1 },
      { name: 'Section C - Mobile Development', batchId: batch2024.id, instructorIndex: 2 },
      { name: 'Section D - AI & ML', batchId: batch2025.id, instructorIndex: 3 },
      { name: 'Section E - Cybersecurity', batchId: batch2025.id, instructorIndex: 4 },
    ];

    for (const section of sectionData) {
      const newSection = await prisma.section.create({
        data: {
          name: section.name,
          batchId: section.batchId,
          instructorId: instructors[section.instructorIndex].profile.id,
        },
      });
      sections.push(newSection);
      console.log(`   ✓ ${section.name} (Instructor: ${instructorNames[section.instructorIndex].firstName} ${instructorNames[section.instructorIndex].lastName})`);
    }
    console.log(`✅ Created ${sections.length} sections\n`);

    // Step 5: Create Students (distributed across sections)
    console.log('👨‍🎓 Creating students...');
    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const student = studentNames[i];
      const sectionIndex = i % sections.length; // Distribute evenly across sections
      const batchId = sections[sectionIndex].batchId;
      
      const user = await prisma.user.create({
        data: {
          username: student.username,
          email: `${student.username}@student.codelan.et`,
          password: defaultPassword,
          role: 'STUDENT',
          firstName: student.firstName,
          lastName: student.lastName,
        },
      });

      const studentProfile = await prisma.student.create({
        data: {
          userId: user.id,
          studentId: `STD${(i + 1).toString().padStart(4, '0')}`,
          batchId: batchId,
          sectionId: sections[sectionIndex].id,
        },
      });

      students.push({ user, profile: studentProfile });
      console.log(`   ✓ ${student.firstName} ${student.lastName} (${sections[sectionIndex].name})`);
    }
    console.log(`✅ Created ${students.length} students\n`);

    // Step 6: Create sample assignments for each section
    console.log('📝 Creating sample assignments...');
    const now = new Date();
    const assignments = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Assignment 1 - Already started, due in 7 days
      const assignment1 = await prisma.assignment.create({
        data: {
          title: `Introduction to Programming - ${section.name}`,
          description: 'Write a program that demonstrates basic programming concepts including variables, loops, and functions.',
          sectionId: section.id,
          startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          submissionStatus: 'PENDING',
          starterCode: {
            javascript: '// Write your code here\nfunction solve() {\n  // TODO\n}',
            python: '# Write your code here\ndef solve():\n    # TODO\n    pass'
          },
        },
      });

      // Assignment 2 - Starts in 2 days, due in 14 days
      const assignment2 = await prisma.assignment.create({
        data: {
          title: `Data Structures - ${section.name}`,
          description: 'Implement common data structures: Stack, Queue, and Linked List.',
          sectionId: section.id,
          startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Starts in 2 days
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
          submissionStatus: 'PENDING',
          starterCode: {
            javascript: '// Implement data structures\nclass Stack {\n  // TODO\n}',
            python: '# Implement data structures\nclass Stack:\n    # TODO\n    pass'
          },
        },
      });

      assignments.push(assignment1, assignment2);
      console.log(`   ✓ Created 2 assignments for ${section.name}`);
    }
    console.log(`✅ Created ${assignments.length} assignments\n`);

    // Step 7: Create sample lessons
    console.log('📖 Creating sample lessons...');
    const lessons = [];
    
    for (const section of sections) {
      const lesson = await prisma.lesson.create({
        data: {
          title: `Introduction to ${section.name.split(' - ')[1]}`,
          content: `This lesson covers the fundamental concepts and best practices in ${section.name.split(' - ')[1]}. You will learn the core principles and hands-on techniques needed to excel in this field.`,
          sectionId: section.id,
        },
      });
      lessons.push(lesson);
      console.log(`   ✓ Created lesson for ${section.name}`);
    }
    console.log(`✅ Created ${lessons.length} lessons\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Batches: ${2}`);
    console.log(`   • Instructors: ${instructors.length}`);
    console.log(`   • Sections: ${sections.length}`);
    console.log(`   • Students: ${students.length}`);
    console.log(`   • Assignments: ${assignments.length}`);
    console.log(`   • Lessons: ${lessons.length}\n`);
    console.log('🔑 Default credentials:');
    console.log('   Username: [username from above]');
    console.log('   Password: password123\n');
    console.log('📧 Example logins:');
    console.log('   Instructor: abebe.tadesse / password123');
    console.log('   Student: amanuel.tesfaye / password123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
