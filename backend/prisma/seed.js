import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🗑️  Clearing database...');
  
  // Delete all data in correct order (respecting foreign key constraints)
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.student.deleteMany();
  await prisma.section.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database cleared!');
  console.log('');
  console.log('👥 Creating users...');

  // Hash passwords
  const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
  const teacherPass = await bcrypt.hash('teacher123', SALT_ROUNDS);
  const studentPass = await bcrypt.hash('student123', SALT_ROUNDS);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.edu',
      password: adminPass,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      adminProfile: {
        create: {}
      }
    }
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Instructors
  const instructors = [];
  
  const instructor1 = await prisma.user.create({
    data: {
      username: 'prof_smith',
      email: 'john.smith@school.edu',
      password: teacherPass,
      role: 'INSTRUCTOR',
      firstName: 'John',
      lastName: 'Smith',
      instructorProfile: {
        create: {}
      }
    }
  });
  instructors.push(instructor1);
  console.log(`✅ Instructor created: ${instructor1.email} - ${instructor1.firstName} ${instructor1.lastName}`);

  const instructor2 = await prisma.user.create({
    data: {
      username: 'prof_johnson',
      email: 'emily.johnson@school.edu',
      password: teacherPass,
      role: 'INSTRUCTOR',
      firstName: 'Emily',
      lastName: 'Johnson',
      instructorProfile: {
        create: {}
      }
    }
  });
  instructors.push(instructor2);
  console.log(`✅ Instructor created: ${instructor2.email} - ${instructor2.firstName} ${instructor2.lastName}`);

  const instructor3 = await prisma.user.create({
    data: {
      username: 'prof_williams',
      email: 'michael.williams@school.edu',
      password: teacherPass,
      role: 'INSTRUCTOR',
      firstName: 'Michael',
      lastName: 'Williams',
      instructorProfile: {
        create: {}
      }
    }
  });
  instructors.push(instructor3);
  console.log(`✅ Instructor created: ${instructor3.email} - ${instructor3.firstName} ${instructor3.lastName}`);

  console.log('');
  console.log('📚 Creating batches...');

  // Create Batches
  const batch2024 = await prisma.batch.create({
    data: {
      name: 'Batch 2024',
    }
  });
  console.log(`✅ Batch created: ${batch2024.name}`);

  const batch2025 = await prisma.batch.create({
    data: {
      name: 'Batch 2025',
    }
  });
  console.log(`✅ Batch created: ${batch2025.name}`);

  console.log('');
  console.log('🏫 Creating sections...');

  // Get instructor profiles
  const instructorProfiles = await prisma.instructor.findMany({
    where: {
      userId: { in: instructors.map(i => i.id) }
    }
  });

  // Create Sections for Batch 2024
  const section2024A = await prisma.section.create({
    data: {
      name: 'CS101 - Introduction to Programming',
      batchId: batch2024.id,
      instructorId: instructorProfiles[0].id
    }
  });
  console.log(`✅ Section created: ${section2024A.name} (Instructor: ${instructors[0].firstName} ${instructors[0].lastName})`);

  const section2024B = await prisma.section.create({
    data: {
      name: 'CS201 - Data Structures',
      batchId: batch2024.id,
      instructorId: instructorProfiles[1].id
    }
  });
  console.log(`✅ Section created: ${section2024B.name} (Instructor: ${instructors[1].firstName} ${instructors[1].lastName})`);

  // Create Sections for Batch 2025
  const section2025A = await prisma.section.create({
    data: {
      name: 'CS101 - Introduction to Programming',
      batchId: batch2025.id,
      instructorId: instructorProfiles[2].id
    }
  });
  console.log(`✅ Section created: ${section2025A.name} (Instructor: ${instructors[2].firstName} ${instructors[2].lastName})`);

  const section2025B = await prisma.section.create({
    data: {
      name: 'CS301 - Algorithms',
      batchId: batch2025.id,
      instructorId: instructorProfiles[0].id
    }
  });
  console.log(`✅ Section created: ${section2025B.name} (Instructor: ${instructors[0].firstName} ${instructors[0].lastName})`);

  console.log('');
  console.log('👨‍🎓 Creating students...');

  // Create Students for Batch 2024
  const students2024 = [];
  const studentNames2024 = [
    { firstName: 'Alice', lastName: 'Brown', username: 'alice_brown', email: 'alice.brown@student.edu', studentId: 'STU2024001' },
    { firstName: 'Bob', lastName: 'Davis', username: 'bob_davis', email: 'bob.davis@student.edu', studentId: 'STU2024002' },
    { firstName: 'Charlie', lastName: 'Wilson', username: 'charlie_wilson', email: 'charlie.wilson@student.edu', studentId: 'STU2024003' },
    { firstName: 'Diana', lastName: 'Moore', username: 'diana_moore', email: 'diana.moore@student.edu', studentId: 'STU2024004' },
    { firstName: 'Eva', lastName: 'Taylor', username: 'eva_taylor', email: 'eva.taylor@student.edu', studentId: 'STU2024005' },
  ];

  for (const studentData of studentNames2024) {
    const user = await prisma.user.create({
      data: {
        username: studentData.username,
        email: studentData.email,
        password: studentPass,
        role: 'STUDENT',
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        studentProfile: {
          create: {
            studentId: studentData.studentId,
            batchId: batch2024.id,
            sectionId: section2024A.id
          }
        }
      }
    });
    students2024.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (Batch 2024, Section: CS101)`);
  }

  // Create Students for Batch 2025
  const students2025 = [];
  const studentNames2025 = [
    { firstName: 'Frank', lastName: 'Anderson', username: 'frank_anderson', email: 'frank.anderson@student.edu', studentId: 'STU2025001' },
    { firstName: 'Grace', lastName: 'Thomas', username: 'grace_thomas', email: 'grace.thomas@student.edu', studentId: 'STU2025002' },
    { firstName: 'Henry', lastName: 'Jackson', username: 'henry_jackson', email: 'henry.jackson@student.edu', studentId: 'STU2025003' },
    { firstName: 'Ivy', lastName: 'White', username: 'ivy_white', email: 'ivy.white@student.edu', studentId: 'STU2025004' },
    { firstName: 'Jack', lastName: 'Harris', username: 'jack_harris', email: 'jack.harris@student.edu', studentId: 'STU2025005' },
  ];

  for (const studentData of studentNames2025) {
    const user = await prisma.user.create({
      data: {
        username: studentData.username,
        email: studentData.email,
        password: studentPass,
        role: 'STUDENT',
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        studentProfile: {
          create: {
            studentId: studentData.studentId,
            batchId: batch2025.id,
            sectionId: section2025A.id
          }
        }
      }
    });
    students2025.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (Batch 2025, Section: CS101)`);
  }

  console.log('');
  console.log('📖 Creating lessons...');

  // Create Lessons for CS101 - Section 2024A
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Programming Concepts',
      content: 'In this lesson, we will cover the fundamental concepts of programming including variables, data types, and basic syntax.',
      sectionId: section2024A.id
    }
  });
  console.log(`✅ Lesson created: ${lesson1.title} (Section: CS101 - Batch 2024)`);

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Control Structures and Loops',
      content: 'Learn about if-else statements, switch cases, for loops, while loops, and their applications.',
      sectionId: section2024A.id
    }
  });
  console.log(`✅ Lesson created: ${lesson2.title} (Section: CS101 - Batch 2024)`);

  // Create Lessons for CS201 - Section 2024B
  const lesson3 = await prisma.lesson.create({
    data: {
      title: 'Arrays and Linked Lists',
      content: 'Understanding array operations, memory allocation, and implementing linked lists from scratch.',
      sectionId: section2024B.id
    }
  });
  console.log(`✅ Lesson created: ${lesson3.title} (Section: CS201)`);

  // Create Lessons for CS101 - Section 2025A
  const lesson4 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Programming Concepts',
      content: 'In this lesson, we will cover the fundamental concepts of programming including variables, data types, and basic syntax.',
      sectionId: section2025A.id
    }
  });
  console.log(`✅ Lesson created: ${lesson4.title} (Section: CS101 - Batch 2025)`);

  console.log('');
  console.log('📝 Creating assignments...');

  // Create Assignments for CS101 - Section 2024A
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Hello World Program',
      description: 'Write a program that prints "Hello, World!" to the console. This is your first programming assignment!',
      starterCode: {
        javascript: 'console.log("Hello, World!");',
        python: 'print("Hello, World!")',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      sectionId: section2024A.id
    }
  });
  console.log(`✅ Assignment created: ${assignment1.title} (Section: CS101 - Batch 2024)`);

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Two Sum Problem',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
      starterCode: {
        javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n}',
        python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
        cpp: '#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}'
      },
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      sectionId: section2024A.id
    }
  });
  console.log(`✅ Assignment created: ${assignment2.title} (Section: CS101 - Batch 2024)`);

  // Create Assignments for CS201 - Section 2024B
  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Implement a Stack',
      description: 'Implement a stack data structure with push, pop, peek, and isEmpty operations.',
      starterCode: {
        javascript: 'class Stack {\n    constructor() {\n        this.items = [];\n    }\n    \n    push(element) {\n        // Your code here\n    }\n    \n    pop() {\n        // Your code here\n    }\n}',
        python: 'class Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, element):\n        # Your code here\n        pass',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Stack {\nprivate:\n    vector<int> items;\npublic:\n    void push(int element) {\n        // Your code here\n    }\n    \n    int pop() {\n        // Your code here\n    }\n};'
      },
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      sectionId: section2024B.id
    }
  });
  console.log(`✅ Assignment created: ${assignment3.title} (Section: CS201)`);

  // Create Assignments for CS101 - Section 2025A
  const assignment4 = await prisma.assignment.create({
    data: {
      title: 'Hello World Program',
      description: 'Write a program that prints "Hello, World!" to the console. This is your first programming assignment!',
      starterCode: {
        javascript: 'console.log("Hello, World!");',
        python: 'print("Hello, World!")',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      sectionId: section2025A.id
    }
  });
  console.log(`✅ Assignment created: ${assignment4.title} (Section: CS101 - Batch 2025)`);

  console.log('');
  console.log('📊 Creating sample submissions...');

  // Get student profiles
  const studentProfiles = await prisma.student.findMany({
    where: {
      userId: { in: students2024.map(s => s.id) }
    }
  });

  // Create some sample submissions
  const submission1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentProfiles[0].id,
      attemptNumber: 1,
      submittedCode: {
        language: 'javascript',
        code: 'console.log("Hello, World!");'
      },
      score: 100,
      executionResult: {
        status: 'SUCCESS',
        output: 'Hello, World!'
      }
    }
  });
  console.log(`✅ Submission created: ${students2024[0].firstName} ${students2024[0].lastName} - ${assignment1.title}`);

  const submission2 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentProfiles[1].id,
      attemptNumber: 1,
      submittedCode: {
        language: 'python',
        code: 'print("Hello, World!")'
      },
      score: 100,
      executionResult: {
        status: 'SUCCESS',
        output: 'Hello, World!'
      }
    }
  });
  console.log(`✅ Submission created: ${students2024[1].firstName} ${students2024[1].lastName} - ${assignment1.title}`);

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin Account:');
  console.log('   Email: admin@school.edu');
  console.log('   Password: admin123');
  console.log('');
  console.log('👨‍🏫 Instructor Accounts (Password: teacher123):');
  console.log('   1. john.smith@school.edu - John Smith');
  console.log('      Sections: CS101 (Batch 2024), CS301 (Batch 2025)');
  console.log('   2. emily.johnson@school.edu - Emily Johnson');
  console.log('      Sections: CS201 (Batch 2024)');
  console.log('   3. michael.williams@school.edu - Michael Williams');
  console.log('      Sections: CS101 (Batch 2025)');
  console.log('');
  console.log('👨‍🎓 Student Accounts (Password: student123):');
  console.log('   Batch 2024 (5 students):');
  console.log('   - alice.brown@student.edu');
  console.log('   - bob.davis@student.edu');
  console.log('   - charlie.wilson@student.edu');
  console.log('   - diana.moore@student.edu');
  console.log('   - eva.taylor@student.edu');
  console.log('');
  console.log('   Batch 2025 (5 students):');
  console.log('   - frank.anderson@student.edu');
  console.log('   - grace.thomas@student.edu');
  console.log('   - henry.jackson@student.edu');
  console.log('   - ivy.white@student.edu');
  console.log('   - jack.harris@student.edu');
  console.log('');
  console.log('📚 Batches: 2 (Batch 2024, Batch 2025)');
  console.log('🏫 Sections: 4');
  console.log('📖 Lessons: 4');
  console.log('📝 Assignments: 4');
  console.log('📊 Submissions: 2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
