import type { CodingProblem } from '../types/codingLab';

export interface ProblemLogicGuide {
  problemId: string;
  title: string;
  topic: string;
  coreQuestion: string;
  constraintsAnalysis: string;
  bruteForceExplanation: string;
  bruteForceComplexity: string;
  whyBruteForceFails: string;
  coreObservation: string;
  patternType: string;
  stepByStepLogic: string[];
  stdinExplanation: string;
  fullPythonSolution: string;
  timeComplexity: string;
  spaceComplexity: string;
}

/**
 * Curated logic formulation guides tailored for competitive coding problems
 */
export const problemLogicGuides: Record<string, Partial<ProblemLogicGuide>> = {
  'sir-001': {
    coreQuestion: 'Given a sorted array of numbers, find two 1-based indices whose elements sum to target.',
    constraintsAnalysis: 'N <= 30,000 means an O(N^2) brute force will require ~9 * 10^8 operations, which exceeds the typical 1-second limit (~10^7). We must solve this in O(N) or O(N log N) time with O(1) auxiliary space.',
    bruteForceExplanation: 'Run two nested loops: for i in range(n): for j in range(i+1, n): if nums[i] + nums[j] == target: return indices.',
    bruteForceComplexity: 'Time: O(N^2), Space: O(1)',
    whyBruteForceFails: 'Fails with Time Limit Exceeded (TLE) because checking every pair is quadratic and completely ignores that the array is already sorted!',
    coreObservation: 'Because the array is already sorted in non-decreasing order: if current_sum < target, only moving the left pointer rightward can increase the sum. If current_sum > target, only moving the right pointer leftward can decrease the sum.',
    patternType: 'Two Pointers (Opposite Ends Collision)',
    stepByStepLogic: [
      '1. Initialize left = 0 and right = n - 1 (the two extremities).',
      '2. In a while loop (while left < right), compute current_sum = nums[left] + nums[right].',
      '3. If current_sum == target, we found the pair! Output 1-based indices: (left + 1, right + 1).',
      '4. If current_sum < target, we need a larger sum, so advance left += 1.',
      '5. If current_sum > target, we need a smaller sum, so retreat right -= 1.',
      '6. Guaranteed exactly one solution in O(N) single pass.',
    ],
    stdinExplanation: 'sys.stdin.read().split() reads all input tokens at once regardless of whether they are on 1 line or 3 lines, eliminating EOFError and whitespace parsing bugs.',
    fullPythonSolution: `import sys

def solve():
    # Read all tokens from standard input at once
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    # Step 1: Initialize opposite pointers
    left, right = 0, n - 1
    
    # Step 2: Binary collision scan
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            # Output 1-based indices as required
            print(f"{left + 1} {right + 1}")
            return
        elif s < target:
            left += 1  # Need larger sum
        else:
            right -= 1 # Need smaller sum

if __name__ == '__main__':
    solve()
`,
    timeComplexity: 'O(N) — Every iteration moves either left or right pointer by 1, visiting each element at most once.',
    spaceComplexity: 'O(1) — Only two integer pointers stored.',
  },

  'sir-010': {
    coreQuestion: 'Check if any integer appears at least twice in the array.',
    constraintsAnalysis: 'N <= 10^5. An O(N^2) comparison loop will execute (10^5)^2 = 10^10 operations (TLE). We must achieve O(N) using a HashSet or O(N log N) via sorting.',
    bruteForceExplanation: 'Compare every element with all subsequent elements: for i in range(n): for j in range(i+1, n): if nums[i] == nums[j]: return True.',
    bruteForceComplexity: 'Time: O(N^2), Space: O(1)',
    whyBruteForceFails: 'Quadratically slow; will time out on arrays with more than 10,000 numbers.',
    coreObservation: 'A HashSet provides amortized O(1) lookup and insertion. As we iterate through the array, if the current element is already present in the set, we immediately terminate.',
    patternType: 'HashSet Frequency Accumulator',
    stepByStepLogic: [
      '1. Initialize an empty hash set: seen = set().',
      '2. Iterate through each element x in nums.',
      '3. Check: if x in seen, return true immediately (duplicate found).',
      '4. Otherwise, seen.add(x).',
      '5. If loop completes with no duplicates, return false.',
    ],
    stdinExplanation: 'sys.stdin.read().split() seamlessly parses input length n and the n space-separated elements.',
    fullPythonSolution: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    
    seen = set()
    found_duplicate = False
    for x in nums:
        if x in seen:
            found_duplicate = True
            break
        seen.add(x)
        
    print("true" if found_duplicate else "false")

if __name__ == '__main__':
    solve()
`,
    timeComplexity: 'O(N) — Single pass with O(1) expected set lookups.',
    spaceComplexity: 'O(N) — Hash set stores up to N distinct elements.',
  },

  'sir-013': {
    coreQuestion: 'Find the total count of continuous subarrays whose sum equals exactly k.',
    constraintsAnalysis: 'N <= 50,000. Elements can be positive, negative, or zero! Because negative numbers can decrease the running sum, standard sliding window monotonicity is broken. We must use Prefix Sum + HashMap.',
    bruteForceExplanation: 'Check all subarrays [i..j]: calculate sum for each (i, j) pair in O(N^2) or O(N^3).',
    bruteForceComplexity: 'Time: O(N^2), Space: O(1)',
    whyBruteForceFails: '50,000^2 = 2.5 * 10^9 operations, leading to strict Time Limit Exceeded.',
    coreObservation: 'Subarray sum from index i to j equals: prefix[j] - prefix[i-1]. If prefix[j] - prefix[i-1] == k, then prefix[i-1] == prefix[j] - k. If we record how many times each prefix sum has appeared previously in a HashMap, we can count valid subarrays ending at index j in O(1)!',
    patternType: 'Prefix Sum Difference + HashMap Lookup',
    stepByStepLogic: [
      '1. Initialize prefix_map = {0: 1} (base case: empty prefix has sum 0 once).',
      '2. Initialize cur_sum = 0 and count = 0.',
      '3. For each number x in nums:',
      '   a. cur_sum += x.',
      '   b. target_prefix = cur_sum - k.',
      '   c. If target_prefix is in prefix_map, add prefix_map[target_prefix] to count.',
      '   d. Update prefix_map[cur_sum] = prefix_map.get(cur_sum, 0) + 1.',
      '4. Print total count.',
    ],
    stdinExplanation: 'sys.stdin.read().split() handles the input integer n, array elements, and target k regardless of input line wraps.',
    fullPythonSolution: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    k = int(input_data[n+1])
    
    count = 0
    cur_sum = 0
    prefix_map = {0: 1}  # Key: prefix_sum, Value: occurrence count
    
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
    timeComplexity: 'O(N) — One single pass over the array with O(1) hash map operations.',
    spaceComplexity: 'O(N) — Storing cumulative prefix sums in dictionary.',
  },

  'sir-019': {
    coreQuestion: 'Find minimum banana eating speed k such that Koko finishes all piles within h hours.',
    constraintsAnalysis: 'N <= 10^9, piles[i] <= 10^9. Linear scan from speed 1 to max(piles) will require 10^9 checks and time out immediately. Since the time taken strictly decreases as speed increases, this is a monotonic function for Binary Search on Answer!',
    bruteForceExplanation: 'Try speed k = 1, then k = 2, then k = 3... until total hours <= h.',
    bruteForceComplexity: 'Time: O(max(piles) * N), Space: O(1)',
    whyBruteForceFails: 'If max(piles) is 10^9, a linear scan would take hundreds of seconds.',
    coreObservation: 'If Koko can finish at speed S, she can also finish at any speed > S. If she cannot finish at speed S, she cannot finish at any speed < S. This monotonic predicate True/False means we can binary search the speed in range [1, max(piles)].',
    patternType: 'Binary Search on Answer Space (Monotonic Feasibility)',
    stepByStepLogic: [
      '1. Set low = 1, high = max(piles).',
      '2. While low <= high, choose mid = (low + high) // 2.',
      '3. Compute hours needed at speed mid: for each pile p, hours += (p + mid - 1) // mid (integer ceiling math).',
      '4. If hours <= h: mid is a valid speed! Record ans = mid and search for a smaller speed: high = mid - 1.',
      '5. If hours > h: mid is too slow! We must increase speed: low = mid + 1.',
      '6. Print optimal minimum speed ans.',
    ],
    stdinExplanation: 'sys.stdin.read().split() parses n, piles array, and hour limit h reliably.',
    fullPythonSolution: `import sys

def hours_needed(piles, k):
    # (p + k - 1) // k computes math.ceil(p / k) using integer arithmetic
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
            high = mid - 1  # Try slower speed
        else:
            low = mid + 1   # Too slow, increase speed
            
    print(ans)

if __name__ == '__main__':
    solve()
`,
    timeComplexity: 'O(N * log(max(piles))) — At most 32 binary search iterations, each doing an O(N) pass.',
    spaceComplexity: 'O(1) — No extra storage needed.',
  },

  'sir-028': {
    coreQuestion: 'Return all elements of an m x n matrix in clockwise spiral order.',
    constraintsAnalysis: 'm, n <= 20. Total elements up to 400. Need clean simulation that strictly visits each element once without duplicate corners.',
    bruteForceExplanation: 'Hard to write with arbitrary recursion; prone to boundary overflow and repeating rows/columns.',
    bruteForceComplexity: 'Time: O(M * N), Space: O(1)',
    whyBruteForceFails: 'Ad-hoc indexing without boundary variables leads to off-by-one errors and infinite loops on single row/column matrices.',
    coreObservation: 'Maintain 4 boundary pointers: top=0, bottom=m-1, left=0, right=n-1. Traverse 4 sides clockwise (Right -> Down -> Left -> Up) and shrink the boundary inward after each side.',
    patternType: '2D Boundary Invariant Simulation',
    stepByStepLogic: [
      '1. Initialize top = 0, bottom = m - 1, left = 0, right = n - 1.',
      '2. While top <= bottom and left <= right:',
      '   a. Move Right along row top from left to right. Then top += 1.',
      '   b. Move Down along column right from top to bottom. Then right -= 1.',
      '   c. If top <= bottom: Move Left along row bottom from right to left. Then bottom -= 1.',
      '   d. If left <= right: Move Up along column left from bottom to top. Then left += 1.',
      '3. Output all elements space-separated.',
    ],
    stdinExplanation: 'sys.stdin.read().split() extracts dimensions m and n, then flattens matrix rows seamlessly.',
    fullPythonSolution: `import sys

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
        # Traverse Right
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        
        # Traverse Down
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        
        # Traverse Left (if rows remain)
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
            
        # Traverse Up (if columns remain)
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
            
    print(' '.join(map(str, res)))

if __name__ == '__main__':
    solve()
`,
    timeComplexity: 'O(M * N) — Each cell visited exactly once.',
    spaceComplexity: 'O(1) auxiliary space (excluding result output).',
  },

  'sir-029': {
    coreQuestion: 'Find the celebrity at a party of n people (known by everyone, knows nobody). Return index or -1.',
    constraintsAnalysis: 'N <= 1000. An O(N^2) pairwise check tests all pairs. However, we can eliminate candidates in O(N) using two-pointer elimination!',
    bruteForceExplanation: 'Check each person i: count their incoming edges (must be n-1) and outgoing edges (must be 0).',
    bruteForceComplexity: 'Time: O(N^2), Space: O(N)',
    whyBruteForceFails: 'Takes N^2 queries, which is inefficient when questions restrict query counts.',
    coreObservation: 'If person A knows person B (M[A][B] == 1), A CANNOT be the celebrity. If A does not know B (M[A][B] == 0), B CANNOT be the celebrity! Thus, every single question eliminates exactly one person.',
    patternType: 'Two-Pointer Elimination & Invariant Verification',
    stepByStepLogic: [
      '1. Start with candidate = 0.',
      '2. For i from 1 to n - 1:',
      '   If M[candidate][i] == 1: candidate knows i, so candidate cannot be celebrity. Update candidate = i.',
      '   Otherwise, candidate does not know i, so i cannot be celebrity. Keep candidate.',
      '3. After n - 1 comparisons, exactly 1 potential candidate remains.',
      '4. Verify candidate in O(N): check that candidate knows nobody (M[cand][i] == 0) and everyone knows candidate (M[i][cand] == 1 for all i != cand).',
      '5. Return candidate if verified, else -1.',
    ],
    stdinExplanation: 'sys.stdin.read().split() extracts n and reads the n x n binary adjacency matrix elements token by token.',
    fullPythonSolution: `import sys

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
        
    # Phase 1: Elimination pass
    cand = 0
    for i in range(1, n):
        if M[cand][i] == 1:
            cand = i
            
    # Phase 2: Verification pass
    is_celeb = True
    for i in range(n):
        if i != cand:
            # Celebrity must know no one, and everyone must know celebrity
            if M[cand][i] == 1 or M[i][cand] == 0:
                is_celeb = False
                break
                
    print(cand if is_celeb else -1)

if __name__ == '__main__':
    solve()
`,
    timeComplexity: 'O(N) — (N - 1) comparisons in elimination + 2N comparisons in verification.',
    spaceComplexity: 'O(1) auxiliary space beyond the input matrix.',
  },
};

/**
 * Universal logic breakdown builder for ANY coding problem
 */
export function buildLogicGuide(problem: CodingProblem): ProblemLogicGuide {
  const specific = problemLogicGuides[problem.id];
  if (specific && specific.fullPythonSolution) {
    return {
      problemId: problem.id,
      title: problem.title,
      topic: problem.topics.join(', '),
      coreQuestion: specific.coreQuestion || problem.description.split('.')[0] + '.',
      constraintsAnalysis: specific.constraintsAnalysis || `Constraints: ${problem.constraints.join('; ')}. Choose an algorithm that runs in under 10^7 operations.`,
      bruteForceExplanation: specific.bruteForceExplanation || 'Brute force attempts every possible combination naively without exploiting ordering or frequency properties.',
      bruteForceComplexity: specific.bruteForceComplexity || 'Time: O(N^2), Space: O(1)',
      whyBruteForceFails: specific.whyBruteForceFails || 'Exceeds time limit (TLE) on large test inputs due to quadratic scaling.',
      coreObservation: specific.coreObservation || (problem.structuredHints?.keyObservation || 'Analyze problem invariant to prune the search space.'),
      patternType: specific.patternType || (problem.topics[0] || 'Optimal Algorithmic Pattern'),
      stepByStepLogic: specific.stepByStepLogic || [
        '1. Parse input tokens using sys.stdin.read().split().',
        '2. Identify the core invariant and state variables.',
        '3. Iterate through data updating state in linear or log time.',
        '4. Print formatted result.',
      ],
      stdinExplanation: specific.stdinExplanation || 'sys.stdin.read().split() reads all input tokens safely without line break issues.',
      fullPythonSolution: specific.fullPythonSolution,
      timeComplexity: specific.timeComplexity || problem.timeComplexity || 'O(N)',
      spaceComplexity: specific.spaceComplexity || problem.spaceComplexity || 'O(1)',
    };
  }

  // Fallback dynamic generator using problem metadata
  const fallbackSolution = problem.solutionCode?.python || `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Tokenized input parsing
    print("Solution executed")

if __name__ == '__main__':
    solve()
`;

  return {
    problemId: problem.id,
    title: problem.title,
    topic: problem.topics.join(', '),
    coreQuestion: problem.description.slice(0, 150) + '...',
    constraintsAnalysis: `Key Constraints: ${problem.constraints.slice(0, 3).join(' | ')}. Design an algorithm fitting inside O(N) or O(N log N).`,
    bruteForceExplanation: 'Naive brute force checks all permutations or nested loops without exploiting problem structure.',
    bruteForceComplexity: 'Time: O(N^2), Space: O(1)',
    whyBruteForceFails: 'Runs out of time (TLE) on boundary test inputs with maximum constraints.',
    coreObservation: problem.structuredHints?.keyObservation || 'Exploit problem properties (sorting, frequency map, binary search range) to reduce time complexity.',
    patternType: problem.topics[0] || 'Optimal Algorithm',
    stepByStepLogic: [
      `1. Read tokens using sys.stdin.read().split() to avoid EOFError.`,
      `2. Initialize primary data structure (${problem.topics.join(' / ')}).`,
      `3. Execute single or binary search pass over data.`,
      `4. Output result matching expected format: ${problem.outputFormat || 'Print answer'}.`,
    ],
    stdinExplanation: 'sys.stdin.read().split() ensures all inputs (newlines, tabs, spaces) are tokenized safely.',
    fullPythonSolution: fallbackSolution,
    timeComplexity: problem.timeComplexity || 'O(N)',
    spaceComplexity: problem.spaceComplexity || 'O(1)',
  };
}
