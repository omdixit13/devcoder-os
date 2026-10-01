import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Brain, Lightbulb, RotateCcw, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { BhaiMessage } from '../types';

// Bhai's response logic — simulating intelligent Hinglish tutor behavior
function generateBhaiResponse(userMessage: string, context: { conceptId?: string | null; messages: BhaiMessage[] }): string {
  const msg = userMessage.toLowerCase().trim();
  
  // Teaching Binary Search
  if (msg.includes('binary search') || msg.includes('teach') || context.conceptId?.includes('bs')) {
    if (msg.includes('teach') || msg.includes('explain') || msg.includes('start') || msg.includes('what is')) {
      return `Chaliye Binary Search ko zero se samajhte hain.

Ek simple example se start karte hain — imagine karo ki aapke paas ek sorted array hai:

\`[2, 4, 7, 9, 13, 18]\`

Aur aapko 13 find karna hai.

Ab sochiye — agar aap pehle element se shuru karenge aur ek ek karke check karenge, toh worst case mein saare elements dekhne padenge. That's O(n).

But wait — array sorted hai! Can we use that property?

🤔 **Aap batao:** Agar sorted array hai aur 13 find karna hai, toh aap pehle kis element ko check karenge? Middle wala, first wala, ya last wala?`;
    }
    
    if (msg.includes('middle') || msg.includes('mid') || msg.includes('beech')) {
      return `Exactly! 👏 Middle se start karna — yahi Binary Search ka core idea hai.

Array: \`[2, 4, 7, 9, 13, 18]\`

**Step 1:** Middle element = index 2 → value \`7\`
Target 13 > 7, toh left side ignore karo. Ab search space: \`[9, 13, 18]\`

**Step 2:** Middle element = \`13\`
Found! ✅

Dekha? Sirf 2 steps mein mil gaya, instead of 5 (linear search).

**Key insight:** Har step mein search space aadha ho jaata hai. 
Isliye time complexity hai **O(log n)** — bahut fast!

Ab ek important question: Kya Binary Search unsorted array pe kaam karega?`;
    }
    
    if (msg.includes('no') || msg.includes('nahi') || msg.includes('unsorted')) {
      return `Bilkul sahi! Binary Search sirf **sorted data** pe kaam karta hai.

Kyunki? Because humara poora logic isi assumption pe based hai:
- Agar middle se chhota hai → left mein hoga
- Agar middle se bada hai → right mein hoga

Unsorted array mein ye guarantee nahi milti.

Ab implementation dekhte hain:

\`\`\`
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  
  while (low <= high) {
    let mid = low + Math.floor((high - low) / 2);
    
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  
  return -1; // not found
}
\`\`\`

Ek important baat — \`mid = low + (high - low) / 2\` use kiya hai instead of \`(low + high) / 2\`. 

Aapko pata hai kyun?`;
    }
    
    if (msg.includes('overflow') || msg.includes('integer')) {
      return `Perfect! \`(low + high)\` integer overflow de sakta hai jab dono values bahut bade hon.

\`low + (high - low) / 2\` — isme pehle difference lete hain, toh overflow nahi hoga.

Ye ek classic mistake hai jo interviews mein catch kiya jaata hai. Good that you know it!

Ab practice karte hain. Ye problem try karo:

**LeetCode 704 — Binary Search**
👉 https://leetcode.com/problems/binary-search/

Basic implementation hai — jo humne abhi seekha wahi lagega. 

Khud try karo pehle, agar stuck ho toh hint maango. 💪`;
    }
  }
  
  // Graphs
  if (msg.includes('graph') || context.conceptId?.includes('graph')) {
    return `Graphs ek bahut powerful data structure hai. Real duniya mein bahut jagah use hota hai — social networks, maps, web pages, dependencies — sab graphs hain.

Basically, graph mein hote hain:
- **Nodes (vertices)** — entities
- **Edges** — connections between entities

Types:
1. **Directed** — edges have direction (like Twitter follow)
2. **Undirected** — bidirectional (like Facebook friendship)
3. **Weighted** — edges have cost/distance

Pehle ye batao — aapne Trees padha hai? Kyunki Tree actually ek special type ka graph hai (connected, acyclic). 

Agar Trees comfortable hain toh Graphs samajhna relatively easy hoga. Kya aap ready hain deep dive ke liye?`;
  }

  // Trees
  if (msg.includes('tree') || context.conceptId?.includes('tree')) {
    return `Trees ek hierarchical data structure hai — sochiye family tree ya file system jaise.

**Core terms:**
- **Root** — topmost node
- **Parent/Child** — connected nodes
- **Leaf** — no children
- **Height** — longest path from root to leaf
- **Depth** — distance from root

Sabse common tree hai **Binary Tree** — har node ke maximum 2 children.

Ek simple example:

\`\`\`
        1
       / \\
      2   3
     / \\
    4   5
\`\`\`

Yahan:
- Root = 1
- Leaves = 3, 4, 5
- Height = 2

Trees ko traverse karne ke 3 main tarike hain. Kya aap guess kar sakte hain?`;
  }

  // Motivational / General
  if (msg.includes('stuck') || msg.includes('hard') || msg.includes('difficult')) {
    return `Ye feeling completely normal hai. Har concept initially challenging lagta hai — aur iska matlab ye nahi ki aap mein koi kami hai.

Mera suggestion:
1. Ek step back lo aur basics revisit karo
2. Chhota sa example pe khud trace karo
3. Pattern dhundho — approach identify karo
4. Agar 20 min se stuck ho, toh hint lelo — it's okay

Remember: Struggle = Learning. Easy cheezein padh ke kuch nahi hota. Jo difficult lag raha hai, wahi aapko grow kara raha hai.

Batao kis specific part mein stuck ho? Main breakdown karta hoon.`;
  }

  if (msg.includes('what should i') || msg.includes('kya karu') || msg.includes('today') || msg.includes('next')) {
    return `Based on aapki current progress:

1. **Binary Search on Answer** concept pending hai — ~20 min lagega
2. **2 spaced reviews** due hain — ~10 min
3. **Koko Eating Bananas** problem try karo — BS on Answer ka application hai

Mera suggestion: Pehle review karo (fresh rehega), phir naya concept, phir practice.

Total: ~45 min ka focused session.

Kya start karein? Main Binary Search on Answer se shuru karta hoon if you want.`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return `Hey Om! Kaise hain aap? 

Aaj kya plan hai? Learning continue karein, practice karein, ya kuch specific topic discuss karna hai?

Main ready hoon — batao kya karte hain! 🚀`;
  }

  // Default contextual response
  return `Achha point hai! Let me think about this...

Aapka question interesting hai. Kya aap thoda aur specific ho sakte hain? Like:
- Koi particular concept samajhna hai?
- Kisi problem mein stuck hain?
- Career/opportunity related kuch jaanna hai?

Main try karunga best possible way mein explain karna. Chaliye, batao! 😊`;
}

export default function BhaiPage() {
  const { bhaiMessages, addBhaiMessage, bhaiTeachingConcept, setBhaiTeachingConcept, setCurrentPage } = useAppStore();
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

  // If Bhai was triggered from a concept, auto-send a teach request
  useEffect(() => {
    if (bhaiTeachingConcept) {
      const conceptName = bhaiTeachingConcept.replace(/-/g, ' ').replace('bs ', 'Binary Search ');
      handleSend(`Bhai, teach me ${conceptName}`);
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

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      const response = generateBhaiResponse(message, {
        conceptId: bhaiTeachingConcept,
        messages: [...bhaiMessages, userMsg],
      });

      const bhaiMsg: BhaiMessage = {
        id: `bhai-${Date.now()}`,
        role: 'bhai',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      addBhaiMessage(bhaiMsg);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const quickActions = [
    { label: 'What should I study today?', icon: <Lightbulb size={12} /> },
    { label: 'Teach me Binary Search', icon: <BookOpen size={12} /> },
    { label: 'I\'m stuck on a problem', icon: <Brain size={12} /> },
    { label: 'Teach me Trees', icon: <BookOpen size={12} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-purple-700 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Bhai — AI Tutor</h2>
            <p className="text-2xs text-accent-purple">Your supportive learning companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {bhaiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : ''}`}>
              {msg.role === 'bhai' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={10} className="text-accent-purple" />
                  <span className="text-2xs font-medium text-accent-purple">Bhai</span>
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-blue text-white rounded-br-sm'
                    : 'bg-surface-3 text-text-secondary border border-border-subtle rounded-bl-sm'
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
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {bhaiMessages.length <= 2 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action.label)}
              className="flex items-center gap-1.5 bg-surface-3 hover:bg-surface-4 border border-border-default text-text-secondary text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border-subtle shrink-0">
        <div className="flex items-center gap-3 bg-surface-3 border border-border-default rounded-xl px-4 py-2.5 focus-within:border-accent-purple/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Bhai anything..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-1.5 rounded-lg transition-colors ${
              input.trim() && !isTyping
                ? 'bg-accent-purple text-white hover:bg-purple-600'
                : 'text-text-tertiary'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-2xs text-text-tertiary mt-2 text-center">
          Bhai uses your learning context to give personalized guidance
        </p>
      </div>
    </div>
  );
}

// --- Message Content Renderer (handles code blocks and formatting) ---
function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        // Code block
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '').replace(/```$/, '');
          return (
            <pre key={i} className="bg-surface-0 rounded-lg p-3 my-2 overflow-x-auto font-mono text-xs text-text-primary border border-border-subtle">
              <code>{code}</code>
            </pre>
          );
        }
        // Inline code
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-surface-4 px-1.5 py-0.5 rounded text-xs font-mono text-accent-cyan">{part.slice(1, -1)}</code>;
        }
        // Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
        }
        // Italic
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        // Regular text — preserve line breaks
        return <span key={i}>{part.split('\n').map((line, j) => (
          <React.Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ))}</span>;
      })}
    </>
  );
}
