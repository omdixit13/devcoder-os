import type { ExamQuestion } from '../types';

/**
 * 90-MINUTE EXAM SIMULATOR MOCK QUESTIONS
 * Strictly aligned with the 5 evaluation topics:
 * 1. Prefix Technique
 * 2. Two Pointers — All Three Forms
 * 3. HashMap
 * 4. Binary Search
 * 5. 2D Array
 *
 * Question mix:
 * - Q1: Direct / Foundational
 * - Q2: Multi-Concept Combination
 * - Q3: Tricky / Pattern-Recognition-Heavy
 */
export const defaultExamQuestions: ExamQuestion[] = [
  {
    id: 'exam-q1',
    number: 1,
    title: 'Balanced Boundary Sum',
    difficulty: 'Easy',
    statement: `You are given a strictly non-decreasing sorted array of integers \`arr\` of size \`n\`, and a target value \`target\`.

Find two distinct indices \`i\` and \`j\` (\`0 <= i < j < n\`) such that \`arr[i] + arr[j] == target\`.

Because the array is sorted, an optimal linear two-pointer scan starting from the ends should be used.
Output the two 0-based indices separated by a space. If multiple pairs exist, return the pair with the smallest first index. It is guaranteed that at least one valid pair exists.`,
    inputFormat: `Line 1: An integer \`n\` (size of array)\nLine 2: \`n\` space-separated integers in non-decreasing order\nLine 3: An integer \`target\``,
    outputFormat: `Two space-separated integers representing indices \`i\` and \`j\`.`,
    constraints: [
      '2 <= n <= 10^5',
      '-10^9 <= arr[i] <= 10^9',
      '-2 * 10^9 <= target <= 2 * 10^9',
      'arr is sorted in non-decreasing order',
    ],
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'arr[0] + arr[1] = 2 + 7 = 9',
      },
      {
        input: '5\n-5 -2 0 4 9\n-1',
        output: '1 2',
        explanation: 'arr[1] + arr[2] = (-2) + 0 = -2 (no); arr[0] + arr[3] = -5 + 4 = -1 -> indices 0 and 3',
      },
    ],
    testCases: [
      { id: 't1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { id: 't2', input: '3\n2 3 4\n6', expectedOutput: '0 2', isHidden: false },
      // Hidden testcases
      { id: 'th1', input: '5\n1 2 3 4 5\n9', expectedOutput: '3 4', isHidden: true },
      { id: 'th2', input: '6\n-10 -3 0 2 4 8\n-1', expectedOutput: '1 3', isHidden: true },
      { id: 'th3', input: '2\n1000000000 1000000000\n2000000000', expectedOutput: '0 1', isHidden: true },
    ],
    hiddenConcepts: ['Two Pointers (Opposite Ends)', 'Sorted Array Invariant'],
    debriefExplanation: `**Question 1 Pattern Recognition:**
Array already sorted tha! Jab bhi sorted array me do elements ka sum target ke barabar dhoondhna ho:
- \`left = 0\`, \`right = n - 1\`
- \`current_sum = arr[left] + arr[right]\`
- Agar \`current_sum > target\`: right pointer ko decrement karein (\`right -= 1\`).
- Agar \`current_sum < target\`: left pointer ko increment karein (\`left += 1\`).
- Complexity: **O(n) time** aur **O(1) auxiliary space**.`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    # Write your solution here
    left, right = 0, n - 1
    while left < right:
        cur = arr[left] + arr[right]
        if cur == target:
            print(f"{left} {right}")
            return
        elif cur < target:
            left += 1
        else:
            right -= 1

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    left, right = 0, n - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            print(f"{left} {right}")
            return
        elif s < target:
            left += 1
        else:
            right -= 1

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-q2',
    number: 2,
    title: 'Continuous Subarray Equilibrium',
    difficulty: 'Medium',
    statement: `You are given an integer array \`nums\` of length \`n\` and an integer \`k\`.

Find the total count of non-empty contiguous subarrays whose sum equals exactly \`k\`.

Notice that numbers can be positive, negative, or zero, so a simple sliding window will fail. You must combine the **Prefix Sum** technique with a **HashMap** frequency store to track past cumulative sums.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers\nLine 3: An integer \`k\``,
    outputFormat: `A single integer representing the count of subarrays with sum equal to \`k\`.`,
    constraints: [
      '1 <= n <= 5 * 10^4',
      '-10^4 <= nums[i] <= 10^4',
      '-10^7 <= k <= 10^7',
    ],
    examples: [
      {
        input: '3\n1 1 1\n2',
        output: '2',
        explanation: 'Subarrays [nums[0..1]] and [nums[1..2]] both sum to 2.',
      },
      {
        input: '3\n1 2 3\n3',
        output: '2',
        explanation: 'Subarrays [nums[0..1]] (1+2=3) and [nums[2..2]] (3) sum to 3.',
      },
    ],
    testCases: [
      { id: 't1', input: '3\n1 1 1\n2', expectedOutput: '2', isHidden: false },
      { id: 't2', input: '3\n1 2 3\n3', expectedOutput: '2', isHidden: false },
      // Hidden testcases
      { id: 'th1', input: '4\n1 -1 0 1\n0', expectedOutput: '3', isHidden: true },
      { id: 'th2', input: '5\n0 0 0 0 0\n0', expectedOutput: '15', isHidden: true },
      { id: 'th3', input: '6\n3 4 7 2 -3 1\n7', expectedOutput: '4', isHidden: true },
    ],
    hiddenConcepts: ['Prefix Sum', 'HashMap Frequency', 'Subarray Identity: sum(i..j) = prefix[j] - prefix[i-1]'],
    debriefExplanation: `**Question 2 Pattern Recognition:**
Negatives exist karte hain, isliye Sliding Window yahan fail ho jati hai!
Key Identity:
\`prefix_sum[j] - prefix_sum[i-1] == k\`
=> \`prefix_sum[i-1] == prefix_sum[j] - k\`
Iska matlab: current prefix sum me se agar hum \`k\` subtract karein, aur dekhein ki wo value pehle HashMap me kitni baar aayi hai, utne hi valid subarrays end ho rahe hain current index par!
- Map initialize karein: \`{0: 1}\` (base case: empty prefix sum).
- Time: **O(n)**, Space: **O(n)**.`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    k = int(input_data[n+1])
    
    # Write your solution here
    count = 0
    prefix_map = {0: 1}
    cur_sum = 0
    for x in nums:
        cur_sum += x
        diff = cur_sum - k
        if diff in prefix_map:
            count += prefix_map[diff]
        prefix_map[cur_sum] = prefix_map.get(cur_sum, 0) + 1
    print(count)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    k = int(input_data[n+1])
    
    count = 0
    prefix_map = {0: 1}
    cur_sum = 0
    for x in nums:
        cur_sum += x
        diff = cur_sum - k
        if diff in prefix_map:
            count += prefix_map[diff]
        prefix_map[cur_sum] = prefix_map.get(cur_sum, 0) + 1
    print(count)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-q3',
    number: 3,
    title: 'Optimal Cargo Allocation Threshold',
    difficulty: 'Hard',
    statement: `A conveyor belt has packages that must be shipped within \`d\` days. The \`i-th\` package has weight \`weights[i]\`.

Each day, we load the conveyor with packages in the exact order given by \`weights\`. We may not load more weight than the maximum daily weight capacity of the ship.

Find the **least weight capacity** of the ship that will result in all packages on the conveyor belt being shipped within \`d\` days.

This is a classic problem requiring **Binary Search on the Answer Space** with a monotonic feasibility check.`,
    inputFormat: `Line 1: An integer \`n\` (number of packages)\nLine 2: \`n\` space-separated integers representing weights\nLine 3: An integer \`d\` (max allowed days)`,
    outputFormat: `A single integer representing the minimum daily weight capacity required.`,
    constraints: [
      '1 <= d <= n <= 5 * 10^4',
      '1 <= weights[i] <= 500',
    ],
    examples: [
      {
        input: '10\n1 2 3 4 5 6 7 8 9 10\n5',
        output: '15',
        explanation: 'Capacity 15 enables: Day 1: [1..5]=15, Day 2: [6,7]=13, Day 3: [8]=8, Day 4: [9]=9, Day 5: [10]=10 (total 5 days).',
      },
      {
        input: '6\n3 2 2 4 1 4\n3',
        output: '6',
        explanation: 'Capacity 6 enables: Day 1: [3,2], Day 2: [2,4], Day 3: [1,4] (total 3 days).',
      },
    ],
    testCases: [
      { id: 't1', input: '10\n1 2 3 4 5 6 7 8 9 10\n5', expectedOutput: '15', isHidden: false },
      { id: 't2', input: '6\n3 2 2 4 1 4\n3', expectedOutput: '6', isHidden: false },
      // Hidden testcases
      { id: 'th1', input: '5\n1 2 3 1 1\n4', expectedOutput: '3', isHidden: true },
      { id: 'th2', input: '1\n500\n1', expectedOutput: '500', isHidden: true },
      { id: 'th3', input: '8\n10 20 30 40 50 60 70 80\n2', expectedOutput: '190', isHidden: true },
    ],
    hiddenConcepts: ['Binary Search on Answer Space', 'Greedy Feasibility Check', 'Monotonic Search Range: [max(weights), sum(weights)]'],
    debriefExplanation: `**Question 3 Pattern Recognition:**
Ye question seedhe array me binary search nahi karta! Ye **Capacity (Answer)** par Binary Search karta hai.
Search Space:
- Minimum possible capacity = \`max(weights)\` (kyunki sabse bhari package bhi aana chahiye).
- Maximum possible capacity = \`sum(weights)\` (1 day me sab ship ho jaye).
Feasibility Function:
- Given a candidate capacity \`cap\`, greedily count days needed.
- Agar \`days_needed <= d\`: capacity valid hai, lekin kya hum isse chhota capacity try kar sakte hain? (\`ans = cap\`, \`right = mid - 1\`).
- Agar \`days_needed > d\`: capacity bahut chhoti hai, increase karo (\`left = mid + 1\`).
- Time Complexity: **O(n * log(sum - max))**, Space: **O(1)**.`,
    starterCode: `import sys

def can_ship(weights, capacity, max_days):
    days = 1
    current = 0
    for w in weights:
        if current + w > capacity:
            days += 1
            current = 0
        current += w
    return days <= max_days

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    weights = [int(x) for x in input_data[1:n+1]]
    d = int(input_data[n+1])
    
    # Binary Search on Answer
    low = max(weights)
    high = sum(weights)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if can_ship(weights, mid, d):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def can_ship(weights, capacity, max_days):
    days = 1
    current = 0
    for w in weights:
        if current + w > capacity:
            days += 1
            current = 0
        current += w
    return days <= max_days

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    weights = [int(x) for x in input_data[1:n+1]]
    d = int(input_data[n+1])
    
    low = max(weights)
    high = sum(weights)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if can_ship(weights, mid, d):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)

if __name__ == '__main__':
    solve()
`,
  },
];
