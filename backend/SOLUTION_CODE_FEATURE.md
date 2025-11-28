# Solution Code & Test Cases Feature

## Overview
Instructors can now provide correct solution code and test cases for assignments. This enables:
- **Reference solutions** for grading
- **Auto-grading capabilities** (future implementation)
- **Test case validation** for student submissions

## Database Schema Changes

### Assignment Model
Added two new fields to the `Assignment` model:

```prisma
model Assignment {
  id          String   @id @default(uuid())
  title       String
  description String?
  starterCode Json?    // Code template for students
  solutionCode Json?   // Correct solution provided by instructor ✨ NEW
  testCases   Json?    // Test cases for validation ✨ NEW
  startDate   DateTime?
  dueDate     DateTime?
  // ... other fields
}
```

## Data Format

### Starter Code Format
JSON object with language keys:
```json
{
  "python": "def solve():\n    # Your code here\n    pass",
  "javascript": "function solve() {\n    // Your code here\n}"
}
```

### Solution Code Format
JSON object with correct implementations:
```json
{
  "python": "def solve(arr):\n    return sum(arr)",
  "javascript": "function solve(arr) {\n    return arr.reduce((a, b) => a + b, 0);\n}"
}
```

### Test Cases Format
Array of test case objects:
```json
[
  {
    "input": "3",
    "expected": "6",
    "description": "Sum of 1+2+3"
  },
  {
    "input": "5",
    "expected": "15",
    "description": "Sum of 1+2+3+4+5"
  },
  {
    "input": "10",
    "expected": "55",
    "description": "Sum of 1 to 10"
  }
]
```

## API Changes

### Create Assignment
**Endpoint:** `POST /api/instructor/assignments`

**Request Body:**
```json
{
  "title": "Sum Calculator",
  "description": "Write a function that calculates the sum of numbers from 1 to n",
  "sectionId": "section-uuid",
  "startDate": "2024-01-01T00:00:00",
  "dueDate": "2024-01-15T23:59:59",
  "maxPoints": 100,
  "starterCode": "{\"python\": \"def solve(n):\\n    pass\"}",
  "solutionCode": "{\"python\": \"def solve(n):\\n    return sum(range(1, n+1))\"}",
  "testCases": "[{\"input\": \"3\", \"expected\": \"6\"}]"
}
```

### Update Assignment
**Endpoint:** `PUT /api/instructor/assignments/:assignmentId`

Same body format as create. All code fields are optional.

## Frontend UI

### Instructor Assignment Form
The create/edit assignment modal now includes three code sections:

1. **Starter Code** (Gray border)
   - Template code provided to students
   - Optional field

2. **Solution Code** (Green border/background)
   - Correct implementation that passes all test cases
   - Used for reference and auto-grading
   - Optional but recommended

3. **Test Cases** (Blue border/background)
   - Input/output pairs for validation
   - Optional field

All fields accept JSON format and include helpful placeholders and examples.

## Usage Examples

### Example 1: Simple Addition Problem

**Starter Code:**
```json
{
  "python": "def add(a, b):\n    # Complete this function\n    pass",
  "javascript": "function add(a, b) {\n    // Complete this function\n}"
}
```

**Solution Code:**
```json
{
  "python": "def add(a, b):\n    return a + b",
  "javascript": "function add(a, b) {\n    return a + b;\n}"
}
```

**Test Cases:**
```json
[
  {
    "input": "2, 3",
    "expected": "5",
    "description": "Adding positive numbers"
  },
  {
    "input": "-1, 1",
    "expected": "0",
    "description": "Adding positive and negative"
  },
  {
    "input": "0, 0",
    "expected": "0",
    "description": "Adding zeros"
  }
]
```

### Example 2: Array Problem

**Starter Code:**
```json
{
  "python": "def find_max(arr):\n    \"\"\"Find the maximum element in the array\"\"\"\n    pass"
}
```

**Solution Code:**
```json
{
  "python": "def find_max(arr):\n    if not arr:\n        return None\n    return max(arr)"
}
```

**Test Cases:**
```json
[
  {
    "input": "[1, 5, 3, 9, 2]",
    "expected": "9",
    "description": "Positive numbers"
  },
  {
    "input": "[-5, -2, -8, -1]",
    "expected": "-1",
    "description": "Negative numbers"
  },
  {
    "input": "[42]",
    "expected": "42",
    "description": "Single element"
  }
]
```

## Future Enhancements

### Auto-Grading System
With solution code and test cases in place, we can implement:

1. **Automatic Test Execution**
   - Run student code against test cases
   - Compare output with expected results
   - Generate pass/fail reports

2. **Partial Credit**
   - Award points based on test cases passed
   - E.g., 5 test cases = 20 points each

3. **Solution Comparison**
   - Compare student solution with reference
   - Detect plagiarism
   - Suggest optimizations

### Code Analysis
- **Time Complexity**: Compare student solution efficiency with reference
- **Code Quality**: Check style, readability, best practices
- **Edge Cases**: Verify handling of boundary conditions

## Migration

Migration applied: `20251128163207_add_solution_code_and_test_cases`

To apply this migration:
```bash
cd backend
npx prisma migrate dev
```

## Security Considerations

⚠️ **Important**: Solution code should **NOT** be exposed to students through the API.

The backend should:
- Filter out `solutionCode` when returning assignments to students
- Only expose `solutionCode` to instructors and admins
- Use `solutionCode` server-side for auto-grading

**TODO**: Add role-based filtering in assignment endpoints to protect solution code.

## Testing

To test this feature:

1. **As Instructor**:
   - Log in with instructor credentials
   - Navigate to Assignments
   - Create a new assignment
   - Fill in solution code and test cases
   - Save and verify data is stored

2. **As Student** (future):
   - Verify solution code is NOT visible in assignment details
   - Submit code for grading
   - View test results (without seeing actual solution)

## Benefits

✅ **For Instructors**:
- Quick reference when grading
- Ability to verify correctness
- Foundation for auto-grading

✅ **For Students** (future):
- Instant feedback on submissions
- Know exactly what's expected
- Learn from test case descriptions

✅ **For Platform**:
- Scalable grading system
- Consistent evaluation criteria
- Data for learning analytics
