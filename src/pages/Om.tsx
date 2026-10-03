import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, BookOpen, Brain, Lightbulb, RotateCcw, ChevronRight, Terminal, Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { BhaiMessage } from '../types';
import { authService } from '../services/authService';
import { getMentorAddress, isRidhimaProfile } from '../utils/mentorPersonalization';

// OM's Senior Mentor Intelligence Engine
// Tone: Patient, supportive, clear, human, slightly senior, encouraging.
function generateOmResponse(
  userMessage: string, 
  context: { conceptId?: string | null; messages: BhaiMessage[]; userName?: string }
): string {
  const msg = userMessage.toLowerCase().trim();
  const currentUser = authService.getCurrentUser();
  const address = getMentorAddress(currentUser, 'greeting');
  const isRidhima = isRidhimaProfile(currentUser);

  // 1. Prefix Technique
  if (msg.includes('prefix') || context.conceptId?.includes('prefix')) {
    return `Chaliye pehle **Prefix Technique** ka intuition samajhte hain.

Imagine kijiye aapke paas ek daily scores array hai:
\`[2, 4, 1, 7, 3]\`

Agar main aapse poochhoon: *"Index 1 se index 3 tak ka sum kya hai?"*
Aap \`4 + 1 + 7 = 12\` manually add karenge.
Lekin agar 100,000 queries aayi toh har query me loop lagana **O(N * Q)** bana dega (Time Limit Exceeded).

**OM's Key Insight:**
Hum ek cumulative sum array banate hain:
- Original: \`[2, 4, 1, 7, 3]\`
- Prefix:   \`[2, 6, 7, 14, 17]\`

Ab sum(1..3) nikalne ke liye:
\`prefix[3] - prefix[0] = 14 - 2 = 12\` — **O(1) time mein instant result!**

Subarray problems me jab sum(i..j) == k dhoondhna ho:
\`prefix[j] - prefix[i-1] == k\`  =>  \`prefix[i-1] == prefix[j] - k\`
Bas HashMap me dekhiye ki \`prefix[j] - k\` pehle kitni baar dekha gaya hai!

Kya aap ek simple 3-element example par try karna chahenge?`;
  }

  // 2. Two Pointers — All Three Forms
  if (msg.includes('two pointer') || msg.includes('two pointers') || msg.includes('pointer') || context.conceptId?.includes('two-pointer')) {
    return `Pehle Two Pointers technique ko decode karte hain. Syllabus mein iske **3 distinct forms** use hote hain:

1. **Form 1: Converging / Opposite Ends (Sorted Arrays)**
   - Ek pointer \`left = 0\`, doosra \`right = n - 1\`.
   - Use case: Two Sum in Sorted Array, Container with Most Water.
   - Pointers center ki taraf move karte hain jab tak \`left < right\`.

2. **Form 2: Same Direction / Fast & Slow (In-Place Modifications)**
   - Dono pointers 0 se start karte hain: \`slow\` valid position track karta hai, \`fast\` scan karta hai.
   - Use case: Move Zeroes, Remove Duplicates.

3. **Form 3: Sliding Window (Range Boundaries)**
   - Window expand hoti hai right pointer se, aur shrink hoti hai left pointer se jab condition invalidate ho.
   - Use case: All Anagrams, Subarray Average >= Threshold.

Kaunse form ka visual walkthrough dekhna chahenge aap?`;
  }

  // 3. Binary Search
  if (msg.includes('binary search') || context.conceptId?.includes('bs')) {
    if (msg.includes('answer') || msg.includes('space') || msg.includes('koko') || msg.includes('capacity')) {
      return `Yeh syllabus ka sabse powerful pattern hai: **Binary Search on the Answer Space**!

Direct binary search array ke elements dhoondhta hai. Lekin yahan hum ek **monotonic decision** par binary search karte hain:
- Example: *"Minimum ship capacity kitni honi chahiye taaki D days mein ship ho sake?"*
- Agar capacity 15 valid hai, toh 16, 17, 18 bhi guaranteed valid honge!
- Is monotonicity ki wajah se hum answer ki range \`[max(weights), sum(weights)]\` par Binary Search karte hain.

Search space aadha hota jata hai -> **O(N * log(Range))**. Brilliant pattern hai!`;
    }

    return `Chaliye Binary Search ko zero se samajhte hain.

Ek simple example: imagine kijiye sorted array hai:
\`[2, 5, 7, 10, 14, 18, 21]\` aur humein \`14\` dhoondhna hai.

- **Step 1:** Left = 0, Right = 6 -> Mid = index 3 (\`10\`).
- 14 > 10, iska matlab 14 left half mein kabhi ho hi nahi sakta! Left half ko safely eliminate kar do.
- New range: index 4 se 6 (\`[14, 18, 21]\`).
- **Step 2:** Mid = index 5 (\`18\`). 14 < 18 -> Right half eliminate!
- **Step 3:** Mid = index 4 (\`14\`). Found!

Sirf 3 steps lage! Time complexity: **O(log n)**.
Always remember: Binary search ke liye search space ka **monotonic / sorted** hona zaroori hai.`;
  }

  // 4. 2D Array / Matrix
  if (msg.includes('2d') || msg.includes('matrix') || context.conceptId?.includes('matrix')) {
    return `2D Array ko coordinates ki tarah sochiye:
\`matrix[row][col]\`

Syllabus ke core 2D patterns:
1. **Diagonal Traversal:** Primary diagonal me \`row == col\`, secondary diagonal me \`row + col == n - 1\`.
2. **In-Place Rotation (90°):** Step 1 = Transpose (swap matrix[i][j] with matrix[j][i]), Step 2 = Reverse each row!
3. **Spiral Matrix:** 4 boundary pointers: \`top\`, \`bottom\`, \`left\`, \`right\`.

Kiski indexing me confusion ho raha hai? Main step-by-step trace karke dikhata hoon.`;
  }

  // 5. Exam Preparation Strategy
  if (msg.includes('exam') || msg.includes('mock') || msg.includes('90 min') || msg.includes('syllabus')) {
    return `Exam ke liye OM ka golden rule: **"Think before you code."**

90-minute evaluation mein 3 questions honge:
- **Q1 (Direct):** Pehle 15-20 min mein direct question solve karke score secure karein.
- **Q2 (Multi-concept):** Aksar Prefix + HashMap ya Two Pointers + Frequency hota hai. Input/Output identify karein.
- **Q3 (Tricky):** Binary Search on Answer ya 2D Coordinate reasoning. Constraints dekh kar complexity estimate karein.

Mock Exam Simulator try karne ke liye sidebar mein **EXAM SIMULATOR** select kijiye. Main exam ke baad aapka complete debrief aur concept reveal karunga!`;
  }

  // Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return isRidhima
      ? `Hey ${address}! Main OM hoon — aapka senior developer mentor.
Pehle question ko decode karte hain, intuition samajhte hain, aur phir step-by-step solve karte hain.
Aaj kya solid practice karenge?
- **Sir's Practice Sheet** ke problem drills?
- **Prefix Sum** ya **Two Pointers** ke 3 forms?
- Ya 90-minute **Exam Simulator**?
Bataiye, chaliye start karte hain! 🚀`
      : `Hey ${address}! Main OM hoon — aapka senior developer mentor.
Pehle question ko decode karte hain, intuition samajhte hain, aur phir clean code likhte hain.
Aaj hum kya master karenge?
- **Sir's Practice Sheet** ke questions?
- **Prefix Sum** ya **Two Pointers** ke 3 forms?
- Ya 90-minute **Exam Simulator** ki strategy?
Bataiye, chaliye start karte hain! 🚀`;
  }

  // General encouraging mentor response
  return `${address}, ek small observation hai — try kijiye:
1. **Given kya hai?** (Input format aur constraints dhyan se dekhiye)
2. **Goal kya hai?** (Expected output format)
3. **Brute force kya karta?** Aur kahan time complexity bottleneck banegi?

Aap mujhe apna initial thought bataiye — main step-by-step guide karunga. Ek baar khud try kijiye! 😊`;
}

export default function OmPage() {
  const { bhaiMessages, addBhaiMessage, bhaiTeachingConcept, setBhaiTeachingConcept, setCurrentPage, userName } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bhaiMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle auto-teach requests triggered from learning concept cards
  useEffect(() => {
    if (bhaiTeachingConcept) {
      const conceptName = bhaiTeachingConcept.replace(/-/g, ' ').replace('bs ', 'Binary Search ');
      handleSend(`OM, teach me ${conceptName}`);
      setBhaiTeachingConcept(null);
    }
  }, []);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    // Add user message
    const userMsg: BhaiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    addBhaiMessage(userMsg);
    setInput('');

    // Simulate senior mentor thoughtful typing
    setIsTyping(true);
    setTimeout(() => {
      const response = generateOmResponse(message, {
        conceptId: bhaiTeachingConcept,
        messages: [...bhaiMessages, userMsg],
        userName,
      });

      const omMsg: BhaiMessage = {
        id: `om-${Date.now()}`,
        role: 'bhai',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      addBhaiMessage(omMsg);
      setIsTyping(false);
    }, 700 + Math.random() * 800);
  };

  const mentorSuggestions = [
    { label: 'Chaliye pehle intuition samajhte hain', icon: <Lightbulb size={12} /> },
    { label: 'Teach me Two Pointers — All 3 Forms', icon: <BookOpen size={12} /> },
    { label: 'Teach me Prefix Sum Technique', icon: <Brain size={12} /> },
    { label: 'How to do Binary Search on Answer Space?', icon: <Target size={12} /> },
    { label: '90-minute Exam Simulator Strategy', icon: <Terminal size={12} /> },
  ];

  return (
    <div className="h-full flex flex-col min-w-0 bg-surface-0">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-default bg-surface-1 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-copper/20 border border-accent-copper/40 flex items-center justify-center text-accent-copper font-serif font-bold text-base shrink-0 shadow-sm">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">OM — Senior Developer Mentor</h2>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-accent-copper/15 text-accent-copper font-medium border border-accent-copper/25">
                Evaluation Syllabus Coach
              </span>
            </div>
            <p className="text-2xs text-text-tertiary">Patient, structured guidance for coding interviews and exams</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('sirsheet')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-secondary hover:text-text-primary text-xs border border-border-default transition-all"
        >
          <span>Sir's Practice Sheet</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 min-w-0">
        {bhaiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`max-w-[90%] sm:max-w-[78%] min-w-0 ${msg.role === 'user' ? 'order-2' : ''}`}>
              {msg.role === 'bhai' && (
                <div className="flex items-center gap-1.5 mb-1 text-2xs text-accent-copper font-medium">
                  <span className="font-serif">ॐ</span>
                  <span>OM</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-blue text-white rounded-br-sm'
                    : 'bg-surface-2 text-text-primary border border-border-default rounded-bl-sm shadow-sm'
                }`}
              >
                <MessageContent content={msg.content} />
              </div>
              <span className="text-2xs text-text-tertiary mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Thinking Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface-2 border border-border-default rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-2xs text-accent-copper font-serif font-bold">ॐ</span>
              <span className="text-2xs text-text-tertiary">OM is formulating intuition...</span>
              <div className="flex gap-1 items-center ml-1">
                <div className="w-1.5 h-1.5 bg-accent-copper rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-accent-copper rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-accent-copper rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Mentor Inquiries */}
      {bhaiMessages.length <= 4 && (
        <div className="px-3 sm:px-6 pb-2 flex flex-wrap gap-1.5 sm:gap-2">
          {mentorSuggestions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action.label)}
              className="flex items-center gap-1.5 bg-surface-2 hover:bg-surface-3 border border-border-default text-text-secondary text-2xs sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full transition-all active:scale-[0.98]"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border-default bg-surface-1 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 bg-surface-2 border border-border-default focus-within:border-accent-copper rounded-full px-4 py-2 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask OM anything about DSA, syllabus, code debugging..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-2 rounded-full transition-all ${
              input.trim() && !isTyping
                ? 'bg-accent-copper text-surface-0 hover:bg-copper-accent-hover'
                : 'text-text-tertiary cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-2xs text-text-tertiary mt-2 text-center">
          OM gives constructive step-by-step guidance. Use Coding Lab for real code compilation and debugging.
        </p>
      </div>
    </div>
  );
}

// Markdown-like message renderer
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '').replace(/```$/, '');
          return (
            <pre key={i} className="bg-surface-0 rounded-lg p-2.5 sm:p-3 my-2 overflow-x-auto font-mono text-2xs sm:text-xs text-text-primary border border-border-default max-w-full">
              <code>{code}</code>
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="bg-surface-3 text-accent-copper px-1.5 py-0.5 rounded font-mono text-2xs sm:text-xs">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-text-secondary">{part.slice(1, -1)}</em>;
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      })}
    </>
  );
}
