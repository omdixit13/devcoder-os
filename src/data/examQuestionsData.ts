import type { ExamQuestion } from '../types';

/**
 * 90-MINUTE EXAM SIMULATOR QUESTION POOL
 * Strictly aligned with the 5 evaluation topics:
 * 1. Prefix Technique
 * 2. Two Pointers — All Three Forms
 * 3. HashMap
 * 4. Binary Search & Binary Search on Answer
 * 5. 2D Array & Matrix
 *
 * Every question uses standard tokenized stdin parsing:
 * `input_data = sys.stdin.read().split()`
 */

export const examQuestionsPool: Omit<ExamQuestion, 'number'>[] = [
  // ===== POOL A: TWO POINTERS =====
  {
    id: 'exam-tp-1',
    title: 'Balanced Boundary Sum',
    difficulty: 'Easy',
    statement: `You are given a strictly non-decreasing sorted array of integers \`arr\` of size \`n\`, and a target value \`target\`.\n\nFind two distinct indices \`i\` and \`j\` (\`0 <= i < j < n\`) such that \`arr[i] + arr[j] == target\`.\n\nBecause the array is sorted, an optimal linear two-pointer scan starting from opposite ends must be used.\nOutput the two 0-based indices separated by a space. It is guaranteed that at least one valid pair exists.`,
    inputFormat: `Line 1: An integer \`n\` (size of array)\nLine 2: \`n\` space-separated integers in non-decreasing order\nLine 3: An integer \`target\``,
    outputFormat: `Two space-separated integers representing 0-based indices \`i\` and \`j\`.`,
    constraints: [
      '2 <= n <= 10^5',
      '-10^9 <= arr[i] <= 10^9',
      '-2 * 10^9 <= target <= 2 * 10^9',
      'arr is sorted in non-decreasing order',
    ],
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'arr[0] + arr[1] = 2 + 7 = 9' },
      { input: '5\n-5 -2 0 4 9\n-1', output: '0 3', explanation: 'arr[0] + arr[3] = -5 + 4 = -1' },
    ],
    testCases: [
      { id: 't1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { id: 't2', input: '3\n2 3 4\n6', expectedOutput: '0 2', isHidden: false },
      { id: 'th1', input: '5\n1 2 3 4 5\n9', expectedOutput: '3 4', isHidden: true },
      { id: 'th2', input: '6\n-10 -3 0 2 4 8\n-1', expectedOutput: '1 3', isHidden: true },
      { id: 'th3', input: '2\n1000000000 1000000000\n2000000000', expectedOutput: '0 1', isHidden: true },
    ],
    hiddenConcepts: ['Two Pointers (Opposite Ends)', 'Sorted Invariant'],
    debriefExplanation: `**Pattern:** Array sorted hai! Left = 0, Right = n - 1. If sum < target: left += 1. If sum > target: right -= 1. Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    # Write your solution using sys.stdin.read().split()
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
    id: 'exam-tp-2',
    title: 'Container with Most Water',
    difficulty: 'Medium',
    statement: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers representing \`height\``,
    outputFormat: `A single integer representing the maximum water capacity.`,
    constraints: ['2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    examples: [
      { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', explanation: 'Max water between indices 1 and 8: min(8, 7) * (8 - 1) = 49' },
      { input: '2\n1 1', output: '1', explanation: 'Area = min(1, 1) * 1 = 1' },
    ],
    testCases: [
      { id: 't1', input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false },
      { id: 't2', input: '2\n1 1', expectedOutput: '1', isHidden: false },
      { id: 'th1', input: '5\n4 3 2 1 4', expectedOutput: '16', isHidden: true },
      { id: 'th2', input: '4\n1 2 4 3', expectedOutput: '4', isHidden: true },
    ],
    hiddenConcepts: ['Two Pointers (Opposite Ends)', 'Greedy Area Bottleneck'],
    debriefExplanation: `**Pattern:** Water area is limited by min(height[l], height[r]) * (r - l). Always advance the pointer pointing to the shorter vertical line! Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    height = [int(x) for x in input_data[1:n+1]]
    
    # Write your solution here
    left, right = 0, n - 1
    max_area = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        if area > max_area:
            max_area = area
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    print(max_area)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    height = [int(x) for x in input_data[1:n+1]]
    
    left, right = 0, n - 1
    max_area = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        if area > max_area:
            max_area = area
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    print(max_area)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-tp-3',
    title: 'Zero Shift In-Place',
    difficulty: 'Easy',
    statement: `Given an integer array \`nums\` of size \`n\`, move all \`0\`s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array. Print the modified array space-separated.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers`,
    outputFormat: `\`n\` space-separated integers with all zeroes shifted to the end.`,
    constraints: ['1 <= n <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
    examples: [
      { input: '5\n0 1 0 3 12', output: '1 3 12 0 0', explanation: 'Zeroes moved to the end in-place.' },
      { input: '1\n0', output: '0', explanation: 'Single zero remains 0.' },
    ],
    testCases: [
      { id: 't1', input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0', isHidden: false },
      { id: 't2', input: '1\n0', expectedOutput: '0', isHidden: false },
      { id: 'th1', input: '4\n0 0 0 1', expectedOutput: '1 0 0 0', isHidden: true },
      { id: 'th2', input: '4\n4 2 4 0', expectedOutput: '4 2 4 0', isHidden: true },
    ],
    hiddenConcepts: ['Two Pointers (Slow-Fast)', 'Partition In-Place'],
    debriefExplanation: `**Pattern:** Slow pointer tracks where the next non-zero should be placed. Fast pointer traverses the array. Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    
    # In-place partition
    insert_pos = 0
    for i in range(n):
        if nums[i] != 0:
            nums[insert_pos], nums[i] = nums[i], nums[insert_pos]
            insert_pos += 1
    print(' '.join(map(str, nums)))

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
    
    insert_pos = 0
    for i in range(n):
        if nums[i] != 0:
            nums[insert_pos], nums[i] = nums[i], nums[insert_pos]
            insert_pos += 1
    print(' '.join(map(str, nums)))

if __name__ == '__main__':
    solve()
`,
  },

  // ===== POOL B: HASHMAP & FREQUENCY =====
  {
    id: 'exam-hm-1',
    title: 'Duplicate Element Verifier',
    difficulty: 'Easy',
    statement: `Given an integer array \`nums\` of size \`n\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers`,
    outputFormat: `\`true\` or \`false\``,
    constraints: ['1 <= n <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    examples: [
      { input: '4\n1 2 3 1', output: 'true', explanation: '1 appears twice.' },
      { input: '4\n1 2 3 4', output: 'false', explanation: 'All elements distinct.' },
    ],
    testCases: [
      { id: 't1', input: '4\n1 2 3 1', expectedOutput: 'true', isHidden: false },
      { id: 't2', input: '4\n1 2 3 4', expectedOutput: 'false', isHidden: false },
      { id: 'th1', input: '10\n1 1 1 3 3 4 3 2 4 2', expectedOutput: 'true', isHidden: true },
      { id: 'th2', input: '1\n999', expectedOutput: 'false', isHidden: true },
    ],
    hiddenConcepts: ['HashSet Lookup O(1)', 'Frequency Counting'],
    debriefExplanation: `**Pattern:** Use a hash set. Check if element seen in O(1). Time: O(n), Space: O(n).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    
    seen = set()
    found = False
    for x in nums:
        if x in seen:
            found = True
            break
        seen.add(x)
    print("true" if found else "false")

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
    
    seen = set()
    found = False
    for x in nums:
        if x in seen:
            found = True
            break
        seen.add(x)
    print("true" if found else "false")

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-hm-2',
    title: 'Character Frequency Anagram Matcher',
    difficulty: 'Easy',
    statement: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    inputFormat: `Line 1: string \`s\`\nLine 2: string \`t\``,
    outputFormat: `\`true\` or \`false\``,
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    examples: [
      { input: 'anagram\nnagaram', output: 'true', explanation: 'Both contain same letters with same frequencies.' },
      { input: 'rat\ncar', output: 'false', explanation: 'Frequencies differ.' },
    ],
    testCases: [
      { id: 't1', input: 'anagram\nnagaram', expectedOutput: 'true', isHidden: false },
      { id: 't2', input: 'rat\ncar', expectedOutput: 'false', isHidden: false },
      { id: 'th1', input: 'a\nb', expectedOutput: 'false', isHidden: true },
      { id: 'th2', input: 'listen\nsilent', expectedOutput: 'true', isHidden: true },
    ],
    hiddenConcepts: ['Frequency Array', 'HashMap Equivalence'],
    debriefExplanation: `**Pattern:** Frequency map of size 26 or dictionary. Increment for s, decrement for t. Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    s = input_data[0]
    t = input_data[1]
    
    if len(s) != len(t):
        print("false")
        return
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    for c in t:
        if c not in freq or freq[c] == 0:
            print("false")
            return
        freq[c] -= 1
    print("true")

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    s = input_data[0]
    t = input_data[1]
    
    if len(s) != len(t):
        print("false")
        return
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    for c in t:
        if c not in freq or freq[c] == 0:
            print("false")
            return
        freq[c] -= 1
    print("true")

if __name__ == '__main__':
    solve()
`,
  },

  // ===== POOL C: PREFIX TECHNIQUE & SUBARRAYS =====
  {
    id: 'exam-prefix-1',
    title: 'Continuous Subarray Equilibrium',
    difficulty: 'Medium',
    statement: `You are given an integer array \`nums\` of length \`n\` and an integer \`k\`.\n\nFind the total count of non-empty contiguous subarrays whose sum equals exactly \`k\`.\n\nNotice that numbers can be positive, negative, or zero, so a simple sliding window will fail. You must combine the **Prefix Sum** technique with a **HashMap** frequency store to track past cumulative sums.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers\nLine 3: An integer \`k\``,
    outputFormat: `A single integer representing the count of subarrays with sum equal to \`k\`.`,
    constraints: ['1 <= n <= 5 * 10^4', '-10^4 <= nums[i] <= 10^4', '-10^7 <= k <= 10^7'],
    examples: [
      { input: '3\n1 1 1\n2', output: '2', explanation: 'Subarrays [1,1] at [0..1] and [1..2].' },
      { input: '3\n1 2 3\n3', output: '2', explanation: 'Subarrays [1,2] and [3].' },
    ],
    testCases: [
      { id: 't1', input: '3\n1 1 1\n2', expectedOutput: '2', isHidden: false },
      { id: 't2', input: '3\n1 2 3\n3', expectedOutput: '2', isHidden: false },
      { id: 'th1', input: '4\n1 -1 0 1\n0', expectedOutput: '3', isHidden: true },
      { id: 'th2', input: '5\n0 0 0 0 0\n0', expectedOutput: '15', isHidden: true },
      { id: 'th3', input: '6\n3 4 7 2 -3 1\n7', expectedOutput: '4', isHidden: true },
    ],
    hiddenConcepts: ['Prefix Sum', 'HashMap Frequency', 'Subarray Identity: prefix[j] - prefix[i-1] == k'],
    debriefExplanation: `**Pattern:** prefix_sum[j] - prefix_sum[i-1] == k => prefix_sum[i-1] == prefix_sum[j] - k. Initialize map with {0: 1}. Time: O(n), Space: O(n).`,
    starterCode: `import sys

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
    id: 'exam-prefix-2',
    title: 'Zero Sum Subarray Count',
    difficulty: 'Medium',
    statement: `You are given an integer array \`arr\` of size \`n\`. Find the total count of contiguous subarrays that sum to exactly \`0\`.\n\nNegative numbers are present, requiring the Prefix Sum frequency technique.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers`,
    outputFormat: `A single integer representing the count of subarrays with sum 0.`,
    constraints: ['1 <= n <= 10^5', '-10^5 <= arr[i] <= 10^5'],
    examples: [
      { input: '6\n0 0 5 5 0 0', output: '6', explanation: 'Zero sum subarrays are [0], [0], [0,0], [0], [0], [0,0].' },
      { input: '4\n6 -1 -3 4', output: '0', explanation: 'No subarray sums to 0.' },
    ],
    testCases: [
      { id: 't1', input: '6\n0 0 5 5 0 0', expectedOutput: '6', isHidden: false },
      { id: 't2', input: '4\n6 -1 -3 4', expectedOutput: '0', isHidden: false },
      { id: 'th1', input: '10\n6 3 -1 -3 4 -2 2 4 6 -12', expectedOutput: '4', isHidden: true },
      { id: 'th2', input: '5\n1 -1 1 -1 1', expectedOutput: '4', isHidden: true },
    ],
    hiddenConcepts: ['Prefix Sum', 'Combinatorics C(freq, 2)', 'HashMap Frequency'],
    debriefExplanation: `**Pattern:** Any two identical prefix sum values mark a contiguous subarray of sum 0 between them. Map counts occurrences of prefix sums. Time: O(n), Space: O(n).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    
    count = 0
    cur_sum = 0
    freq = {0: 1}
    for x in arr:
        cur_sum += x
        if cur_sum in freq:
            count += freq[cur_sum]
        freq[cur_sum] = freq.get(cur_sum, 0) + 1
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
    arr = [int(x) for x in input_data[1:n+1]]
    
    count = 0
    cur_sum = 0
    freq = {0: 1}
    for x in arr:
        cur_sum += x
        if cur_sum in freq:
            count += freq[cur_sum]
        freq[cur_sum] = freq.get(cur_sum, 0) + 1
    print(count)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-prefix-3',
    title: 'Maximum Equal Zero-One Subarray',
    difficulty: 'Medium',
    statement: `Given a binary array \`nums\` containing only \`0\`s and \`1\`s, find the maximum length of a contiguous subarray with an equal number of \`0\`s and \`1\`s.\n\nTransform \`0\` to \`-1\` to convert this into the Maximum Length Subarray with Sum 0 problem.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated binary digits (0 or 1)`,
    outputFormat: `A single integer representing the maximum length.`,
    constraints: ['1 <= n <= 10^5', 'nums[i] is either 0 or 1.'],
    examples: [
      { input: '2\n0 1', output: '2', explanation: '[0, 1] has equal number of 0s and 1s.' },
      { input: '2\n0 0', output: '0', explanation: 'No equal 0 and 1 subarray.' },
    ],
    testCases: [
      { id: 't1', input: '2\n0 1', expectedOutput: '2', isHidden: false },
      { id: 't2', input: '2\n0 0', expectedOutput: '0', isHidden: false },
      { id: 'th1', input: '4\n0 1 0 1', expectedOutput: '4', isHidden: true },
      { id: 'th2', input: '6\n0 0 1 0 0 0', expectedOutput: '2', isHidden: true },
    ],
    hiddenConcepts: ['Prefix Sum Coordinate Shift', 'Map of First Occurrence'],
    debriefExplanation: `**Pattern:** Replace 0 with -1. If prefix sum S repeats at index j that first occurred at index i, subarray (i..j] has sum 0 with length j - i. Time: O(n), Space: O(n).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    
    first_seen = {0: -1}
    cur_sum = 0
    max_len = 0
    for i in range(n):
        cur_sum += 1 if nums[i] == 1 else -1
        if cur_sum in first_seen:
            max_len = max(max_len, i - first_seen[cur_sum])
        else:
            first_seen[cur_sum] = i
    print(max_len)

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
    
    first_seen = {0: -1}
    cur_sum = 0
    max_len = 0
    for i in range(n):
        cur_sum += 1 if nums[i] == 1 else -1
        if cur_sum in first_seen:
            max_len = max(max_len, i - first_seen[cur_sum])
        else:
            first_seen[cur_sum] = i
    print(max_len)

if __name__ == '__main__':
    solve()
`,
  },

  // ===== POOL D: BINARY SEARCH & SEARCH ON ANSWER =====
  {
    id: 'exam-bs-1',
    title: 'Optimal Cargo Allocation Threshold',
    difficulty: 'Hard',
    statement: `A conveyor belt has packages that must be shipped within \`d\` days. The \`i-th\` package has weight \`weights[i]\`.\n\nEach day, we load the conveyor with packages in the exact order given by \`weights\`. We may not load more weight than the maximum daily weight capacity of the ship.\n\nFind the **least weight capacity** of the ship that will result in all packages on the conveyor belt being shipped within \`d\` days.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers representing weights\nLine 3: An integer \`d\` (max allowed days)`,
    outputFormat: `A single integer representing the minimum daily weight capacity required.`,
    constraints: ['1 <= d <= n <= 5 * 10^4', '1 <= weights[i] <= 500'],
    examples: [
      { input: '10\n1 2 3 4 5 6 7 8 9 10\n5', output: '15', explanation: 'Capacity 15 ships packages in 5 days.' },
      { input: '6\n3 2 2 4 1 4\n3', output: '6', explanation: 'Capacity 6 ships in 3 days.' },
    ],
    testCases: [
      { id: 't1', input: '10\n1 2 3 4 5 6 7 8 9 10\n5', expectedOutput: '15', isHidden: false },
      { id: 't2', input: '6\n3 2 2 4 1 4\n3', expectedOutput: '6', isHidden: false },
      { id: 'th1', input: '5\n1 2 3 1 1\n4', expectedOutput: '3', isHidden: true },
      { id: 'th2', input: '1\n500\n1', expectedOutput: '500', isHidden: true },
    ],
    hiddenConcepts: ['Binary Search on Answer Space', 'Greedy Feasibility Check', 'Range [max(W), sum(W)]'],
    debriefExplanation: `**Pattern:** Monotonic search space between max(weights) and sum(weights). Feasibility test checks if days needed <= d. Time: O(n * log(sum)), Space: O(1).`,
    starterCode: `import sys

def can_ship(weights, cap, d):
    days = 1
    cur = 0
    for w in weights:
        if cur + w > cap:
            days += 1
            cur = 0
        cur += w
    return days <= d

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
    solutionCode: `import sys

def can_ship(weights, cap, d):
    days = 1
    cur = 0
    for w in weights:
        if cur + w > cap:
            days += 1
            cur = 0
        cur += w
    return days <= d

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
  {
    id: 'exam-bs-2',
    title: 'Koko Eating Bananas Minimum Speed',
    difficulty: 'Medium',
    statement: `Koko loves to eat bananas. There are \`n\` piles of bananas, the \`i-th\` pile has \`piles[i]\` bananas. The guards have gone and will come back in \`h\` hours.\n\nKoko can decide her bananas-per-hour eating speed of \`k\`. Each hour, she chooses some pile of bananas and eats \`k\` bananas from that pile. If the pile has less than \`k\` bananas, she eats all of them and will not eat any more bananas during this hour.\n\nReturn the minimum integer \`k\` such that she can eat all the bananas within \`h\` hours.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated integers representing piles\nLine 3: An integer \`h\``,
    outputFormat: `A single integer representing minimum eating speed \`k\`.`,
    constraints: ['1 <= n <= h <= 10^9', '1 <= piles[i] <= 10^9'],
    examples: [
      { input: '4\n3 6 7 11\n8', output: '4', explanation: 'At speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 <= 8.' },
      { input: '5\n30 11 23 4 20\n5', output: '30', explanation: 'At speed 30: 5 hours total.' },
    ],
    testCases: [
      { id: 't1', input: '4\n3 6 7 11\n8', expectedOutput: '4', isHidden: false },
      { id: 't2', input: '5\n30 11 23 4 20\n5', expectedOutput: '30', isHidden: false },
      { id: 'th1', input: '5\n30 11 23 4 20\n6', expectedOutput: '23', isHidden: true },
      { id: 'th2', input: '1\n1000000000\n2', expectedOutput: '500000000', isHidden: true },
    ],
    hiddenConcepts: ['Binary Search on Answer Space', 'Ceil Math Division'],
    debriefExplanation: `**Pattern:** Search speed k between 1 and max(piles). Hours required for pile p at speed k is ceil(p / k) = (p + k - 1) // k. Time: O(n * log(max(piles))), Space: O(1).`,
    starterCode: `import sys

def hours_needed(piles, k):
    return sum((p + k - 1) // k for p in piles)

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    piles = [int(x) for x in input_data[1:n+1]]
    h = int(input_data[n+1])
    
    low = 1
    high = max(piles)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if hours_needed(piles, mid) <= h:
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def hours_needed(piles, k):
    return sum((p + k - 1) // k for p in piles)

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    piles = [int(x) for x in input_data[1:n+1]]
    h = int(input_data[n+1])
    
    low = 1
    high = max(piles)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if hours_needed(piles, mid) <= h:
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-bs-3',
    title: 'First and Last Position in Sorted Array',
    difficulty: 'Medium',
    statement: `Given an array of integers \`nums\` sorted in non-decreasing order, find the starting and ending position of a given \`target\` value.\n\nIf \`target\` is not found in the array, print \`-1 -1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity using dual binary search.`,
    inputFormat: `Line 1: An integer \`n\`\nLine 2: \`n\` space-separated sorted integers\nLine 3: An integer \`target\``,
    outputFormat: `Two space-separated integers representing first and last 0-based index.`,
    constraints: ['0 <= n <= 10^5', '-10^9 <= nums[i] <= 10^9', 'nums is sorted in non-decreasing order.'],
    examples: [
      { input: '6\n5 7 7 8 8 10\n8', output: '3 4', explanation: '8 starts at index 3 and ends at index 4.' },
      { input: '6\n5 7 7 8 8 10\n6', output: '-1 -1', explanation: '6 is not in the array.' },
    ],
    testCases: [
      { id: 't1', input: '6\n5 7 7 8 8 10\n8', expectedOutput: '3 4', isHidden: false },
      { id: 't2', input: '6\n5 7 7 8 8 10\n6', expectedOutput: '-1 -1', isHidden: false },
      { id: 'th1', input: '1\n1\n1', expectedOutput: '0 0', isHidden: true },
      { id: 'th2', input: '2\n2 2\n2', expectedOutput: '0 1', isHidden: true },
    ],
    hiddenConcepts: ['Binary Search Boundary Bias', 'Lower Bound & Upper Bound'],
    debriefExplanation: `**Pattern:** Two binary searches. When target is found, continue searching left (high = mid - 1) for first position, and continue searching right (low = mid + 1) for last position. Time: O(log n), Space: O(1).`,
    starterCode: `import sys

def find_bound(nums, target, is_first):
    low, high = 0, len(nums) - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            ans = mid
            if is_first:
                high = mid - 1
            else:
                low = mid + 1
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return ans

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    first = find_bound(nums, target, True)
    last = find_bound(nums, target, False)
    print(f"{first} {last}")

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def find_bound(nums, target, is_first):
    low, high = 0, len(nums) - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            ans = mid
            if is_first:
                high = mid - 1
            else:
                low = mid + 1
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return ans

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    first = find_bound(nums, target, True)
    last = find_bound(nums, target, False)
    print(f"{first} {last}")

if __name__ == '__main__':
    solve()
`,
  },

  // ===== POOL E: 2D ARRAY & MATRIX =====
  {
    id: 'exam-mat-1',
    title: 'Matrix Diagonal Sum',
    difficulty: 'Easy',
    statement: `Given a square matrix \`mat\` of dimension \`n x n\`, return the sum of the matrix diagonals.\n\nOnly include the sum of all the elements on the primary diagonal and all the elements on the secondary diagonal that are not part of the primary diagonal.`,
    inputFormat: `Line 1: An integer \`n\`\nNext \`n\` lines: \`n\` space-separated integers each`,
    outputFormat: `A single integer representing diagonal sum.`,
    constraints: ['1 <= n <= 100', '1 <= mat[i][j] <= 100'],
    examples: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', output: '25', explanation: 'Diagonals: [1, 5, 9] + [3, 7] = 25 (center 5 not doubled).' },
      { input: '1\n5', output: '5', explanation: 'Single element is 5.' },
    ],
    testCases: [
      { id: 't1', input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '25', isHidden: false },
      { id: 't2', input: '1\n5', expectedOutput: '5', isHidden: false },
      { id: 'th1', input: '4\n1 1 1 1\n1 1 1 1\n1 1 1 1\n1 1 1 1', expectedOutput: '8', isHidden: true },
      { id: 'th2', input: '2\n1 2\n3 4', expectedOutput: '10', isHidden: true },
    ],
    hiddenConcepts: ['Matrix Invariants', 'Single Pass Diagonals'],
    debriefExplanation: `**Pattern:** For row i, primary is mat[i][i] and secondary is mat[i][n - 1 - i]. If i == n - 1 - i, only count once! Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    mat = []
    idx = 1
    for r in range(n):
        mat.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    total = 0
    for i in range(n):
        total += mat[i][i]
        j = n - 1 - i
        if j != i:
            total += mat[i][j]
    print(total)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    mat = []
    idx = 1
    for r in range(n):
        mat.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    total = 0
    for i in range(n):
        total += mat[i][i]
        j = n - 1 - i
        if j != i:
            total += mat[i][j]
    print(total)

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-mat-2',
    title: 'Spiral Matrix Traversal',
    difficulty: 'Medium',
    statement: `Given an \`m x n\` matrix, return all elements of the matrix in spiral order as space-separated integers.`,
    inputFormat: `Line 1: Two integers \`m\` and \`n\`\nNext \`m\` lines: \`n\` space-separated integers each`,
    outputFormat: `All \`m * n\` elements in spiral order separated by space.`,
    constraints: ['1 <= m, n <= 20', '-100 <= matrix[i][j] <= 100'],
    examples: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5', explanation: 'Spiral clockwise traversal.' },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', output: '1 2 3 4 8 12 11 10 9 5 6 7', explanation: 'Spiral order.' },
    ],
    testCases: [
      { id: 't1', input: '3 3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 2 3 6 9 8 7 4 5', isHidden: false },
      { id: 't2', input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expectedOutput: '1 2 3 4 8 12 11 10 9 5 6 7', isHidden: false },
      { id: 'th1', input: '1 1\n42', expectedOutput: '42', isHidden: true },
      { id: 'th2', input: '1 4\n1 2 3 4', expectedOutput: '1 2 3 4', isHidden: true },
    ],
    hiddenConcepts: ['Boundary Tracking: top, bottom, left, right', '2D Simulation'],
    debriefExplanation: `**Pattern:** Maintain 4 boundaries (top, bottom, left, right). Traverse Right, Down, Left, Up, shrinking boundaries inward. Time: O(m * n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    m = int(input_data[0])
    n = int(input_data[1])
    matrix = []
    idx = 2
    for r in range(m):
        matrix.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    top, bottom = 0, m - 1
    left, right = 0, n - 1
    res = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    print(' '.join(map(str, res)))

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    m = int(input_data[0])
    n = int(input_data[1])
    matrix = []
    idx = 2
    for r in range(m):
        matrix.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    top, bottom = 0, m - 1
    left, right = 0, n - 1
    res = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    print(' '.join(map(str, res)))

if __name__ == '__main__':
    solve()
`,
  },
  {
    id: 'exam-mat-3',
    title: 'The Celebrity Problem',
    difficulty: 'Medium',
    statement: `A celebrity is a person who is known to all but does not know anyone at a party. A party of \`n\` people is represented by an \`n x n\` binary matrix \`M\` where \`M[i][j] = 1\` means \`i\` knows \`j\`.\n\nFind the 0-based index of the celebrity if one exists, otherwise print \`-1\`.\n\nSolve in \`O(n)\` time using two-pointer elimination.`,
    inputFormat: `Line 1: An integer \`n\`\nNext \`n\` lines: \`n\` space-separated integers (0 or 1) representing matrix \`M\``,
    outputFormat: `A single integer representing the 0-based celebrity index or \`-1\`.`,
    constraints: ['2 <= n <= 1000', 'M[i][j] is 0 or 1', 'M[i][i] = 0'],
    examples: [
      { input: '3\n0 1 0\n0 0 0\n0 1 0', output: '1', explanation: 'Person 1 knows no one, and everyone knows person 1.' },
      { input: '2\n0 1\n1 0', output: '-1', explanation: 'Both know each other, no celebrity.' },
    ],
    testCases: [
      { id: 't1', input: '3\n0 1 0\n0 0 0\n0 1 0', expectedOutput: '1', isHidden: false },
      { id: 't2', input: '2\n0 1\n1 0', expectedOutput: '-1', isHidden: false },
      { id: 'th1', input: '4\n0 0 1 0\n0 0 1 0\n0 0 0 0\n0 0 1 0', expectedOutput: '2', isHidden: true },
      { id: 'th2', input: '3\n0 0 0\n0 0 0\n0 0 0', expectedOutput: '-1', isHidden: true },
    ],
    hiddenConcepts: ['Elimination Invariant', 'Two Pointer Candidate Narrowing'],
    debriefExplanation: `**Pattern:** If A knows B: A cannot be celebrity. If A does not know B: B cannot be celebrity. After n - 1 comparisons, 1 candidate remains. Verify candidate in O(n). Time: O(n), Space: O(1).`,
    starterCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    M = []
    idx = 1
    for r in range(n):
        M.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    cand = 0
    for i in range(1, n):
        if M[cand][i] == 1:
            cand = i
            
    is_celeb = True
    for i in range(n):
        if i != cand:
            if M[cand][i] == 1 or M[i][cand] == 0:
                is_celeb = False
                break
    print(cand if is_celeb else -1)

if __name__ == '__main__':
    solve()
`,
    solutionCode: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    M = []
    idx = 1
    for r in range(n):
        M.append([int(x) for x in input_data[idx:idx+n]])
        idx += n
        
    cand = 0
    for i in range(1, n):
        if M[cand][i] == 1:
            cand = i
            
    is_celeb = True
    for i in range(n):
        if i != cand:
            if M[cand][i] == 1 or M[i][cand] == 0:
                is_celeb = False
                break
    print(cand if is_celeb else -1)

if __name__ == '__main__':
    solve()
`,
  },
];

/**
 * Fallback static 3 questions for initial load
 */
export const defaultExamQuestions: ExamQuestion[] = [
  { ...examQuestionsPool[0], number: 1 },
  { ...examQuestionsPool[5], number: 2 },
  { ...examQuestionsPool[8], number: 3 },
];

/**
 * GENERATE RANDOM EXAM QUESTIONS EVERY TIME
 * Selects 3 distinct questions across different syllabus topics:
 * - Q1: Foundational / Direct (Easy / Medium)
 * - Q2: Multi-Concept / Prefix / HashMap (Medium)
 * - Q3: Tricky / Binary Search on Answer / Matrix Invariant (Medium / Hard)
 */
export function generateRandomExamQuestions(previousQuestionIds?: string[]): ExamQuestion[] {
  const easyPool = examQuestionsPool.filter(q => q.difficulty === 'Easy');
  const mediumPool = examQuestionsPool.filter(q => q.difficulty === 'Medium');
  const hardPool = examQuestionsPool.filter(q => q.difficulty === 'Hard' || q.id.includes('bs-') || q.id.includes('mat-'));

  const pickRandom = (pool: Omit<ExamQuestion, 'number'>[], excludeIds: Set<string>): Omit<ExamQuestion, 'number'> => {
    const candidates = pool.filter(q => !excludeIds.has(q.id));
    const activeList = candidates.length > 0 ? candidates : pool;
    const randomIndex = Math.floor(Math.random() * activeList.length);
    return activeList[randomIndex];
  };

  const usedIds = new Set<string>(previousQuestionIds || []);
  const selectedQ1 = pickRandom(easyPool, usedIds);
  usedIds.add(selectedQ1.id);

  const selectedQ2 = pickRandom(mediumPool, usedIds);
  usedIds.add(selectedQ2.id);

  const selectedQ3 = pickRandom(hardPool, usedIds);

  return [
    { ...selectedQ1, number: 1 },
    { ...selectedQ2, number: 2 },
    { ...selectedQ3, number: 3 },
  ];
}
