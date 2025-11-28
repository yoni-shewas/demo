import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Ethiopian names
const instructorNames = [
  { firstName: 'Abebe', lastName: 'Tadesse', username: 'abebe.tadesse' },
  { firstName: 'Chaltu', lastName: 'Bekele', username: 'chaltu.bekele' },
  { firstName: 'Dawit', lastName: 'Haile', username: 'dawit.haile' },
  { firstName: 'Emebet', lastName: 'Girma', username: 'emebet.girma' },
  { firstName: 'Fikadu', lastName: 'Mengistu', username: 'fikadu.mengistu' },
  { firstName: 'Gelila', lastName: 'Wolde', username: 'gelila.wolde' },
];

const studentNames = [
  { firstName: 'Amanuel', lastName: 'Tesfaye' },
  { firstName: 'Bethlehem', lastName: 'Kebede' },
  { firstName: 'Dagim', lastName: 'Mulugeta' },
  { firstName: 'Eden', lastName: 'Alemu' },
  { firstName: 'Fasika', lastName: 'Desta' },
  { firstName: 'Gelila', lastName: 'Worku' },
  { firstName: 'Henok', lastName: 'Asfaw' },
  { firstName: 'Haben', lastName: 'Gebru' },
  { firstName: 'Kalkidan', lastName: 'Solomon' },
  { firstName: 'Liya', lastName: 'Tessema' },
  { firstName: 'Mahlet', lastName: 'Yohannes' },
  { firstName: 'Natnael', lastName: 'Getachew' },
  { firstName: 'Nardos', lastName: 'Assefa' },
  { firstName: 'Robel', lastName: 'Mekonnen' },
  { firstName: 'Selamawit', lastName: 'Woldemariam' },
  { firstName: 'Tewodros', lastName: 'Abera' },
  { firstName: 'Tigest', lastName: 'Lemma' },
  { firstName: 'Yared', lastName: 'Wolde' },
  { firstName: 'Yordanos', lastName: 'Shiferaw' },
  { firstName: 'Zelalem', lastName: 'Fikre' },
  { firstName: 'Meron', lastName: 'Tadesse' },
  { firstName: 'Eyob', lastName: 'Gebeyehu' },
  { firstName: 'Hana', lastName: 'Negussie' },
  { firstName: 'Samuel', lastName: 'Bekele' },
  { firstName: 'Ruth', lastName: 'Hailu' },
  { firstName: 'Biruk', lastName: 'Tefera' },
  { firstName: 'Sara', lastName: 'Desta' },
  { firstName: 'Daniel', lastName: 'Hailu' },
  { firstName: 'Rahel', lastName: 'Yosef' },
  { firstName: 'Mekdes', lastName: 'Amare' },
];

// Working code examples for assignments
const codeExamples = {
  sumArray: {
    title: "Sum of Array Elements",
    description: "Write a function that calculates the sum of all elements in an array.",
    starterCode: {
      python: "def sum_array(arr):\n    # Write your code here\n    pass",
      javascript: "function sumArray(arr) {\n    // Write your code here\n}"
    },
    solutionCode: {
      python: "def sum_array(arr):\n    return sum(arr)",
      javascript: "function sumArray(arr) {\n    return arr.reduce((sum, num) => sum + num, 0);\n}"
    },
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expected: "15", description: "Sum of positive numbers" },
      { input: "[10, 20, 30]", expected: "60", description: "Larger numbers" },
      { input: "[-5, 5]", expected: "0", description: "Positive and negative" }
    ],
    hiddenTestCases: [
      { input: "[100, 200, 300]", expected: "600", description: "Large numbers" },
      { input: "[0, 0, 0]", expected: "0", description: "All zeros" }
    ]
  },
  findMax: {
    title: "Find Maximum Element",
    description: "Write a function that finds the maximum element in an array.",
    starterCode: {
      python: "def find_max(arr):\n    # Write your code here\n    pass",
      javascript: "function findMax(arr) {\n    // Write your code here\n}"
    },
    solutionCode: {
      python: "def find_max(arr):\n    if not arr:\n        return None\n    return max(arr)",
      javascript: "function findMax(arr) {\n    if (arr.length === 0) return null;\n    return Math.max(...arr);\n}"
    },
    testCases: [
      { input: "[1, 5, 3, 9, 2]", expected: "9", description: "Positive numbers" },
      { input: "[-5, -2, -8, -1]", expected: "-1", description: "Negative numbers" }
    ],
    hiddenTestCases: [
      { input: "[42]", expected: "42", description: "Single element" },
      { input: "[100, 99, 101, 50]", expected: "101", description: "Large numbers" }
    ]
  },
  reverseString: {
    title: "Reverse a String",
    description: "Write a function that reverses a given string.",
    starterCode: {
      python: "def reverse_string(s):\n    # Write your code here\n    pass",
      javascript: "function reverseString(s) {\n    // Write your code here\n}"
    },
    solutionCode: {
      python: "def reverse_string(s):\n    return s[::-1]",
      javascript: "function reverseString(s) {\n    return s.split('').reverse().join('');\n}"
    },
    testCases: [
      { input: "'hello'", expected: "'olleh'", description: "Simple word" },
      { input: "'CodeLan'", expected: "'naLedoC'", description: "Mixed case" }
    ],
    hiddenTestCases: [
      { input: "'a'", expected: "'a'", description: "Single character" },
      { input: "''", expected: "''", description: "Empty string" }
    ]
  }
};

async function main() {
  console.log('🌱 Starting Ethiopian Academic System seed...\n');

  const defaultPassword = await bcrypt.hash('password123', 10);

  try {
    // Step 1: Clear existing data (preserve admin users)
    console.log('🗑️  Clearing existing data (preserving admin users)...');
    await prisma.submission.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.instructor.deleteMany({});
    await prisma.batch.deleteMany({});
    
    // Delete sessions and users for instructors/students only
    const usersToDelete = await prisma.user.findMany({
      where: { role: { in: ['INSTRUCTOR', 'STUDENT'] } },
      select: { id: true }
    });
    await prisma.session.deleteMany({
      where: { userId: { in: usersToDelete.map(u => u.id) } }
    });
    await prisma.user.deleteMany({
      where: { role: { in: ['INSTRUCTOR', 'STUDENT'] } }
    });
    console.log('✅ Cleared existing data (admin users preserved)\n');

    // Step 2: Create Batches (Ethiopian Calendar)
    console.log('📚 Creating batches...');
    const batches = await Promise.all([
      prisma.batch.create({ data: { name: 'RCD-2014' } }),  // Regular - Ethiopian year 2014
      prisma.batch.create({ data: { name: 'RCD-2015' } }),
      prisma.batch.create({ data: { name: 'ECD-2014' } }),  // Extension - Ethiopian year 2014
      prisma.batch.create({ data: { name: 'ECD-2015' } }),
    ]);
    console.log(`✅ Created ${batches.length} batches: ${batches.map(b => b.name).join(', ')}\n`);

    // Step 3: Create Instructors
    console.log('👨‍🏫 Creating instructors...');
    const instructors = [];
    for (const instructor of instructorNames) {
      const user = await prisma.user.create({
        data: {
          username: instructor.username,
          email: `${instructor.username}@codelan.et`,
          password: defaultPassword,
          role: 'INSTRUCTOR',
        },
      });

      const instructorRecord = await prisma.instructor.create({
        data: {
          userId: user.id,
        },
      });

      instructors.push(instructorRecord);
      console.log(`   ✓ ${instructor.firstName} ${instructor.lastName}`);
    }
    console.log(`✅ Created ${instructors.length} instructors\n`);

    // Step 4: Create Sections (Semesters I, II, III)
    console.log('🏫 Creating sections...');
    const sections = [];
    const semesters = ['I', 'II', 'III'];
    const subjects = ['Data Structures', 'Algorithms', 'Web Development', 'Database Systems', 'Software Engineering', 'Computer Networks'];
    
    let sectionIndex = 0;
    for (const batch of batches) {
      for (const semester of semesters) {
        const instructor = instructors[sectionIndex % instructors.length];
        const subject = subjects[sectionIndex % subjects.length];
        
        const section = await prisma.section.create({
          data: {
            name: `${subject} - Semester ${semester}`,
            semester: semester,
            batchId: batch.id,
            instructorId: instructor.id,
          },
        });
        
        sections.push(section);
        console.log(`   ✓ ${batch.name} - ${section.name} (${instructor.firstName} ${instructor.lastName})`);
        sectionIndex++;
      }
    }
    console.log(`✅ Created ${sections.length} sections\n`);

    // Step 5: Create Students with proper IDs
    console.log('👨‍🎓 Creating students...');
    const students = [];
    let studentCount = 1;
    
    for (const batch of batches) {
      const batchPrefix = batch.name.split('-')[0]; // RCD or ECD
      const batchYear = batch.name.split('-')[1];   // 2014 or 2015
      const batchSections = sections.filter(s => s.batchId === batch.id);
      
      // Create 5 students per section in this batch
      for (const section of batchSections) {
        for (let i = 0; i < 5; i++) {
          const studentName = studentNames[(studentCount - 1) % studentNames.length];
          const studentId = `${batchPrefix}/${String(studentCount).padStart(4, '0')}/${batchYear}`;
          
          const username = `${studentName.firstName.toLowerCase()}.${studentName.lastName.toLowerCase()}${studentCount}`;
          const user = await prisma.user.create({
            data: {
              username: username,
              email: `${username}@student.codelan.et`,
              password: defaultPassword,
              role: 'STUDENT',
            },
          });

          const student = await prisma.student.create({
            data: {
              userId: user.id,
              studentId: studentId,
              batchId: batch.id,
              sectionId: section.id,
            },
          });

          students.push(student);
          console.log(`   ✓ ${studentName.firstName} ${studentName.lastName} (${studentId}) - ${section.name}`);
          studentCount++;
        }
      }
    }
    console.log(`✅ Created ${students.length} students\n`);

    // Step 6: Create Assignments with working code
    console.log('📝 Creating assignments with test cases...');
    const codeExamplesArray = Object.values(codeExamples);
    let assignmentCount = 0;
    
    for (const section of sections) {
      // Create 2 assignments per section
      for (let i = 0; i < 2; i++) {
        const example = codeExamplesArray[i % codeExamplesArray.length];
        
        await prisma.assignment.create({
          data: {
            title: example.title,
            description: example.description,
            starterCode: example.starterCode,
            solutionCode: example.solutionCode,
            testCases: example.testCases,
            hiddenTestCases: example.hiddenTestCases,
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),   // 7 days from now
            sectionId: section.id,
          },
        });
        assignmentCount++;
      }
      console.log(`   ✓ Created 2 assignments for ${section.name}`);
    }
    console.log(`✅ Created ${assignmentCount} assignments\n`);

    // Step 7: Create sample lessons
    console.log('📖 Creating sample lessons...');
    for (const section of sections) {
      await prisma.lesson.create({
        data: {
          title: `Introduction to ${section.name.split(' - ')[0]}`,
          content: `This lesson covers the fundamentals of ${section.name.split(' - ')[0]} for Semester ${section.semester}.`,
          sectionId: section.id,
        },
      });
    }
    console.log(`✅ Created ${sections.length} lessons\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 Ethiopian Academic System Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Batches: ${batches.length} (RCD & ECD with Ethiopian calendar)`);
    console.log(`   • Instructors: ${instructors.length}`);
    console.log(`   • Sections: ${sections.length} (Semesters I, II, III)`);
    console.log(`   • Students: ${students.length}`);
    console.log(`   • Assignments: ${assignmentCount} (with working code & test cases)`);
    console.log(`   • Lessons: ${sections.length}\n`);
    console.log('🔑 Default credentials:');
    console.log('   Password: password123\n');
    console.log('📧 Sample logins:');
    console.log('   Instructor: abebe.tadesse@codelan.et / password123');
    console.log('   Student: Check console output for student IDs\n');
    console.log('📋 Student ID Format: RCD/0001/2014 or ECD/0002/2015');
    console.log('📚 Semesters: I, II, III');
    console.log('✅ All assignments have:');
    console.log('   • Working starter code');
    console.log('   • Solution code');
    console.log('   • Public test cases (visible to students)');
    console.log('   • Hidden test cases (instructor only)');
    console.log('═══════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
