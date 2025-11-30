# LeetCode-Style Assignment Format Guide

## How It Works (Like LeetCode)

### 1. **Assignment Structure**

Every assignment has:
- **Function Signature** (boilerplate) - Given to students, cannot modify
- **Student Code Area** - Where students write their solution
- **Test Driver Code** - Automatically runs tests (hidden from students)
- **Public Test Cases** - Visible to students (2-3 examples)
- **Hidden Test Cases** - Used for grading (5-10 edge cases)

---

## Assignment Format

### Example 1: Two Sum Problem

#### **Instructor Creates Assignment:**

**1. Problem Description:**
```
Given an array of integers nums and an integer target, return indices 
of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, 
and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**2. Function Signature (Given to Students):**
```python
def twoSum(nums, target):
    # Write your code here
    pass
```

**3. Instructor's Solution Code (For Validation):**
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

**4. Test Driver Code (Auto-Generated, Hidden):**
```python
# This runs automatically - students don't see this
import sys
import json

# Read input
line1 = sys.stdin.readline().strip()
line2 = sys.stdin.readline().strip()
nums = json.loads(line1)
target = int(line2)

# Call student's function
result = twoSum(nums, target)

# Print output
print(json.dumps(result))
```

**5. Public Test Cases (Students See These):**
```javascript
[
  {
    input: "[2,7,11,15]\n9",
    expectedOutput: "[0,1]",
    explanation: "nums[0] + nums[1] = 2 + 7 = 9"
  },
  {
    input: "[3,2,4]\n6",
    expectedOutput: "[1,2]",
    explanation: "nums[1] + nums[2] = 2 + 4 = 6"
  }
]
```

**6. Hidden Test Cases (Only Instructor Sees):**
```javascript
[
  {
    input: "[3,3]\n6",
    expectedOutput: "[0,1]"
  },
  {
    input: "[-1,-2,-3,-4,-5]\n-8",
    expectedOutput: "[2,4]"
  },
  {
    input: "[1,5,3,7,9]\n12",
    expectedOutput: "[2,4]"
  }
]
```

---

## Student Experience (LeetCode Style)

### **Step 1: View Assignment**

Student sees:
```
┌─────────────────────────────────────────────────────────┐
│ Two Sum Problem                                         │
│                                                         │
│ Given an array of integers nums and an integer target,  │
│ return indices of the two numbers that add up to        │
│ target.                                                 │
│                                                         │
│ Example 1:                                              │
│   Input: nums = [2,7,11,15], target = 9                │
│   Output: [0,1]                                         │
│   Explanation: nums[0] + nums[1] = 9                   │
│                                                         │
│ Example 2:                                              │
│   Input: nums = [3,2,4], target = 6                    │
│   Output: [1,2]                                         │
│                                                         │
│ Constraints:                                            │
│   • 2 <= nums.length <= 10^4                           │
│   • -10^9 <= nums[i] <= 10^9                           │
│   • Only one valid answer exists                        │
└─────────────────────────────────────────────────────────┘
```

### **Step 2: Code Editor (Pre-filled)**

```python
def twoSum(nums, target):
    # Write your code here
    pass
```

**Students only modify the function body!**

### **Step 3: Run Tests (Before Submission)**

Student clicks "Run Tests" to see:

```
┌─────────────────────────────────────────────────────────┐
│ Test Results                                            │
├─────────────────────────────────────────────────────────┤
│ Test Case 1: ✅ PASSED                                  │
│   Input:      nums = [2,7,11,15], target = 9           │
│   Expected:   [0,1]                                     │
│   Got:        [0,1]                                     │
│   Time:       1ms                                       │
│                                                         │
│ Test Case 2: ✅ PASSED                                  │
│   Input:      nums = [3,2,4], target = 6               │
│   Expected:   [1,2]                                     │
│   Got:        [1,2]                                     │
│   Time:       1ms                                       │
│                                                         │
│ 2/2 test cases passed                                   │
└─────────────────────────────────────────────────────────┘
```

### **Step 4: Submit**

Student clicks "Submit" and sees:

```
┌─────────────────────────────────────────────────────────┐
│ Submission Results                                      │
├─────────────────────────────────────────────────────────┤
│ Status: ✅ Accepted                                     │
│                                                         │
│ Test Results:                                           │
│   Public Tests:   2/2 passed  ✅                        │
│   Hidden Tests:   3/3 passed  ✅                        │
│                                                         │
│ Score: 100/100                                          │
│                                                         │
│ Your code passed all test cases!                        │
│ Great work! 🎉                                          │
└─────────────────────────────────────────────────────────┘
```

---

## How Code Execution Works

### **Backend Process:**

1. **Receive Student Code:**
   ```python
   def twoSum(nums, target):
       seen = {}
       for i, num in enumerate(nums):
           if target - num in seen:
               return [seen[target - num], i]
           seen[num] = i
       return []
   ```

2. **Combine with Test Driver:**
   ```python
   # Student's function
   def twoSum(nums, target):
       seen = {}
       for i, num in enumerate(nums):
           if target - num in seen:
               return [seen[target - num], i]
           seen[num] = i
       return []
   
   # Auto-generated test driver
   import sys
   import json
   line1 = sys.stdin.readline().strip()
   line2 = sys.stdin.readline().strip()
   nums = json.loads(line1)
   target = int(line2)
   result = twoSum(nums, target)
   print(json.dumps(result))
   ```

3. **Run Each Test:**
   - Test 1: Input `[2,7,11,15]\n9` → Expected `[0,1]`
   - Execute combined code
   - Compare output
   - Record: ✅ PASSED

4. **Calculate Score:**
   - Tests Passed: 5/5
   - Score: (5/5) × 100 = 100%

---

## Database Structure

### **Assignment Object:**

```javascript
{
  id: "uuid",
  title: "Two Sum Problem",
  description: "Given an array...",
  
  // Function signature only (what students see)
  starterCode: {
    code: "def twoSum(nums, target):\n    # Write your code here\n    pass",
    language: "python"
  },
  
  // Complete working solution (for validation)
  solutionCode: {
    code: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []",
    language: "python"
  },
  
  // Test driver template (auto-generated based on function signature)
  testDriver: {
    code: "import sys\nimport json\nline1 = sys.stdin.readline().strip()\nline2 = sys.stdin.readline().strip()\nnums = json.loads(line1)\ntarget = int(line2)\nresult = twoSum(nums, target)\nprint(json.dumps(result))",
    language: "python"
  },
  
  // Public test cases (students see these)
  testCases: [
    {
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0,1]",
      explanation: "nums[0] + nums[1] = 9"
    },
    {
      input: "[3,2,4]\n6",
      expectedOutput: "[1,2]",
      explanation: "nums[1] + nums[2] = 6"
    }
  ],
  
  // Hidden test cases (only for grading)
  hiddenTestCases: [
    { input: "[3,3]\n6", expectedOutput: "[0,1]" },
    { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2,4]" },
    { input: "[1,5,3,7,9]\n12", expectedOutput: "[2,4]" }
  ]
}
```

---

## More Examples

### Example 2: Palindrome Check

**Function Signature:**
```python
def isPalindrome(s):
    # Write your code here
    pass
```

**Instructor Solution:**
```python
def isPalindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]
```

**Test Driver:**
```python
import sys
text = sys.stdin.readline().strip()
result = isPalindrome(text)
print("True" if result else "False")
```

**Public Tests:**
```javascript
[
  { input: "racecar", expectedOutput: "True" },
  { input: "hello", expectedOutput: "False" }
]
```

**Hidden Tests:**
```javascript
[
  { input: "A man a plan a canal Panama", expectedOutput: "True" },
  { input: "race a car", expectedOutput: "False" },
  { input: "", expectedOutput: "True" }
]
```

---

### Example 3: Reverse String

**Function Signature:**
```python
def reverseString(s):
    # Write your code here
    pass
```

**Instructor Solution:**
```python
def reverseString(s):
    return s[::-1]
```

**Test Driver:**
```python
import sys
text = sys.stdin.readline().strip()
result = reverseString(text)
print(result)
```

**Public Tests:**
```javascript
[
  { input: "hello", expectedOutput: "olleh" },
  { input: "world", expectedOutput: "dlrow" }
]
```

---

## Test Display Format (Like LeetCode)

### **Before Submission (Run Tests):**

```
╔═══════════════════════════════════════════════════════╗
║ Test Results - Public Tests Only                     ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║ ✅ Test Case 1                                        ║
║    Input:     [2,7,11,15], target = 9                ║
║    Expected:  [0,1]                                   ║
║    Output:    [0,1]                                   ║
║    Runtime:   1ms                                     ║
║                                                       ║
║ ✅ Test Case 2                                        ║
║    Input:     [3,2,4], target = 6                    ║
║    Expected:  [1,2]                                   ║
║    Output:    [1,2]                                   ║
║    Runtime:   1ms                                     ║
║                                                       ║
║ ─────────────────────────────────────────────────── ║
║ Passed: 2/2 public tests                             ║
║                                                       ║
║ 💡 Note: Hidden test cases will run on submission    ║
╚═══════════════════════════════════════════════════════╝
```

### **After Submission:**

```
╔═══════════════════════════════════════════════════════╗
║ ✅ Accepted                                           ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║ Test Summary:                                         ║
║   • Public Tests:   2/2 passed ✅                     ║
║   • Hidden Tests:   3/3 passed ✅                     ║
║                                                       ║
║ Final Score: 100/100                                  ║
║                                                       ║
║ Runtime: 1ms (faster than 95% of submissions)        ║
║ Memory: 14.2 MB (less than 80% of submissions)       ║
║                                                       ║
║ 🎉 Perfect Score! All test cases passed!             ║
╚═══════════════════════════════════════════════════════╝
```

### **Partial Pass:**

```
╔═══════════════════════════════════════════════════════╗
║ ⚠️ Wrong Answer                                       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║ Test Summary:                                         ║
║   • Public Tests:   2/2 passed ✅                     ║
║   • Hidden Tests:   2/3 passed ⚠️                     ║
║                                                       ║
║ Final Score: 80/100                                   ║
║                                                       ║
║ Failed Test Case:                                     ║
║   Input:     [3,3], target = 6                       ║
║   Expected:  [0,1]                                    ║
║   Got:       [1,0]                                    ║
║                                                       ║
║ 💡 Hint: Check your logic for duplicate values       ║
╚═══════════════════════════════════════════════════════╝
```

---

## Key Differences from Regular Assignments

| Feature | Regular Assignment | LeetCode-Style |
|---------|-------------------|----------------|
| **Code Format** | Complete program | Function only |
| **Boilerplate** | None | Pre-defined signature |
| **Input/Output** | Manual stdin/stdout | Auto-handled by driver |
| **Test Visibility** | All hidden | Some public, some hidden |
| **Grading** | Manual | Automatic |
| **Immediate Feedback** | No | Yes (Run Tests) |
| **Multiple Attempts** | No | Yes |
| **Edge Cases** | Student handles | Hidden tests cover |

---

## Instructor Workflow

### **1. Create Assignment:**

```javascript
POST /api/instructor/assignments
{
  "title": "Two Sum",
  "description": "Given an array of integers...",
  
  // Just the function signature
  "starterCode": {
    "code": "def twoSum(nums, target):\n    pass",
    "language": "python"
  },
  
  // Your complete solution
  "solutionCode": {
    "code": "def twoSum(nums, target):\n    seen = {}\n    ...",
    "language": "python"
  },
  
  // Public tests (students see)
  "testCases": [
    { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" }
  ],
  
  // Hidden tests (grading only)
  "hiddenTestCases": [
    { input: "[3,3]\n6", expectedOutput: "[0,1]" }
  ]
}
```

### **2. System Validates:**
- Runs your solution against ALL test cases
- If it passes → Assignment created ✅
- If it fails → Error with details ❌

### **3. Students Submit:**
- System auto-grades using all tests
- Instructor can still add manual feedback

---

## Summary

✅ **Function-only format** (like LeetCode)
✅ **Clear boilerplate code** (starter template)
✅ **Auto-generated test drivers** (hidden from students)
✅ **Public + Hidden test cases** (partial visibility)
✅ **Immediate feedback** (Run Tests before submit)
✅ **Automatic grading** (based on test results)
✅ **Clear test display** (LeetCode-style formatting)
✅ **Instructor validation** (solution must pass first)

This creates a professional coding challenge platform exactly like LeetCode! 🚀
