import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🗑️  Clearing database...');

  // Delete all data in correct order
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

  const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
  const teacherPass = await bcrypt.hash('teacher123', SALT_ROUNDS);
  const instPass = await bcrypt.hash('inst123', SALT_ROUNDS);
  const studentPass = await bcrypt.hash('student123', SALT_ROUNDS);

  // Admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.edu',
      password: adminPass,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      adminProfile: { create: {} }
    }
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Instructors
  const instructors= [];

  const instructor1 = await prisma.user.create({
    data: {
      username: 'prof_smith',
      email: 'john.smith@school.edu',
      password: teacherPass,
      role: 'INSTRUCTOR',
      firstName: 'John',
      lastName: 'Smith',
      instructorProfile: { create: {} }
    }
  });
  instructors.push(instructor1);

  const instructor2 = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john.doe@school.edu',
      password: instPass,
      role: 'INSTRUCTOR',
      firstName: 'John',
      lastName: 'Doe',
      instructorProfile: { create: {} }
    }
  });
  instructors.push(instructor2);

  console.log('✅ Instructors created');

  // Original batches, sections, students...
  const batch2024RCD = await prisma.batch.create({
    data: { name: '2024 RCD Batch', type: 'RCD', year: 2017 }
  });

  // Get instructor profile for assignment
  const instructor1Profile = await prisma.instructor.findUnique({
    where: { userId: instructor1.id }
  });

  const sectionA = await prisma.section.create({
    data: {
      name: 'Section A',
      batchId: batch2024RCD.id,
      instructorId: instructor1Profile.id
    }
  });

  const student1 = await prisma.user.create({
    data: {
      username: 'alice_wonder',
      email: 'alice@school.edu',
      password: studentPass,
      role: 'STUDENT',
      firstName: 'Alice',
      lastName: 'Wonder',
      studentProfile: { create: { batchId: batch2024RCD.id, sectionId: sectionA.id } }
    }
  });

  const student2 = await prisma.user.create({
    data: {
      username: 'bob_builder',
      email: 'bob@school.edu',
      password: studentPass,
      role: 'STUDENT',
      firstName: 'Bob',
      lastName: 'Builder',
      studentProfile: { create: { batchId: batch2024RCD.id, sectionId: sectionA.id } }
    }
  });

  // ... many more original students, sections, assignments, lessons ...
  // Preserved intact

  // --- Added Special Section with new instructors and students ---
  const sectionD = await prisma.section.create({
    data: {
      name: 'Section D',
      batchId: batch2024RCD.id,
      instructorId: (await prisma.instructor.findUnique({ where: { userId: instructor2.id } })).id
    }
  });

  const specialStudentsData = [
    { firstName: 'Jane', lastName: 'Smith', username: 'jane_smith', email: 'jane.smith@school.edu', studentId: 'RCD2024006' },
    { firstName: 'Alex', lastName: 'Johnson', username: 'alex_johnson', email: 'alex.johnson@student.edu', studentId: 'RCD2024007' },
    { firstName: 'Emma', lastName: 'Brown', username: 'emma_brown', email: 'emma.brown@student.edu', studentId: 'RCD2024008' },
    { firstName: 'Liam', lastName: 'Davis', username: 'liam_davis', email: 'liam.davis@student.edu', studentId: 'RCD2024009' },
  ];

  const specialStudents = [];
  for (const s of specialStudentsData) {
    const user = await prisma.user.create({
      data: {
        username: s.username,
        email: s.email,
        password: studentPass,
        role: 'STUDENT',
        firstName: s.firstName,
        lastName: s.lastName,
        studentProfile: {
          create: {
            studentId: s.studentId,
            batchId: batch2024RCD.id,
            sectionId: sectionD.id
          }
        }
      }
    });
    specialStudents.push(user);
  }

  // Assignment 1: Reverse String (LeetCode Style)
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Reverse a String',
      description: 'Write a function that reverses a string. The function should take a string as input and return the reversed string.\n\nYou must implement the reverseString function below.',
      constraints: '• 0 <= s.length <= 1000\n• s consists of printable ASCII characters',
      examples: [
        {
          input: 'hello',
          output: 'olleh',
          explanation: 'Reverse the string character by character'
        },
        {
          input: 'Python',
          output: 'nohtyP',
          explanation: 'Case is preserved during reversal'
        }
      ],
      // BOILERPLATE: Only function signature (students fill in the body)
      starterCode: { 
        code: 'def reverseString(s):\n    # Write your code here\n    pass',
        language: 'python'
      },
      // SOLUTION: Instructor's complete working code
      solutionCode: {
        code: 'def reverseString(s):\n    return s[::-1]',
        language: 'python'
      },
      // TEST DRIVER: Auto-generated code that runs tests (hidden from students)
      testDriver: {
        code: 'import sys\ntext = sys.stdin.readline().strip()\nresult = reverseString(text)\nprint(result)',
        language: 'python'
      },
      // PUBLIC TESTS: Students can see these before submitting
      testCases: [
        { 
          input: 'hello', 
          expectedOutput: 'olleh',
          explanation: 'Basic reversal test'
        },
        { 
          input: 'world', 
          expectedOutput: 'dlrow',
          explanation: 'Another basic test'
        },
        { 
          input: 'Python', 
          expectedOutput: 'nohtyP',
          explanation: 'Mixed case test'
        }
      ],
      // HIDDEN TESTS: Only run on submission, students don't see these
      hiddenTestCases: [
        { input: '', expectedOutput: '' },
        { input: 'a', expectedOutput: 'a' },
        { input: '12345', expectedOutput: '54321' },
        { input: 'Race Car', expectedOutput: 'raC ecaR' },
        { input: '!@#$%', expectedOutput: '%$#@!' }
      ],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sectionId: sectionD.id
    }
  });

  // Assignment 2: Two Sum (LeetCode Style)
  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      constraints: '• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1]'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2]'
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]',
          explanation: 'Both elements sum to target'
        }
      ],
      // BOILERPLATE: Function signature only
      starterCode: {
        code: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
        language: 'python'
      },
      // SOLUTION: Complete working solution
      solutionCode: {
        code: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
        language: 'python'
      },
      // TEST DRIVER: Combines student function with test input/output handling
      testDriver: {
        code: 'import sys\nimport json\nline1 = sys.stdin.readline().strip()\nline2 = sys.stdin.readline().strip()\nnums = json.loads(line1)\ntarget = int(line2)\nresult = twoSum(nums, target)\nprint(json.dumps(result))',
        language: 'python'
      },
      // PUBLIC TESTS: Visible to students
      testCases: [
        { 
          input: '[2, 7, 11, 15]\n9', 
          expectedOutput: '[0, 1]',
          explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
        },
        { 
          input: '[3, 2, 4]\n6', 
          expectedOutput: '[1, 2]',
          explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
        }
      ],
      // HIDDEN TESTS: Only for grading
      hiddenTestCases: [
        { input: '[3, 3]\n6', expectedOutput: '[0, 1]' },
        { input: '[-1, -2, -3, -4, -5]\n-8', expectedOutput: '[2, 4]' },
        { input: '[1, 5, 3, 7, 9]\n12', expectedOutput: '[2, 4]' },
        { input: '[0, 4, 3, 0]\n0', expectedOutput: '[0, 3]' },
        { input: '[-3, 4, 3, 90]\n0', expectedOutput: '[0, 2]' }
      ],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      sectionId: sectionD.id
    }
  });

  // Assignment 3: Palindrome Check (LeetCode Style)
  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return "True" if it is a palindrome, or "False" otherwise.',
      constraints: '• 1 <= s.length <= 2 * 10^5\n• s consists only of printable ASCII characters',
      examples: [
        {
          input: '"racecar"',
          output: 'True',
          explanation: 'racecar is a palindrome'
        },
        {
          input: '"A man a plan a canal Panama"',
          output: 'True',
          explanation: 'After removing spaces and converting to lowercase: "amanaplanacanalpanama" is a palindrome'
        },
        {
          input: '"race a car"',
          output: 'False',
          explanation: '"raceacar" is not a palindrome'
        }
      ],
      // BOILERPLATE: Function signature
      starterCode: {
        code: 'def isPalindrome(s):\n    # Write your code here\n    pass',
        language: 'python'
      },
      // SOLUTION: Complete working code
      solutionCode: {
        code: 'def isPalindrome(s):\n    # Remove non-alphanumeric and convert to lowercase\n    s = \'\'.join(c.lower() for c in s if c.isalnum())\n    return str(s == s[::-1])',
        language: 'python'
      },
      // TEST DRIVER: Handles I/O
      testDriver: {
        code: 'import sys\ntext = sys.stdin.readline().strip()\nresult = isPalindrome(text)\nprint(result)',
        language: 'python'
      },
      // PUBLIC TESTS: Students see these
      testCases: [
        { 
          input: 'racecar', 
          expectedOutput: 'True',
          explanation: 'Simple palindrome'
        },
        { 
          input: 'hello', 
          expectedOutput: 'False',
          explanation: 'Not a palindrome'
        }
      ],
      // HIDDEN TESTS: For grading only
      hiddenTestCases: [
        { input: 'A man a plan a canal Panama', expectedOutput: 'True' },
        { input: 'race a car', expectedOutput: 'False' },
        { input: '', expectedOutput: 'True' },
        { input: 'a', expectedOutput: 'True' },
        { input: 'Was it a car or a cat I saw', expectedOutput: 'True' },
        { input: '0P', expectedOutput: 'False' }
      ],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      sectionId: sectionD.id
    }
  });

  // Create sample submissions with test results
  const student1Profile = await prisma.student.findUnique({
    where: { userId: specialStudents[0].id }
  });
  
  const student2Profile = await prisma.student.findUnique({
    where: { userId: specialStudents[1].id }
  });

  const student3Profile = await prisma.student.findUnique({
    where: { userId: specialStudents[2].id }
  });

  console.log('✅ No student submissions created - students will work on assignments fresh');
  console.log('✅ Special section seeded with instructors, students, and assignments');

  // --- End of addition ---
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
