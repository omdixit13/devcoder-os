export interface PatternRecognitionChallenge {
  id: string;
  scenario: string;
  inputDescription: string;
  clues: string[];
  correctTechnique: 'Prefix Technique' | 'Two Pointers' | 'HashMap' | 'Binary Search' | '2D Array' | 'Not sure';
  explanation: string;
  whyOthersFail: string;
  relatedSheetProblem: string;
}

export const patternChallenges: PatternRecognitionChallenge[] = [
  {
    id: 'pat-1',
    scenario: 'You are given an array of daily temperatures. You need to calculate the average temperature across multiple continuous query ranges [L, R] in O(1) time per query.',
    inputDescription: 'An array of size 100,000 followed by 50,000 range queries [L, R].',
    clues: [
      'Range sum query [L, R]',
      'Contiguous segment of an array',
      'Need O(1) response per query without scanning L to R repeatedly',
    ],
    correctTechnique: 'Prefix Technique',
    explanation: 'Jab bhi multiple continuous range queries [L, R] ka sum ya average maanga ho, Prefix Sum array precompute karke range sum = prefix[R] - prefix[L-1] in O(1) nikala jata hai.',
    whyOthersFail: 'Loop lagane par O(Q * N) time limit exceed ho jayega. Two Pointers range queries ke liye suitable nahi hai.',
    relatedSheetProblem: 'Count Zero Subarray Sum',
  },
  {
    id: 'pat-2',
    scenario: 'Given a sorted array of heights, find two towers such that they form a container holding the maximum water between them.',
    inputDescription: 'A list of heights [1, 8, 6, 2, 5, 4, 8, 3, 7].',
    clues: [
      'Finding two boundaries',
      'Area is limited by min(height[left], height[right])',
      'Moving the smaller boundary might find a taller height, while moving the taller boundary can only decrease area',
    ],
    correctTechnique: 'Two Pointers',
    explanation: 'Opposite-ends Two Pointers technique! Shuruat me left=0 aur right=n-1 rakhte hain. Har step me jo height chhota hai us pointer ko move karte hain.',
    whyOthersFail: 'Nested loops se O(n²) banega jo large inputs par TLE dega.',
    relatedSheetProblem: 'Container with Most water',
  },
  {
    id: 'pat-3',
    scenario: 'Given an array of strings, group all words that are anagrams of each other (contain exact same character counts in any order).',
    inputDescription: 'Array of strings: ["eat", "tea", "tan", "ate", "nat", "bat"].',
    clues: [
      'Checking frequency / identity of elements',
      'Need fast lookup for grouping',
      'Canonical sorted key or frequency tuple mapped to list of words',
    ],
    correctTechnique: 'HashMap',
    explanation: 'Har word ka frequency count ya sorted signature ek Hash Map ki key banta hai, aur values us group ke words hote hain. O(1) lookup se instant grouping hoti hai.',
    whyOthersFail: 'Har word ko baaki sabhi words se compare karne par O(n² * k) complexity ho jayegi.',
    relatedSheetProblem: 'Valid Anagram',
  },
  {
    id: 'pat-4',
    scenario: 'You are distributing sweets to children. You need to find the minimum number of sweets per package such that all children are satisfied within a fixed time budget. As capacity increases, time required strictly decreases.',
    inputDescription: 'Weights array and maximum allowed days budget D.',
    clues: [
      'Answer lies in a bounded numeric range [min_val, max_val]',
      'Monotonic condition: if capacity C is valid, any capacity > C is also valid',
      'Looking for the minimum threshold that satisfies the condition',
    ],
    correctTechnique: 'Binary Search',
    explanation: 'Binary Search on Answer Space! Monotonic feasibility function hai: jaise-jaise capacity badhegi, days kam lagenge. Isliye mid calculate karke half search space eliminate kar sakte hain.',
    whyOthersFail: 'Linear search min_val se max_val tak iterate karne me timeout ho jayega.',
    relatedSheetProblem: 'Capacity To Ship Packages Within D Days',
  },
  {
    id: 'pat-5',
    scenario: 'Given an N x N matrix, rotate the entire grid clockwise by 90 degrees in-place without allocating a second matrix.',
    inputDescription: '2D matrix of dimensions N x N.',
    clues: [
      '2D grid coordinates (row, col)',
      'Matrix transformation in-place',
      'Transpose matrix (swap matrix[i][j] with matrix[j][i]) followed by reversing each row',
    ],
    correctTechnique: '2D Array',
    explanation: '2D Array coordinate manipulation! Clockwise 90° rotation ka universal standard pattern hai: Pehle Matrix ka Transpose lein (matrix[i][j] <-> matrix[j][i]), phir har row ko reverse kar dein.',
    whyOthersFail: 'Extra space allocate karne par in-place memory constraint fail ho jayega.',
    relatedSheetProblem: 'Rotate Image',
  },
];
