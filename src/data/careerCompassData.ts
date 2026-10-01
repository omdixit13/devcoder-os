import type { CompassQuestion, CareerTrackId, InterestSignal } from '../types';

export const careerTracksInfo: Record<CareerTrackId, {
  title: string;
  category: string;
  tagline: string;
  description: string;
  keySkills: string[];
  suggestedFirstStep: string;
}> = {
  ai_ml: {
    title: 'AI / Machine Learning',
    category: 'Intelligent Systems',
    tagline: 'Teaching computers to learn from patterns and data',
    description: 'Developing models, predictive algorithms, neural networks, and generative AI systems that extract knowledge and make autonomous decisions.',
    keySkills: ['Python', 'NumPy & Pandas', 'Scikit-Learn', 'PyTorch', 'Math & Statistics', 'Deep Learning'],
    suggestedFirstStep: 'Run the tabular dataset experiment below, then explore the AI/ML Foundations Roadmap.',
  },
  data_science: {
    title: 'Data Science & Analytics',
    category: 'Data & Insights',
    tagline: 'Unlocking actionable truth from complex information',
    description: 'Exploratory data analysis, statistical inference, visualization, storytelling, and building quantitative metrics for decisions.',
    keySkills: ['Python', 'SQL', 'Data Visualization', 'Hypothesis Testing', 'Pandas', 'Business Insights'],
    suggestedFirstStep: 'Analyze an open dataset and write a 1-page visual findings report.',
  },
  full_stack: {
    title: 'Full Stack Web Engineering',
    category: 'Product Development',
    tagline: 'Architecting complete user experiences and scalable servers',
    description: 'Building modern web applications from responsive interactive interfaces to performant backend APIs, databases, and authentication.',
    keySkills: ['TypeScript', 'React', 'Node.js / Next.js', 'PostgreSQL / SQLite', 'REST & GraphQL', 'Tailwind CSS'],
    suggestedFirstStep: 'Build a small full-stack CRUD app with React and an Express/Node API.',
  },
  cybersecurity: {
    title: 'Cybersecurity & Defense',
    category: 'Security & Systems',
    tagline: 'Safeguarding systems, finding vulnerabilities, and engineering security',
    description: 'Securing networks, ethical hacking, finding application vulnerabilities, cryptography, threat modeling, and defensive engineering.',
    keySkills: ['Network Protocols (TCP/IP)', 'Linux Internals', 'OWASP Top 10', 'Cryptography', 'Wireshark', 'CTF Labs'],
    suggestedFirstStep: 'Try the Request Inspection & Sanitizer experiment below, then solve PicoCTF beginner challenges.',
  },
  cloud_devops: {
    title: 'Cloud & DevOps / SRE',
    category: 'Infrastructure',
    tagline: 'Ensuring resilience, automated deployments, and global scalability',
    description: 'Containerization, continuous integration/deployment (CI/CD), infrastructure as code, monitoring, and cloud platforms.',
    keySkills: ['Docker & Kubernetes', 'Linux', 'CI/CD Pipelines', 'AWS / Azure / GCP', 'Terraform', 'Prometheus'],
    suggestedFirstStep: 'Dockerize a simple Node or Python application and inspect container logs.',
  },
  data_engineering: {
    title: 'Data Engineering',
    category: 'Data Infrastructure',
    tagline: 'Building the data superhighways for modern organizations',
    description: 'Designing reliable ETL pipelines, stream processing, distributed databases, and high-throughput data warehousing.',
    keySkills: ['SQL', 'Python', 'Apache Spark / Kafka', 'Data Warehousing', 'Airflow', 'Database Internals'],
    suggestedFirstStep: 'Build a pipeline that ingests API data, cleans it, and loads it into a relational database.',
  },
  backend_systems: {
    title: 'Backend & Systems Engineering',
    category: 'Core Engineering',
    tagline: 'Building ultra-fast, robust, concurrent server infrastructure',
    description: 'Low-level systems programming, concurrency, distributed systems, cache architectures, and high-throughput microservices.',
    keySkills: ['Go / C++ / Java', 'Distributed Systems', 'Concurrency', 'Redis / Caching', 'Database Indexing', 'System Design'],
    suggestedFirstStep: 'Build a concurrent web crawler or in-memory key-value cache with concurrency locks.',
  },
  product_tech: {
    title: 'Product Engineering & Tech Management',
    category: 'Product & Architecture',
    tagline: 'Bridging engineering rigor with real human user needs',
    description: 'Synthesizing technical feasibility with user experience, roadmapping, MVP scoping, agile delivery, and business impact.',
    keySkills: ['System Scoping', 'Technical Writing', 'UI/UX Principles', 'Agile Delivery', 'Metrics & Telemetry'],
    suggestedFirstStep: 'Write a comprehensive technical specification for a feature before writing any code.',
  },
  applied_research: {
    title: 'Applied Research & Algorithms',
    category: 'Scientific Computing',
    tagline: 'Pushing the boundary of algorithmic efficiency and novelty',
    description: 'Reading academic literature, proving algorithm bounds, experimenting with novel techniques, and formal problem reduction.',
    keySkills: ['Advanced Discrete Math', 'Algorithm Design', 'Paper Reproduction', 'Formal Proofs', 'C++ / Python'],
    suggestedFirstStep: 'Read an seminal CS paper and reproduce its baseline benchmark locally.',
  },
  mobile_dev: {
    title: 'Mobile App Development',
    category: 'Client Platforms',
    tagline: 'Crafting responsive, native mobile apps in everyone’s pocket',
    description: 'Native and cross-platform mobile experiences with offline storage, gesture ergonomics, push notifications, and device sensors.',
    keySkills: ['React Native / Flutter', 'Swift / Kotlin', 'Mobile UI/UX', 'Offline-First Storage', 'Device APIs'],
    suggestedFirstStep: 'Build a cross-platform mobile app prototype with native device storage and gestures.',
  },
};

export const compassQuestions: CompassQuestion[] = [
  {
    id: 1,
    questionText: 'Jab aapko koi naya project ya problem milti hai, aapka pehla natural instinct kis direction mein jaata hai?',
    bhaiHint: 'Bhai kehta hai: Pehla impulse observe karo — kya screen pe cheez dikhana chahte ho, algorithms solve karna chahte ho, ya system secure banana chahte ho?',
    options: [
      {
        id: 'q1-a',
        text: 'Ek beautiful, fast UI banana jise koi use karke wow bole',
        description: 'Visual feedback, layout polish, and smooth interactive flow',
        weights: { full_stack: 3, product_tech: 2, mobile_dev: 2 },
      },
      {
        id: 'q1-b',
        text: 'Data ko inspect karna, patterns dhoondhna aur predictions banana',
        description: 'Analyzing datasets, correlations, and predictive modeling',
        weights: { ai_ml: 3, data_science: 3, data_engineering: 1 },
      },
      {
        id: 'q1-c',
        text: 'System ki weaknesses dhoondhna — "Yeh kaise break ya hack ho sakta hai?"',
        description: 'Vulnerability assessment, edge-case probing, and defensive architecture',
        weights: { cybersecurity: 4, backend_systems: 1 },
      },
      {
        id: 'q1-d',
        text: 'High-performance backend logic aur database architecture design karna',
        description: 'Data models, APIs, concurrency, and scalable plumbing',
        weights: { backend_systems: 3, cloud_devops: 2, data_engineering: 2 },
      },
    ],
  },
  {
    id: 2,
    questionText: 'Mathematics aur statistical concepts ke sath aapka comfort and interest level kaisa hai?',
    bhaiHint: 'Bhai: Honest answer dena. Math pasand hona ya na hona dono fine hai — engineering mein har track ki apni strength hoti hai.',
    options: [
      {
        id: 'q2-a',
        text: 'Mujhe Linear Algebra, Probability aur Calculus samajhna aur use karna pasand hai',
        description: 'Eager to work with gradients, matrix transformations, and distributions',
        weights: { ai_ml: 3, data_science: 3, applied_research: 3 },
      },
      {
        id: 'q2-b',
        text: 'Discrete Mathematics, Logic, Cryptography aur Boolean algebra mujhe fascinate karte hain',
        description: 'Modular arithmetic, encryption theory, and formal logic',
        weights: { cybersecurity: 3, backend_systems: 2, applied_research: 2 },
      },
      {
        id: 'q2-c',
        text: 'Practical math fine hai (percentages, metrics, analytics), par code aur logic zyada enjoy karta hoon',
        description: 'Using math as a utility tool without needing advanced proofs',
        weights: { full_stack: 2, data_engineering: 2, product_tech: 2 },
      },
      {
        id: 'q2-d',
        text: 'Math se zyada architecture, networking, tool integration aur deployment exciting lagta hai',
        description: 'Focus on protocols, system orchestration, and reliability',
        weights: { cloud_devops: 3, backend_systems: 2, mobile_dev: 1 },
      },
    ],
  },
  {
    id: 3,
    questionText: 'Jab aap kisi application ka Login / Registration form dekhte hain, sabse pehla thought kya aata hai?',
    bhaiHint: 'Bhai: Har engineer ka perspective alag hota hai. Security engineer vulnerabilities dekhta hai, Frontend developer UX dekhta hai.',
    options: [
      {
        id: 'q3-a',
        text: '"Kya SQL injection ya credential stuffing possible hai? Password hashing kaise hui hai?"',
        description: 'Thinking like a security researcher looking for OWASP vulnerabilities',
        weights: { cybersecurity: 4, backend_systems: 1 },
      },
      {
        id: 'q3-b',
        text: '"Form validation kitni smooth hai? Error state smoothly animate ho raha hai ya nahi?"',
        description: 'Focusing on UX responsiveness, micro-interactions, and accessibility',
        weights: { full_stack: 3, product_tech: 2, mobile_dev: 2 },
      },
      {
        id: 'q3-c',
        text: '"Token generation (JWT/OAuth), session caching, aur database indexing kaise handled hai?"',
        description: 'Focusing on backend architecture, token security, and scalability',
        weights: { backend_systems: 3, cloud_devops: 2, full_stack: 1 },
      },
      {
        id: 'q3-d',
        text: '"User behavior anomalies ko detect karke fraud prevention ML model kaise lag sakta hai?"',
        description: 'Focusing on user telemetry, fraud detection, and predictive scoring',
        weights: { ai_ml: 2, data_science: 3, data_engineering: 1 },
      },
    ],
  },
  {
    id: 4,
    questionText: 'Debugging karte waqt aapko kis type ki problem solve karne mein satisfaction milti hai?',
    bhaiHint: 'Bhai: Frustration sabko hoti hai, par kis type ki mystery solve karne ke baad "Yes!" nikalta hai?',
    options: [
      {
        id: 'q4-a',
        text: 'Packet trace, network headers, aur permission issues ko decode karke bypass/fix karna',
        description: 'Inspecting network payloads, SSL handshakes, and privilege models',
        weights: { cybersecurity: 3, cloud_devops: 2 },
      },
      {
        id: 'q4-b',
        text: 'Model underfitting/overfitting hai — hyperparameters aur feature encoding ko tune karke metric badhana',
        description: 'Iterating on loss curves, data leakage, and feature transformations',
        weights: { ai_ml: 4, data_science: 2 },
      },
      {
        id: 'q4-c',
        text: 'Race conditions, database deadlocks, ya high latency query bottlenecks ko optimize karna',
        description: 'Profiling thread pools, index scans, memory leaks, and concurrency',
        weights: { backend_systems: 4, data_engineering: 2, cloud_devops: 2 },
      },
      {
        id: 'q4-d',
        text: 'Asynchronous state synchronization, broken UI rendering, ya mobile responsiveness fix karna',
        description: 'Fixing re-render cycles, state mutations, and layout rendering glitches',
        weights: { full_stack: 3, mobile_dev: 3 },
      },
    ],
  },
  {
    id: 5,
    questionText: 'Aapko kis level of abstraction pe kaam karna naturally comfortable lagta hai?',
    bhaiHint: 'Bhai: Kuch logon ko hardware/OS ke paas rehna pasand hota hai, kuch ko end-user ke paas.',
    options: [
      {
        id: 'q5-a',
        text: 'High-level user experience — screen, buttons, workflows, animations, and human psychology',
        description: 'Close to the user and final product presentation',
        weights: { full_stack: 3, mobile_dev: 3, product_tech: 3 },
      },
      {
        id: 'q5-b',
        text: 'Mathematical & algorithmic models — tensors, embeddings, weights, and evaluation metrics',
        description: 'Close to data modeling and algorithmic reasoning',
        weights: { ai_ml: 3, data_science: 3, applied_research: 3 },
      },
      {
        id: 'q5-c',
        text: 'Middle tier — business logic, REST/GraphQL APIs, database queries, and data workflows',
        description: 'Connecting user needs to robust system logic',
        weights: { full_stack: 2, backend_systems: 3, data_engineering: 2 },
      },
      {
        id: 'q5-d',
        text: 'Low level & infrastructure — Linux terminal, memory management, networks, Docker, system calls',
        description: 'Close to the operating system, security boundaries, and hardware',
        weights: { cybersecurity: 3, cloud_devops: 3, backend_systems: 2 },
      },
    ],
  },
  {
    id: 6,
    questionText: 'Large datasets (million rows, sensor logs, user telemetry) dekhkar aapke dimaag mein kya aata hai?',
    bhaiHint: 'Bhai: Big data dekhkar ghabrahat hoti hai ya excitement ki "isme se kya insights nikal sakti hain"?',
    options: [
      {
        id: 'q6-a',
        text: '"Is data ko clean karke correlations aur statistical trends visually summarize karein"',
        description: 'Exploratory data analysis, distributions, and storytelling',
        weights: { data_science: 4, ai_ml: 2 },
      },
      {
        id: 'q6-b',
        text: '"Is data ko efficiently stream, partition, transform aur store karne ka pipeline kaise banayein?"',
        description: 'High throughput ETL pipelines, schema design, and distributed processing',
        weights: { data_engineering: 4, backend_systems: 2, cloud_devops: 1 },
      },
      {
        id: 'q6-c',
        text: '"Kya isme koi suspicious access patterns, failed logins, ya intrusion anomalies hain?"',
        description: 'Threat hunting, log forensics, and SIEM security analysis',
        weights: { cybersecurity: 4, cloud_devops: 1 },
      },
      {
        id: 'q6-d',
        text: '"Is data se real-time user-facing features (search, filtering, dashboard) kaise feed karein?"',
        description: 'Powering product features with fast query indexing and APIs',
        weights: { full_stack: 2, product_tech: 2, mobile_dev: 1 },
      },
    ],
  },
  {
    id: 7,
    questionText: 'Aapko kaisa feedback loop sabse zyada motivate karta hai?',
    bhaiHint: 'Bhai: Aapko turant result dekhkar maza aata hai ya deep investigation ke baad?',
    options: [
      {
        id: 'q7-a',
        text: 'Instant visual feedback — code likha, save kiya, aur browser/phone screen par turant dikh gaya',
        description: 'Fast tight iterative UI development loops',
        weights: { full_stack: 3, mobile_dev: 3, product_tech: 2 },
      },
      {
        id: 'q7-b',
        text: 'Metric improvement — "Validation accuracy 82% se 91% ho gayi after feature engineering"',
        description: 'Measurable metric optimization and benchmark chasing',
        weights: { ai_ml: 4, data_science: 3 },
      },
      {
        id: 'q7-c',
        text: 'Defense success — "Unauthorized attempt blocked / CTF flag captured after hours of inspection"',
        description: 'Solving complex security puzzles and reinforcing defensive perimeters',
        weights: { cybersecurity: 4, backend_systems: 1 },
      },
      {
        id: 'q7-d',
        text: 'Green pipeline — "Automated build, test, and production deployment succeeded with zero downtime"',
        description: 'Reliability engineering, zero human error, and automated infrastructure',
        weights: { cloud_devops: 4, backend_systems: 2 },
      },
    ],
  },
  {
    id: 8,
    questionText: 'Paper padhne aur theoretical computer science concepts mein aapka interest kaisa hai?',
    bhaiHint: 'Bhai: Academic research aur algorithmic depth sabke liye nahi hota, par jinke liye hota hai unke liye superpower hai.',
    options: [
      {
        id: 'q8-a',
        text: 'Mujhe academic papers (ArXiv), new architectures, aur theoretical bounds padhna pasand hai',
        description: 'Reading latest machine learning or algorithm literature',
        weights: { applied_research: 4, ai_ml: 3 },
      },
      {
        id: 'q8-b',
        text: 'Mujhe CVE security advisories, vulnerability disclosures, aur RFC protocol specs padhna pasand hai',
        description: 'Dissecting exploit writeups and networking specifications',
        weights: { cybersecurity: 4, backend_systems: 2 },
      },
      {
        id: 'q8-c',
        text: 'Mujhe system architecture case studies (Netflix, Uber tech blogs, System Design) padhna pasand hai',
        description: 'Learning how massive production systems handle scaling challenges',
        weights: { backend_systems: 3, cloud_devops: 3, data_engineering: 2 },
      },
      {
        id: 'q8-d',
        text: 'Theory theek hai, par mujhe directly hands-on coding aur building mein zyada interest hai',
        description: 'Action-oriented developer learning by doing',
        weights: { full_stack: 3, mobile_dev: 3, product_tech: 2 },
      },
    ],
  },
  {
    id: 9,
    questionText: 'Operating systems aur Linux command line tools use karne mein aapka experience kaisa lagta hai?',
    bhaiHint: 'Bhai: Terminal se darr lagta hai ya terminal mein superpower feel hoti hai?',
    options: [
      {
        id: 'q9-a',
        text: 'Terminal mera natural home hai — bash scripting, grep, curl, ssh, permissions mujhe natural lagte hain',
        description: 'Comfortable with CLI, daemon processes, and shell pipelines',
        weights: { cloud_devops: 3, cybersecurity: 3, backend_systems: 2 },
      },
      {
        id: 'q9-b',
        text: 'Terminal zaroorat ke hisaab se use karta hoon, par VS Code aur modern IDEs prefer karta hoon',
        description: 'Using CLI for git and package management while relying on modern editor tooling',
        weights: { full_stack: 2, mobile_dev: 2, data_science: 2 },
      },
      {
        id: 'q9-c',
        text: 'Python environments, Conda, Jupyter notebooks, aur GPU drivers configure karne mein interested hoon',
        description: 'Managing scientific computation environments and accelerated hardware',
        weights: { ai_ml: 3, data_science: 2 },
      },
      {
        id: 'q9-d',
        text: 'System calls, process isolation, memory buffers, aur kernel privilege rings mein interest hai',
        description: 'Low level OS mechanisms and security primitives',
        weights: { cybersecurity: 3, backend_systems: 3, applied_research: 1 },
      },
    ],
  },
  {
    id: 10,
    questionText: 'Agar aapko kisi tech team mein lead role chunna ho, kis area mein sabse zyada impact generate karna chahenge?',
    bhaiHint: 'Bhai: Socho 3 saal baad aap kis title ke sath sabse proud aur confident feel karenge.',
    options: [
      {
        id: 'q10-a',
        text: 'AI Solutions Architect — Company ke core products mein cutting-edge AI integrate karna',
        description: 'Driving product intelligence and autonomous systems',
        weights: { ai_ml: 4, data_science: 2 },
      },
      {
        id: 'q10-b',
        text: 'Security Lead / Ethical Hacker — Product aur user data ko cyber attacks se protect karna',
        description: 'Guarding digital assets and auditing security postures',
        weights: { cybersecurity: 4, cloud_devops: 1 },
      },
      {
        id: 'q10-c',
        text: 'Staff Software Engineer — Scalable web applications aur robust services build karna',
        description: 'Building end-to-end user-facing products with great architecture',
        weights: { full_stack: 3, backend_systems: 3 },
      },
      {
        id: 'q10-d',
        text: 'Principal DevOps / Cloud Architect — 99.99% uptime aur automated global deployment ensure karna',
        description: 'Managing resilient infrastructure, cloud budgets, and continuous delivery',
        weights: { cloud_devops: 4, backend_systems: 2 },
      },
    ],
  },
  {
    id: 11,
    questionText: 'Aapko mobile devices aur smartphones ke ecosystem mein software build karne ka kitna craze hai?',
    bhaiHint: 'Bhai: Mobile phone sabke paas hai. Kya aapko lagta hai ki aapka app logon ke phone mein install hona chahiye?',
    options: [
      {
        id: 'q11-a',
        text: 'Bahut zyada! Pocket devices ke liye fast, smooth gestures aur camera/sensor apps build karna chahta hoon',
        description: 'High affinity for mobile touch interfaces and native platform capabilities',
        weights: { mobile_dev: 4, full_stack: 1 },
      },
      {
        id: 'q11-b',
        text: 'Main responsive web apps prefer karta hoon jo browser mein phone aur laptop dono pe chal jayein',
        description: 'Cross-platform web reach over app store gatekeepers',
        weights: { full_stack: 3, product_tech: 2 },
      },
      {
        id: 'q11-c',
        text: 'Mobile interfaces zaroori hain, par mera primary interest server-side logic aur models mein hai',
        description: 'Client device is secondary to the intelligence and backend services',
        weights: { backend_systems: 2, ai_ml: 2, cloud_devops: 2 },
      },
      {
        id: 'q11-d',
        text: 'Mobile security aur reverse engineering (APK inspection, traffic interception) mein interest hai',
        description: 'Mobile penetration testing and API vulnerability assessment',
        weights: { cybersecurity: 3, mobile_dev: 1 },
      },
    ],
  },
  {
    id: 12,
    questionText: 'Agar system production mein down ho jaye ya incident create ho, aapka reaction kya hoga?',
    bhaiHint: 'Bhai: High pressure situation mein calm reh kar logs aur facts analyze karna ek core engineering skill hai.',
    options: [
      {
        id: 'q12-a',
        text: 'Turant server logs, Grafana metrics, aur container status check karke rollback ya scale out karna',
        description: 'Systematic infrastructure triage and rapid incident remediation',
        weights: { cloud_devops: 4, backend_systems: 2 },
      },
      {
        id: 'q12-b',
        text: 'Check karna ki kya yeh DDoS attack, brute force, ya unauthorized injection attempt toh nahi hai',
        description: 'Threat triage, firewall rule deployment, and traffic mitigation',
        weights: { cybersecurity: 4, cloud_devops: 1 },
      },
      {
        id: 'q12-c',
        text: 'Recent frontend/backend code release ke git diff ko dekh kar bug identify aur hotfix karna',
        description: 'Root cause isolation in application logic and rapid patch deployment',
        weights: { full_stack: 3, backend_systems: 2 },
      },
      {
        id: 'q12-d',
        text: 'Users ke impact aur business revenue loss ko assess karke clear incident communication lead karna',
        description: 'User empathy, stakeholder communication, and post-mortem facilitation',
        weights: { product_tech: 4, full_stack: 1 },
      },
    ],
  },
  {
    id: 13,
    questionText: 'Free time mein computer pe coding ke alawa kis type ka tech content aap binge-watch ya read karte hain?',
    bhaiHint: 'Bhai: Jo cheez aap bina kisi college assignment ke dekhte ho, wahi asli curiosity hoti hai.',
    options: [
      {
        id: 'q13-a',
        text: 'New AI tools, LLM benchmarks, neural network papers, aur machine learning experiments',
        description: 'Following research advancements and emerging generative capabilities',
        weights: { ai_ml: 4, data_science: 2, applied_research: 2 },
      },
      {
        id: 'q13-b',
        text: 'Cyber heists, dark web investigations, CTF walk-throughs, aur zero-day vulnerability breakdowns',
        description: 'Fascinated by real-world security stories and defensive maneuvers',
        weights: { cybersecurity: 4, backend_systems: 1 },
      },
      {
        id: 'q13-c',
        text: 'Startups kaise build hoti hain, product design, clean code architecture, aur indie hacking',
        description: 'Full product craft from idea to deployment to user feedback',
        weights: { full_stack: 3, product_tech: 3, mobile_dev: 1 },
      },
      {
        id: 'q13-d',
        text: 'Datacenter tours, networking submarine cables, cloud outages analysis, aur system architecture',
        description: 'Massive engineering scale and infrastructure hardware',
        weights: { cloud_devops: 3, backend_systems: 3, data_engineering: 2 },
      },
    ],
  },
  {
    id: 14,
    questionText: 'Aapka dream college/career milestone project kaisa dikhta hai?',
    bhaiHint: 'Bhai: Akhiri question hai! Dil se socho — portfolio mein kaunsa project proudly present karna chahoge?',
    options: [
      {
        id: 'q14-a',
        text: 'Ek custom AI application jo real data pe train hokar complex reasoning ya audio/visual generation kare',
        description: 'An intelligent AI product demonstrating model training and fine-tuning',
        weights: { ai_ml: 4, data_science: 2, applied_research: 2 },
      },
      {
        id: 'q14-b',
        text: 'Ek security auditing tool ya vulnerable-by-design CTF lab jo security loopholes demonstrate kare',
        description: 'A cybersecurity tool or published security vulnerability finding',
        weights: { cybersecurity: 4, backend_systems: 2 },
      },
      {
        id: 'q14-c',
        text: 'Ek complete SaaS web platform jo real users use kar rahe hon with auth, payments, aur real-time features',
        description: 'A production-ready full-stack software application with active users',
        weights: { full_stack: 4, product_tech: 2, mobile_dev: 1 },
      },
      {
        id: 'q14-d',
        text: 'Ek distributed fault-tolerant key-value store ya zero-downtime microservice mesh with metrics',
        description: 'A deep systems engineering triumph solving concurrency and high availability',
        weights: { backend_systems: 4, cloud_devops: 3, data_engineering: 2 },
      },
    ],
  },
];

export function computeInterestSignals(answers: Record<number, string>): InterestSignal[] {
  // Aggregate scores across all 10 tracks
  const scores: Record<CareerTrackId, number> = {
    ai_ml: 0,
    data_science: 0,
    full_stack: 0,
    cybersecurity: 0,
    cloud_devops: 0,
    data_engineering: 0,
    backend_systems: 0,
    product_tech: 0,
    applied_research: 0,
    mobile_dev: 0,
  };

  compassQuestions.forEach(q => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const option = q.options.find(o => o.id === selectedOptionId);
      if (option) {
        Object.entries(option.weights).forEach(([track, weight]) => {
          scores[track as CareerTrackId] = (scores[track as CareerTrackId] || 0) + (weight || 0);
        });
      }
    }
  });

  const maxPossibleScore = 28; // theoretical max for any single track across questions

  const trackIds = Object.keys(scores) as CareerTrackId[];

  // Sort descending by score
  trackIds.sort((a, b) => scores[b] - scores[a]);

  const topScore = scores[trackIds[0]] || 1;

  return trackIds.map((trackId) => {
    const score = scores[trackId];
    const info = careerTracksInfo[trackId];
    const percentage = Math.min(100, Math.round((score / topScore) * 100));

    let strength: 'strong' | 'moderate' | 'developing' = 'developing';
    if (percentage >= 75 && score >= 12) strength = 'strong';
    else if (percentage >= 50 && score >= 7) strength = 'moderate';

    // Build editorial "Why this appeared" rationale
    const whyThisAppeared: string[] = [];
    const observedPreferences: string[] = [];

    if (trackId === 'ai_ml') {
      whyThisAppeared.push('You consistently gravitated toward pattern recognition, predictive modeling, and mathematical intuition.');
      observedPreferences.push('Interest in optimizing evaluation metrics and testing hypotheses on datasets.');
    } else if (trackId === 'cybersecurity') {
      whyThisAppeared.push('You naturally view systems through a defensive lens: looking for vulnerabilities, protocol security, and permission perimeters.');
      observedPreferences.push('Enjoyment of network inspection, cryptography fundamentals, and CTF puzzle-solving.');
    } else if (trackId === 'full_stack') {
      whyThisAppeared.push('You showed strong enthusiasm for building complete end-to-end products where code directly translates into tangible user experiences.');
      observedPreferences.push('High value on fast iteration, UI responsiveness, and connecting clients to databases.');
    } else if (trackId === 'cloud_devops') {
      whyThisAppeared.push('Your choices reflected an appreciation for automation, high-availability architecture, and terminal infrastructure.');
      observedPreferences.push('Focus on automated pipelines, deployment safety, and reliable operations under pressure.');
    } else if (trackId === 'backend_systems') {
      whyThisAppeared.push('You value deep systems efficiency, concurrency, and architectural plumbing that stays robust under high load.');
      observedPreferences.push('Interest in indexing, database design, and high-throughput server APIs.');
    } else if (trackId === 'data_science') {
      whyThisAppeared.push('You indicated genuine interest in extracting evidence, statistical distributions, and exploratory analytics.');
      observedPreferences.push('Curiosity about business metrics and finding truth in noisy data.');
    } else if (trackId === 'data_engineering') {
      whyThisAppeared.push('You appreciate the foundational data superhighways — pipelines, ETL schemas, and storage engines.');
      observedPreferences.push('Building structured data flows for analytics and machine learning systems.');
    } else if (trackId === 'product_tech') {
      whyThisAppeared.push('You demonstrated strong empathy for users, feature prioritization, and business impact over raw code alone.');
      observedPreferences.push('Clear desire to understand user problems and architect meaningful solutions.');
    } else if (trackId === 'applied_research') {
      whyThisAppeared.push('You showed interest in formal computer science proofs, literature reading, and algorithmic bounds.');
      observedPreferences.push('Deep respect for theoretical foundations and reproducing academic results.');
    } else if (trackId === 'mobile_dev') {
      whyThisAppeared.push('You showed interest in mobile form-factors, native device touch feedback, and client ergonomics.');
      observedPreferences.push('Creating fluid experiences that live directly in someone’s pocket.');
    }

    return {
      trackId,
      title: info.title,
      strength,
      score,
      percentage,
      whyThisAppeared,
      observedPreferences,
      suggestedFirstStep: info.suggestedFirstStep,
    };
  });
}
