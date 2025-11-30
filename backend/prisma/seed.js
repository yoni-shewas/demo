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
  const instPass = await bcrypt.hash('inst123', SALT_ROUNDS);
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

  const instructor4 = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john.doe@school.edu',
      password: instPass,
      role: 'INSTRUCTOR',
      firstName: 'John',
      lastName: 'Doe',
      instructorProfile: {
        create: {}
      }
    }
  });
  instructors.push(instructor4);
  console.log(`✅ Instructor created: ${instructor4.email} - ${instructor4.firstName} ${instructor4.lastName}`);

  console.log('');
  console.log('📚 Creating batches...');

  // Create Batches with Ethiopian Calendar
  const batch2024RCD = await prisma.batch.create({
    data: {
      name: '2024 RCD Batch',
      type: 'RCD',
      year: 2017, // Ethiopian Calendar year
    }
  });
  console.log(`✅ Batch created: ${batch2024RCD.name} (${batch2024RCD.type}) - ${batch2024RCD.year} E.C.`);

  const batch2024ECD = await prisma.batch.create({
    data: {
      name: '2024 ECD Batch',
      type: 'ECD',
      year: 2017, // Ethiopian Calendar year
    }
  });
  console.log(`✅ Batch created: ${batch2024ECD.name} (${batch2024ECD.type}) - ${batch2024ECD.year} E.C.`);

  const batch2025RCD = await prisma.batch.create({
    data: {
      name: '2025 RCD Batch',
      type: 'RCD',
      year: 2018, // Ethiopian Calendar year
    }
  });
  console.log(`✅ Batch created: ${batch2025RCD.name} (${batch2025RCD.type}) - ${batch2025RCD.year} E.C.`);

  console.log('');
  console.log('🏫 Creating sections...');

  // Get instructor profiles
  const instructorProfiles = await prisma.instructor.findMany({
    where: {
      userId: { in: instructors.map(i => i.id) }
    }
  });

  // Create Sections for 2024 RCD Batch
  const section2024RCDA = await prisma.section.create({
    data: {
      name: 'Section A',
      batchId: batch2024RCD.id,
      instructorId: instructorProfiles[0].id
    }
  });
  console.log(`✅ Section created: ${section2024RCDA.name} (${batch2024RCD.name}, Instructor: ${instructors[0].firstName} ${instructors[0].lastName})`);

  const section2024RCDB = await prisma.section.create({
    data: {
      name: 'Section B',
      batchId: batch2024RCD.id,
      instructorId: instructorProfiles[1].id
    }
  });
  console.log(`✅ Section created: ${section2024RCDB.name} (${batch2024RCD.name}, Instructor: ${instructors[1].firstName} ${instructors[1].lastName})`);

  // Create Sections for 2024 ECD Batch
  const section2024ECDA = await prisma.section.create({
    data: {
      name: 'Section A',
      batchId: batch2024ECD.id,
      instructorId: instructorProfiles[2].id
    }
  });
  console.log(`✅ Section created: ${section2024ECDA.name} (${batch2024ECD.name}, Instructor: ${instructors[2].firstName} ${instructors[2].lastName})`);

  // Create Sections for 2025 RCD Batch
  const section2025RCDA = await prisma.section.create({
    data: {
      name: 'Section A',
      batchId: batch2025RCD.id,
      instructorId: instructorProfiles[0].id
    }
  });
  console.log(`✅ Section created: ${section2025RCDA.name} (${batch2025RCD.name}, Instructor: ${instructors[0].firstName} ${instructors[0].lastName})`);

  // Create Section C for 2024 RCD Batch with John Doe
  const section2024RCDC = await prisma.section.create({
    data: {
      name: 'Section C',
      batchId: batch2024RCD.id,
      instructorId: instructorProfiles[3].id
    }
  });
  console.log(`✅ Section created: ${section2024RCDC.name} (${batch2024RCD.name}, Instructor: ${instructors[3].firstName} ${instructors[3].lastName})`);

  console.log('');
  console.log('👨‍🎓 Creating students...');

  // Create Students for 2024 RCD Batch - Section A
  const students2024RCDA = [];
  const studentNames2024RCDA = [
    { firstName: 'Alice', lastName: 'Brown', username: 'alice_brown', email: 'alice.brown@student.edu', studentId: 'RCD2024001' },
    { firstName: 'Bob', lastName: 'Davis', username: 'bob_davis', email: 'bob.davis@student.edu', studentId: 'RCD2024002' },
    { firstName: 'Charlie', lastName: 'Wilson', username: 'charlie_wilson', email: 'charlie.wilson@student.edu', studentId: 'RCD2024003' },
  ];

  for (const studentData of studentNames2024RCDA) {
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
            batchId: batch2024RCD.id,
            sectionId: section2024RCDA.id
          }
        }
      }
    });
    students2024RCDA.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (${batch2024RCD.name}, Section A)`);
  }

  // Create Students for 2024 RCD Batch - Section B
  const students2024RCDB = [];
  const studentNames2024RCDB = [
    { firstName: 'Diana', lastName: 'Moore', username: 'diana_moore', email: 'diana.moore@student.edu', studentId: 'RCD2024004' },
    { firstName: 'Eva', lastName: 'Taylor', username: 'eva_taylor', email: 'eva.taylor@student.edu', studentId: 'RCD2024005' },
  ];

  for (const studentData of studentNames2024RCDB) {
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
            batchId: batch2024RCD.id,
            sectionId: section2024RCDB.id
          }
        }
      }
    });
    students2024RCDB.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (${batch2024RCD.name}, Section B)`);
  }

  // Create Students for 2024 ECD Batch - Section A
  const students2024ECDA = [];
  const studentNames2024ECDA = [
    { firstName: 'Samuel', lastName: 'Tesfaye', username: 'samuel_tesfaye', email: 'samuel.tesfaye@student.edu', studentId: 'ECD2024001' },
    { firstName: 'Hanna', lastName: 'Kebede', username: 'hanna_kebede', email: 'hanna.kebede@student.edu', studentId: 'ECD2024002' },
  ];

  for (const studentData of studentNames2024ECDA) {
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
            batchId: batch2024ECD.id,
            sectionId: section2024ECDA.id
          }
        }
      }
    });
    students2024ECDA.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (${batch2024ECD.name}, Section A)`);
  }

  // Create Students for 2025 RCD Batch - Section A
  const students2025RCDA = [];
  const studentNames2025RCDA = [
    { firstName: 'Frank', lastName: 'Anderson', username: 'frank_anderson', email: 'frank.anderson@student.edu', studentId: 'RCD2025001' },
    { firstName: 'Grace', lastName: 'Thomas', username: 'grace_thomas', email: 'grace.thomas@student.edu', studentId: 'RCD2025002' },
    { firstName: 'Henry', lastName: 'Jackson', username: 'henry_jackson', email: 'henry.jackson@student.edu', studentId: 'RCD2025003' },
  ];

  for (const studentData of studentNames2025RCDA) {
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
            batchId: batch2025RCD.id,
            sectionId: section2025RCDA.id
          }
        }
      }
    });
    students2025RCDA.push(user);
    console.log(`✅ Student created: ${user.email} - ${user.firstName} ${user.lastName} (${batch2025RCD.name}, Section A)`);
  }

  // Create Jane Smith for 2024 RCD Batch - Section C (John Doe's section)
  const janeSmith = await prisma.user.create({
    data: {
      username: 'jane_smith',
      email: 'jane.smith@school.edu',
      password: studentPass,
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Smith',
      studentProfile: {
        create: {
          studentId: 'RCD2024006',
          batchId: batch2024RCD.id,
          sectionId: section2024RCDC.id
        }
      }
    }
  });
  console.log(`✅ Student created: ${janeSmith.email} - ${janeSmith.firstName} ${janeSmith.lastName} (${batch2024RCD.name}, Section C)`);

  console.log('');
  console.log('📖 Creating lessons...');

  // Create Lessons for 2024 RCD - Section A
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Programming Concepts',
      content: 'In this lesson, we will cover the fundamental concepts of programming including variables, data types, and basic syntax.',
      sectionId: section2024RCDA.id
    }
  });
  console.log(`✅ Lesson created: ${lesson1.title} (${batch2024RCD.name} - Section A)`);

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Control Structures and Loops',
      content: 'Learn about if-else statements, switch cases, for loops, while loops, and their applications.',
      sectionId: section2024RCDA.id
    }
  });
  console.log(`✅ Lesson created: ${lesson2.title} (${batch2024RCD.name} - Section A)`);

  // Create Lessons for 2024 ECD - Section A
  const lesson3 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Programming',
      content: 'Basic programming concepts for extension students.',
      sectionId: section2024ECDA.id
    }
  });
  console.log(`✅ Lesson created: ${lesson3.title} (${batch2024ECD.name} - Section A)`);

  // Create Lessons for 2024 RCD - Section C (John Doe)
  const lesson4 = await prisma.lesson.create({
    data: {
      title: 'Python Fundamentals',
      content: 'Learn Python programming basics including variables, data types, and functions.',
      sectionId: section2024RCDC.id
    }
  });
  console.log(`✅ Lesson created: ${lesson4.title} (${batch2024RCD.name} - Section C)`);

  console.log('');
  console.log('📝 Creating assignments...');

  // Create Assignments for 2024 RCD - Section A
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
      sectionId: section2024RCDA.id
    }
  });
  console.log(`✅ Assignment created: ${assignment1.title} (${batch2024RCD.name} - Section A)`);

  // Create Assignment for 2024 RCD - Section C (John Doe's section)
  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Variables and Data Types',
      description: 'Create a Python program that demonstrates the use of different data types (int, float, string, boolean) and variable assignments.',
      starterCode: {
        python: '# Define variables of different types\nname = ""\nage = 0\nheight = 0.0\nis_student = True\n\n# Print all variables\nprint(name, age, height, is_student)',
        javascript: '// Define variables of different types\nlet name = "";\nlet age = 0;\nlet height = 0.0;\nlet isStudent = true;\n\n// Print all variables\nconsole.log(name, age, height, isStudent);',
        cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name = "";\n    int age = 0;\n    float height = 0.0;\n    bool isStudent = true;\n    \n    cout << name << " " << age << " " << height << " " << isStudent << endl;\n    return 0;\n}'
      },
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      sectionId: section2024RCDC.id
    }
  });
  console.log(`✅ Assignment created: ${assignment2.title} (${batch2024RCD.name} - Section C)`);

  console.log('');
  console.log('📊 Creating sample submissions...');

  // Get student profiles
  const studentProfiles = await prisma.student.findMany({
    where: {
      userId: { in: students2024RCDA.map(s => s.id) }
    }
  });

  // Get Jane Smith's profile
  const janeProfile = await prisma.student.findUnique({
    where: {
      userId: janeSmith.id
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
  console.log(`✅ Submission created: ${students2024RCDA[0].firstName} ${students2024RCDA[0].lastName} - ${assignment1.title}`);

  // Create submission from Jane Smith
  const submission2 = await prisma.submission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: janeProfile.id,
      attemptNumber: 1,
      submittedCode: {
        language: 'python',
        code: 'name = "Jane Smith"\nage = 20\nheight = 5.6\nis_student = True\n\nprint(name, age, height, is_student)'
      },
      score: 100,
      executionResult: {
        status: 'SUCCESS',
        output: 'Jane Smith 20 5.6 True'
      }
    }
  });
  console.log(`✅ Submission created: ${janeSmith.firstName} ${janeSmith.lastName} - ${assignment2.title}`);

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin Account:');
  console.log('   Email: admin@school.edu');
  console.log('   Password: admin123');
  console.log('');
  console.log('👨‍🏫 Instructor Accounts:');
  console.log('   Password: teacher123');
  console.log('   1. john.smith@school.edu - John Smith');
  console.log('      Sections: 2024 RCD Section A, 2025 RCD Section A');
  console.log('   2. emily.johnson@school.edu - Emily Johnson');
  console.log('      Sections: 2024 RCD Section B');
  console.log('   3. michael.williams@school.edu - Michael Williams');
  console.log('      Sections: 2024 ECD Section A');
  console.log('');
  console.log('   Password: inst123');
  console.log('   4. john.doe@school.edu - John Doe');
  console.log('      Sections: 2024 RCD Section C');
  console.log('');
  console.log('👨‍🎓 Student Accounts (Password: student123):');
  console.log('   2024 RCD Batch - Section A (3 students):');
  console.log('   - alice.brown@student.edu (RCD2024001)');
  console.log('   - bob.davis@student.edu (RCD2024002)');
  console.log('   - charlie.wilson@student.edu (RCD2024003)');
  console.log('');
  console.log('   2024 RCD Batch - Section B (2 students):');
  console.log('   - diana.moore@student.edu (RCD2024004)');
  console.log('   - eva.taylor@student.edu (RCD2024005)');
  console.log('');
  console.log('   2024 RCD Batch - Section C (1 student):');
  console.log('   - jane.smith@school.edu (RCD2024006) ⭐');
  console.log('');
  console.log('   2024 ECD Batch - Section A (2 students):');
  console.log('   - samuel.tesfaye@student.edu (ECD2024001)');
  console.log('   - hanna.kebede@student.edu (ECD2024002)');
  console.log('');
  console.log('   2025 RCD Batch - Section A (3 students):');
  console.log('   - frank.anderson@student.edu (RCD2025001)');
  console.log('   - grace.thomas@student.edu (RCD2025002)');
  console.log('   - henry.jackson@student.edu (RCD2025003)');
  console.log('');
  console.log('📚 Batches: 3 (2024 RCD, 2024 ECD, 2025 RCD)');
  console.log('🏫 Sections: 5');
  console.log('👨‍🎓 Total Students: 11 (all assigned to batch & section)');
  console.log('📖 Lessons: 4');
  console.log('📝 Assignments: 2');
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
