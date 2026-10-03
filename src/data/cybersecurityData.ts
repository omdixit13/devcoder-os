export interface CyberTrackModule {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  keyTools: string[];
  authorizedLabs: {
    name: string;
    platform: string;
    url: string;
    type: 'Free Sandbox' | 'Hands-on CTF' | 'Academy';
  }[];
}

export const cybersecurityCurriculum: CyberTrackModule[] = [
  {
    id: 'cyber-net',
    title: 'Network Security & Traffic Analysis',
    category: 'Networking',
    description: 'Master TCP/IP architecture, 3-way handshakes, ARP spoofing detection, DNS poisoning defenses, and live packet inspection.',
    difficulty: 'Beginner',
    topics: ['OSI Model vs TCP/IP', 'Packet Sniffing', 'Firewall Rules & iptables', 'TLS Handshake', 'Port Scanning'],
    keyTools: ['Wireshark', 'Nmap', 'tcpdump', 'Suricata'],
    authorizedLabs: [
      { name: 'OverTheWire: Bandit (Levels 0-15)', platform: 'OverTheWire', url: 'https://overthewire.org/wargames/bandit/', type: 'Free Sandbox' },
      { name: 'PicoCTF: Forensics & Network Labs', platform: 'PicoCTF (Carnegie Mellon)', url: 'https://picoctf.org/', type: 'Hands-on CTF' },
    ],
  },
  {
    id: 'cyber-linux',
    title: 'Linux Auditing & Privilege Escalation',
    category: 'Linux',
    description: 'Learn POSIX file permissions, SUID/SGID binaries, cron task hijacking, capability manipulation, and secure kernel configuration.',
    difficulty: 'Intermediate',
    topics: ['File & Directory Permissions', 'SUID/SGID Exploits & Hardening', 'Sudoers Configuration', 'Process Isolation', 'Syscall Auditing'],
    keyTools: ['Bash', 'LinPEAS (Auditing)', 'strace', 'chroot'],
    authorizedLabs: [
      { name: 'OverTheWire: Bandit (Levels 15-34)', platform: 'OverTheWire', url: 'https://overthewire.org/wargames/bandit/', type: 'Free Sandbox' },
      { name: 'TryHackMe: Linux Fundamentals', platform: 'TryHackMe', url: 'https://tryhackme.com/module/linux-fundamentals', type: 'Academy' },
    ],
  },
  {
    id: 'cyber-web',
    title: 'Web Application Security (OWASP Top 10)',
    category: 'Web Security',
    description: 'Identify and remediate SQL Injection, Cross-Site Scripting (XSS), CSRF, Server-Side Request Forgery (SSRF), and Broken Object Level Auth (BOLA).',
    difficulty: 'Intermediate',
    topics: ['SQL Injection (Prepared Statements)', 'Stored & Reflected XSS', 'CSRF Tokens & SameSite Cookies', 'SSRF Defenses', 'IDOR & Broken Access Control'],
    keyTools: ['Burp Suite Community', 'OWASP ZAP', 'Postman', 'SQLMap (Audit)'],
    authorizedLabs: [
      { name: 'PortSwigger Web Security Academy', platform: 'PortSwigger', url: 'https://portswigger.net/web-security', type: 'Academy' },
      { name: 'OWASP Juice Shop Sandbox', platform: 'OWASP Foundation', url: 'https://owasp.org/www-project-juice-shop/', type: 'Free Sandbox' },
    ],
  },
  {
    id: 'cyber-crypto',
    title: 'Applied Cryptography & Key Management',
    category: 'Security Fundamentals',
    description: 'Understand symmetric ciphers (AES-GCM), asymmetric key exchange (ECDH, RSA), cryptographic hashing (SHA-256), and digital signatures.',
    difficulty: 'Intermediate',
    topics: ['AES-256 Symmetric Encryption', 'Public Key Infrastructure (PKI)', 'Digital Certificates & X.509', 'HMAC Authentication', 'Post-Quantum Algorithms'],
    keyTools: ['OpenSSL', 'GnuPG', 'CyberChef'],
    authorizedLabs: [
      { name: 'Cryptohack: Learn Modern Cryptography', platform: 'Cryptohack', url: 'https://cryptohack.org/', type: 'Hands-on CTF' },
      { name: 'PicoCTF: Cryptography Category', platform: 'PicoCTF', url: 'https://picoctf.org/', type: 'Hands-on CTF' },
    ],
  },
  {
    id: 'cyber-cloud',
    title: 'Cloud Infrastructure & IAM Security',
    category: 'Cloud Security',
    description: 'Secure cloud environments, least-privilege Identity and Access Management (IAM), S3 bucket policy hardening, container isolation, and Kubernetes RBAC.',
    difficulty: 'Advanced',
    topics: ['IAM Least Privilege', 'S3 & Blob Access Control', 'Container Security & Docker Bench', 'Kubernetes Network Policies', 'Secret Management'],
    keyTools: ['Trivy', 'ScoutSuite', 'AWS IAM Policy Simulator'],
    authorizedLabs: [
      { name: 'Flaws.cloud: AWS Security Challenges', platform: 'flaws.cloud', url: 'http://flaws.cloud/', type: 'Free Sandbox' },
      { name: 'CloudGoat: Vulnerable AWS Deployment', platform: 'Rhino Security Labs', url: 'https://github.com/RhinoSecurityLabs/cloudgoat', type: 'Free Sandbox' },
    ],
  },
  {
    id: 'cyber-ops',
    title: 'Security Operations (SOC) & Threat Intelligence',
    category: 'Security Operations',
    description: 'Monitor event logs, investigate security alerts, analyze Indicators of Compromise (IoCs), and trace attack lifecycles with MITRE ATT&CK.',
    difficulty: 'Advanced',
    topics: ['SIEM Architecture', 'MITRE ATT&CK Framework', 'Log Correlation', 'Incident Response Playbooks', 'Threat Feeds (STIX/TAXII)'],
    keyTools: ['Splunk Free', 'Elastic Security', 'VirusTotal', 'AlienVault OTX'],
    authorizedLabs: [
      { name: 'LetsDefend: Blue Team SOC Simulator', platform: 'LetsDefend', url: 'https://letsdefend.io/', type: 'Academy' },
      { name: 'CyberDefenders: Incident Response Labs', platform: 'CyberDefenders', url: 'https://cyberdefenders.org/', type: 'Hands-on CTF' },
    ],
  },
];
