export interface TopicResource {
  w3Url: string;
  w3Title: string;
  w3Difficulty: string;
  mdnUrl?: string;
  mdnTitle?: string;
  startVideo: {
    title: string;
    channel: string;
    url: string;
    duration: string;
  };
  deepVideo: {
    title: string;
    channel: string;
    url: string;
    duration: string;
  };
  recallQuestions: {
    id: number;
    q: string;
    a: string;
  }[];
}

export const topicResources: Record<string, TopicResource> = {
  'binary-search': {
    w3Url: 'https://www.w3schools.com/dsa/dsa_algo_binarysearch.php',
    w3Title: 'Binary Search Algorithm Tutorial',
    w3Difficulty: 'Beginner to Intermediate',
    startVideo: {
      title: 'Binary Search Algorithm in 100 Seconds',
      channel: 'Fireship',
      url: 'https://www.youtube.com/watch?v=MFhxShGxHWc',
      duration: '2 mins'
    },
    deepVideo: {
      title: 'Binary Search Complete Blueprint & LeetCode Template',
      channel: 'NeetCode',
      url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI',
      duration: '21 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Binary Search ki Time Complexity O(log N) kyu hoti hai?', a: 'Har iteration ke baad search space exactly half ho jata hai: N -> N/2 -> ... -> 1.' },
      { id: 2, q: 'Integer overflow se bachne ke liye safe mid formula kya hai?', a: 'low + (high - low) / 2 use karte hain taaki 32-bit signed integer overflow na ho.' },
      { id: 3, q: 'Lower Bound aur Upper Bound mein kya difference hai?', a: 'Lower bound pehla index deta hai jahan element >= target ho; Upper bound pehla index jahan element > target ho.' }
    ]
  },
  'two-pointers': {
    w3Url: 'https://www.w3schools.com/dsa/dsa_theory_algo_twopointers.php',
    w3Title: 'Two Pointers Algorithm & Applications',
    w3Difficulty: 'Beginner',
    startVideo: {
      title: 'Two Pointers Technique Explained with LeetCode Problems',
      channel: 'NeetCode',
      url: 'https://www.youtube.com/watch?v=-gjxg6Pln50',
      duration: '14 mins'
    },
    deepVideo: {
      title: '3Sum & Trapping Rain Water using Two Pointers',
      channel: 'Striver (take U forward)',
      url: 'https://www.youtube.com/watch?v=jzZsG8n2R9A',
      duration: '28 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Two Pointers sorted array par O(N) kyu hota hai?', a: 'Pointers opposite ends se ek-dusre ki taraf move karte hain, har step par ek side eliminate hoti hai.' },
      { id: 2, q: 'Palindromes mein Two Pointers kaise check karte hain?', a: 'Ek pointer start par aur ek end par; dono characters equal hone par dono ko center ki taraf shrink karte hain.' }
    ]
  },
  'sliding-window': {
    w3Url: 'https://www.w3schools.com/dsa/dsa_algo_slidingwindow.php',
    w3Title: 'Sliding Window Subarray Optimization',
    w3Difficulty: 'Intermediate',
    startVideo: {
      title: 'Sliding Window Algorithm in 5 Minutes',
      channel: 'NeetCode',
      url: 'https://www.youtube.com/watch?v=MK-NZ4hN7rs',
      duration: '11 mins'
    },
    deepVideo: {
      title: 'Variable Sized Sliding Window & String Hash Maps',
      channel: 'Aditya Verma',
      url: 'https://www.youtube.com/watch?v=j_b_4n8Hj_4',
      duration: '24 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Fixed vs Variable size Sliding Window mein kya farak hai?', a: 'Fixed window ka size K constant rehta hai; Variable window condition violate hone par shrink hoti hai.' },
      { id: 2, q: 'Subarray sum mein sliding window negative numbers ke sath kyu fail hota hai?', a: 'Negative numbers window expansion ke monotonic nature ko break kar dete hain; wahan prefix sum + hash map chahiye.' }
    ]
  },
  'arrays': {
    w3Url: 'https://www.w3schools.com/dsa/dsa_data_arrays.php',
    w3Title: 'Arrays Data Structure Tutorial',
    w3Difficulty: 'Beginner',
    startVideo: {
      title: 'Arrays Data Structure & Memory Layout',
      channel: 'freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=8hly31xKli0',
      duration: '18 mins'
    },
    deepVideo: {
      title: 'Prefix Sums, Kadane\'s Algorithm & Two Pointer Techniques',
      channel: 'Abdul Bari',
      url: 'https://www.youtube.com/watch?v=86CQq33Z468',
      duration: '26 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Array access O(1) kyu hota hai?', a: 'Array elements memory mein contiguous block mein hote hain: address = base_address + index * element_size.' },
      { id: 2, q: 'Prefix Sum array ka primary use case kya hai?', a: 'Subarray sum queries ko O(1) time mein answer karna (prefix[R] - prefix[L-1]).' }
    ]
  },
  'hashing': {
    w3Url: 'https://www.w3schools.com/dsa/dsa_data_hashtables.php',
    w3Title: 'Hash Tables, Hash Functions & Collisions',
    w3Difficulty: 'Beginner to Intermediate',
    startVideo: {
      title: 'How Hash Tables and Hash Sets Work Under the Hood',
      channel: 'Tom Scott',
      url: 'https://www.youtube.com/watch?v=shs0KM3wKv8',
      duration: '9 mins'
    },
    deepVideo: {
      title: 'Hash Collisions, Chaining vs Open Addressing',
      channel: 'MIT OpenCourseWare',
      url: 'https://www.youtube.com/watch?v=0M_kI42AiDA',
      duration: '35 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Hash Map ki worst-case lookup complexity O(N) kab hoti hai?', a: 'Jab saare keys ek hi bucket par collide kar jayein aur collision chaining use ho rahi ho.' },
      { id: 2, q: 'Two Sum problem ko Hash Map se solve karne par time complexity kya aati hai?', a: 'O(N) time aur O(N) space, kyunki har number ka complement O(1) average lookup mein mil jata hai.' }
    ]
  },
  'web-sec': {
    w3Url: 'https://www.w3schools.com/cybersecurity/cybersecurity_web_security.php',
    w3Title: 'Web Application Security & OWASP Top 10',
    w3Difficulty: 'Intermediate',
    startVideo: {
      title: 'SQL Injection Explained & Prevented',
      channel: 'Computerphile',
      url: 'https://www.youtube.com/watch?v=_jKylhJtPmI',
      duration: '12 mins'
    },
    deepVideo: {
      title: 'PortSwigger Web Security Academy: SQLi Hands-on Lab',
      channel: 'Rana Khalil',
      url: 'https://www.youtube.com/watch?v=d_k8qF7vP3I',
      duration: '32 mins'
    },
    recallQuestions: [
      { id: 1, q: 'SQL Injection ka root cause kya hota hai?', a: 'Untrusted user input ko directly SQL statement string mein concatenate karna.' },
      { id: 2, q: 'SQLi se bachne ka 100% reliable defense kya hai?', a: 'Parameterized queries (Prepared Statements) use karna jahan user input ko pure data treat kiya jata hai.' }
    ]
  },
  'html-css': {
    w3Url: 'https://www.w3schools.com/css/css3_flexbox.asp',
    w3Title: 'CSS Flexbox & Responsive Layouts',
    w3Difficulty: 'Beginner',
    startVideo: {
      title: 'Flexbox in 15 Minutes',
      channel: 'Web Dev Simplified',
      url: 'https://www.youtube.com/watch?v=fYq5PXgSsbE',
      duration: '15 mins'
    },
    deepVideo: {
      title: 'CSS Grid vs Flexbox: When to use which?',
      channel: 'Kevin Powell',
      url: 'https://www.youtube.com/watch?v=3elGSZSWTbM',
      duration: '22 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Flexbox aur CSS Grid mein primary difference kya hai?', a: 'Flexbox 1-dimensional (row OR column) hota hai; CSS Grid 2-dimensional (rows AND columns) layout hota hai.' },
      { id: 2, q: 'justify-content vs align-items mein kya farak hai?', a: 'justify-content main axis par align karta hai; align-items cross axis par align karta hai.' }
    ]
  },
  'javascript': {
    w3Url: 'https://www.w3schools.com/js/js_es6.asp',
    w3Title: 'Modern JavaScript ES6+ Tutorial',
    w3Difficulty: 'Intermediate',
    startVideo: {
      title: 'JavaScript Event Loop Explained in Simple Terms',
      channel: 'Lydia Hallie',
      url: 'https://www.youtube.com/watch?v=eiC58R16hb8',
      duration: '14 mins'
    },
    deepVideo: {
      title: 'Closures, Lexical Scope and Memory in JavaScript',
      channel: 'Akshay Saini (Namaste JS)',
      url: 'https://www.youtube.com/watch?v=qikxEIxsXco',
      duration: '28 mins'
    },
    recallQuestions: [
      { id: 1, q: 'Microtask queue aur Task (Macrotask) queue mein pehle kaun execute hota hai?', a: 'Microtask queue (Promises, queueMicrotask) macrotasks (setTimeout) se pehle execute hota hai.' },
      { id: 2, q: 'Closure kya hota hai?', a: 'Ek function jo apne outer lexical environment ke variables ko retain karta hai chahe outer function return ho chuka ho.' }
    ]
  },
  'python': {
    w3Url: 'https://www.w3schools.com/python/default.asp',
    w3Title: 'Python Complete Language Tutorial',
    w3Difficulty: 'Beginner to Intermediate',
    startVideo: {
      title: 'Python for Beginners - Full Course',
      channel: 'Programming with Mosh',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      duration: '60 mins'
    },
    deepVideo: {
      title: 'Python Generators, Decorators & Memory Optimizations',
      channel: 'ArjanCodes',
      url: 'https://www.youtube.com/watch?v=Dqv07L4qQnI',
      duration: '25 mins'
    },
    recallQuestions: [
      { id: 1, q: 'List comprehension vs regular for-loop mein kya benefit hai?', a: 'List comprehension C-level bytecode optimization use karta hai aur code concise and readable hota hai.' },
      { id: 2, q: 'Python mein mutable default arguments kyu avoid karne chahiye?', a: 'def f(x=[]): function definition time par sirf ek baar evaluate hota hai, isliye state retain ho jati hai.' }
    ]
  },
  'dbms': {
    w3Url: 'https://www.w3schools.com/sql/default.asp',
    w3Title: 'SQL Database Management Tutorial',
    w3Difficulty: 'Beginner to Intermediate',
    startVideo: {
      title: 'Database Design & SQL in 100 Seconds',
      channel: 'Fireship',
      url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      duration: '2 mins'
    },
    deepVideo: {
      title: 'Database Indexing, B-Trees & Query Optimization',
      channel: 'Hussein Nasser',
      url: 'https://www.youtube.com/watch?v=-qNSXK7s7_w',
      duration: '34 mins'
    },
    recallQuestions: [
      { id: 1, q: 'ACID transactions mein "I" (Isolation) ka kya matlab hai?', a: 'Multiple transactions concurrently execute hote waqt ek-dusre ke uncommitted data ko interfere na karein.' },
      { id: 2, q: 'B-Tree index se search query fast kyu hoti hai?', a: 'Full table scan O(N) ke bajaye O(log N) tree traversal mein required rows locate ho jati hain.' }
    ]
  }
};

export function getTopicResource(skillId: string): TopicResource {
  return topicResources[skillId] || {
    w3Url: `https://www.w3schools.com/dsa/`,
    w3Title: `${skillId.toUpperCase()} Fundamentals`,
    w3Difficulty: 'Intermediate',
    startVideo: {
      title: `${skillId.toUpperCase()} Quick Overview`,
      channel: 'freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=8hly31xKli0',
      duration: '15 mins'
    },
    deepVideo: {
      title: `${skillId.toUpperCase()} Architecture Deep Dive`,
      channel: 'Computerphile',
      url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI',
      duration: '25 mins'
    },
    recallQuestions: [
      { id: 1, q: `What is the core advantage of ${skillId}?`, a: 'Provides optimized data organization, predictable time complexity, and modular scalability.' },
      { id: 2, q: 'How do you analyze worst-case time complexity?', a: 'Count upper-bound elementary operations relative to input size N (Big-O notation).' }
    ]
  };
}
