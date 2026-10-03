import type { CodingProblem } from '../types/codingLab';

export type CodeSuggestionMode = 'OFF' | 'LIGHT' | 'GUIDED';

export interface CodeSuggestion {
  id: string;
  contextLabel: string;
  suggestedCode: string;
  whyThisNext: string;
  mode: CodeSuggestionMode;
}

/**
 * Generates contextual "next code" suggestions based on student's current code,
 * language, and problem topics (Two Pointers, HashMap, Binary Search, Prefix, 2D Array).
 * Strictly adheres to pedagogical scaffolding — never gives away the full solution.
 */
export function getContextualCodeSuggestion(
  currentCode: string,
  problem: CodingProblem | null,
  language: string,
  mode: CodeSuggestionMode
): CodeSuggestion | null {
  if (mode === 'OFF' || !problem) return null;

  const code = currentCode.trim();
  const lowerCode = code.toLowerCase();
  const topics = problem.topics.map(t => t.toLowerCase());
  const title = problem.title.toLowerCase();

  // Python-specific contextual suggestions (primary language for the syllabus)
  if (language === 'python') {
    // 1. Two Pointers (Opposite Ends / Sorted)
    if (topics.some(t => t.includes('two') || t.includes('pointer')) || title.includes('sorted') || title.includes('container') || title.includes('sum if')) {
      if (!lowerCode.includes('left') && !lowerCode.includes('right') && !lowerCode.includes('while')) {
        return {
          id: 'two-ptr-init',
          contextLabel: 'Pointer Initialization',
          suggestedCode: 'left = 0\nright = len(nums) - 1\nwhile left < right:',
          whyThisNext: 'You have the sorted array and need to scan from both boundaries toward the center. Two converging pointer variables are the natural next step.',
          mode,
        };
      }
      if (lowerCode.includes('while left < right') && !lowerCode.includes('if') && !lowerCode.includes('cur')) {
        return {
          id: 'two-ptr-eval',
          contextLabel: 'Boundary Sum Check',
          suggestedCode: '    cur_sum = nums[left] + nums[right]\n    if cur_sum == target:\n        # Pair found\n    elif cur_sum < target:\n        left += 1\n    else:\n        right -= 1',
          whyThisNext: 'Since the array is sorted, if current sum is too small, moving left rightward increases the sum. If too large, moving right leftward decreases it.',
          mode,
        };
      }
    }

    // 2. HashMap / Frequency / Duplicate
    if (topics.some(t => t.includes('hash') || t.includes('map') || t.includes('duplicate')) || title.includes('anagram') || title.includes('frequency')) {
      if (!lowerCode.includes('seen') && !lowerCode.includes('freq') && !lowerCode.includes('map') && !lowerCode.includes('dict')) {
        return {
          id: 'hashmap-init',
          contextLabel: 'Dictionary / Frequency Store',
          suggestedCode: 'seen = {}\nfor i, num in enumerate(nums):',
          whyThisNext: 'To avoid an O(n²) nested scan, a Python dictionary allows O(1) average lookup for complements and frequencies.',
          mode,
        };
      }
      if (lowerCode.includes('seen') && !lowerCode.includes('in seen')) {
        return {
          id: 'hashmap-lookup',
          contextLabel: 'Complement / Duplicate Lookup',
          suggestedCode: '    complement = target - num\n    if complement in seen:\n        # Found complement\n    seen[num] = i',
          whyThisNext: 'Before storing the current element, check if its required partner was already encountered in the previous iterations.',
          mode,
        };
      }
    }

    // 3. Prefix Sum / Subarray
    if (topics.some(t => t.includes('prefix') || t.includes('subarray')) || title.includes('subarray') || title.includes('zero sum')) {
      if (!lowerCode.includes('prefix') && !lowerCode.includes('cur_sum')) {
        return {
          id: 'prefix-init',
          contextLabel: 'Cumulative Prefix Tracker',
          suggestedCode: 'prefix_map = {0: 1}  # Base case: empty prefix\ncur_sum = 0\ncount = 0\nfor x in nums:',
          whyThisNext: 'Any contiguous subarray sum(i..j) equals prefix[j] - prefix[i-1]. Storing prefix frequencies turns range sum searches into instant hash lookups.',
          mode,
        };
      }
      if (lowerCode.includes('prefix_map') && !lowerCode.includes('diff')) {
        return {
          id: 'prefix-check',
          contextLabel: 'Prefix Difference Check',
          suggestedCode: '    cur_sum += x\n    diff = cur_sum - k\n    if diff in prefix_map:\n        count += prefix_map[diff]\n    prefix_map[cur_sum] = prefix_map.get(cur_sum, 0) + 1',
          whyThisNext: 'If (cur_sum - k) was observed before, then the subarray between that past position and now sums exactly to k.',
          mode,
        };
      }
    }

    // 4. Binary Search / Search Space
    if (topics.some(t => t.includes('binary') || t.includes('search')) || title.includes('search') || title.includes('sqrt') || title.includes('koko')) {
      if (!lowerCode.includes('low') && !lowerCode.includes('high') && !lowerCode.includes('while')) {
        return {
          id: 'bs-init',
          contextLabel: 'Search Space Boundaries',
          suggestedCode: 'low = 0\nhigh = len(arr) - 1\nwhile low <= high:\n    mid = (low + high) // 2',
          whyThisNext: 'Binary search divides the search space in half each iteration by testing the monotonic midpoint invariant.',
          mode,
        };
      }
      if (lowerCode.includes('mid') && !lowerCode.includes('mid + 1') && !lowerCode.includes('mid - 1')) {
        return {
          id: 'bs-halve',
          contextLabel: 'Eliminate Half the Search Space',
          suggestedCode: '    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1',
          whyThisNext: 'If target is strictly greater than middle element, it can never exist in the left half, so discard [low..mid] completely.',
          mode,
        };
      }
    }

    // 5. 2D Array / Matrix
    if (topics.some(t => t.includes('matrix') || t.includes('2d')) || title.includes('matrix') || title.includes('diagonal') || title.includes('spiral')) {
      if (!lowerCode.includes('rows') && !lowerCode.includes('cols') && !lowerCode.includes('len(matrix)')) {
        return {
          id: 'matrix-init',
          contextLabel: 'Matrix Dimensions & Traversal',
          suggestedCode: 'rows = len(matrix)\ncols = len(matrix[0]) if rows > 0 else 0\nfor r in range(rows):\n    for c in range(cols):',
          whyThisNext: 'Standard 2D array traversal starts with row and column bounds to access coordinates via matrix[r][c] safely.',
          mode,
        };
      }
    }

    // Generic initial input parse if code is almost empty
    if (code.length < 30) {
      return {
        id: 'py-input',
        contextLabel: 'Input Parsing Skeleton',
        suggestedCode: 'n = int(input())\narr = list(map(int, input().split()))',
        whyThisNext: 'Standard coding practice problems provide testcases via space-separated integers on standard input.',
        mode,
      };
    }
  }

  // Fallback for Guided Mode
  if (mode === 'GUIDED') {
    return {
      id: 'guided-skeleton',
      contextLabel: 'Next Logical Step',
      suggestedCode: '# Step: Define tracking state, iterate through data, and apply technique condition.',
      whyThisNext: 'Break the problem down: 1) What is given? 2) What variables track progress? 3) When do we stop?',
      mode,
    };
  }

  return null;
}
