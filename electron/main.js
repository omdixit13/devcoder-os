const { app, BrowserWindow, globalShortcut, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#08080a',
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Open external links in default browser instead of navigating electron webview
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load from Vite dev server or built files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handler to open external URLs reliably
ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      await shell.openExternal(url);
      return true;
    } catch (err) {
      console.error('Failed to open external url:', url, err);
      return false;
    }
  }
  return false;
});

// IPC handler to fetch live LeetCode stats with zero CORS restrictions
ipcMain.handle('fetch-leetcode-stats', async (_event, username) => {
  if (!username) return null;
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                ranking
                reputation
                userAvatar
                realName
              }
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username }
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch LeetCode stats via electron:', err);
    return null;
  }
});

// ===== Coding Lab: Hardened Local Code Execution Engine =====
const { execFile, spawn, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

const MAX_COMPILE_TIME_MS = 15000; // 15s for compilation
const MAX_RUN_TIME_MS = 6000;       // 6s execution limit
const MAX_OUTPUT_SIZE = 1024 * 256; // 256 KB buffer limit

// Server-side strict command allowlist.
// Renderer cannot pass arbitrary shell commands.
const ALLOWED_LANGUAGES = {
  python: {
    extension: '.py',
    compileCmd: null,
    runCmd: ['python', '$FILE'],
    checkCmd: ['python', '--version'],
    memoryArgs: [],
  },
  javascript: {
    extension: '.js',
    compileCmd: null,
    runCmd: ['node', '--max-old-space-size=256', '$FILE'],
    checkCmd: ['node', '--version'],
    memoryArgs: ['--max-old-space-size=256'],
  },
  typescript: {
    extension: '.ts',
    compileCmd: null,
    runCmd: ['npx', 'tsx', '$FILE'],
    checkCmd: ['npx', 'tsx', '--version'],
    memoryArgs: [],
  },
  cpp: {
    extension: '.cpp',
    compileCmd: ['g++', '-O2', '-o', '$OUT', '$FILE'],
    runCmd: ['$OUT'],
    checkCmd: ['g++', '--version'],
    memoryArgs: [],
  },
  c: {
    extension: '.c',
    compileCmd: ['gcc', '-O2', '-o', '$OUT', '$FILE', '-lm'],
    runCmd: ['$OUT'],
    checkCmd: ['gcc', '--version'],
    memoryArgs: [],
  },
  java: {
    extension: '.java',
    compileCmd: ['javac', '$FILE'],
    runCmd: ['java', '-Xmx256m', '-cp', '$DIR', 'Solution'],
    checkCmd: ['java', '--version'],
    memoryArgs: ['-Xmx256m'],
  },
  sql: {
    extension: '.sql',
    compileCmd: null,
    runCmd: ['sqlite3', ':memory:', '-cmd', '.read $FILE'],
    checkCmd: ['sqlite3', '--version'],
    memoryArgs: [],
  },
};

// Stripped environment: zero application secrets or tokens exposed to executed code
function getSanitizedEnv() {
  return {
    PATH: process.env.PATH || '',
    SystemRoot: process.env.SystemRoot || 'C:\\Windows',
    TEMP: os.tmpdir(),
    TMP: os.tmpdir(),
    PYTHONIOENCODING: 'utf-8',
    NODE_ENV: 'production',
  };
}

// Tree-kill helper for Windows and POSIX
function killProcessTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } catch (e) { /* ignore if already exited */ }
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (e) {
      try { process.kill(pid, 'SIGKILL'); } catch (e2) { /* ignore */ }
    }
  }
}

const activeExecutions = new Map();

// IPC: Check if language runtime is available
ipcMain.handle('check-language', async (_event, languageOrCmd) => {
  let checkCmd = null;
  if (typeof languageOrCmd === 'string' && ALLOWED_LANGUAGES[languageOrCmd]) {
    checkCmd = ALLOWED_LANGUAGES[languageOrCmd].checkCmd;
  } else if (Array.isArray(languageOrCmd) && languageOrCmd.length > 0) {
    // Only allow checking known compilers/tools
    const base = path.basename(languageOrCmd[0]).toLowerCase();
    const safeExecutables = ['python', 'python.exe', 'node', 'node.exe', 'gcc', 'gcc.exe', 'g++', 'g++.exe', 'javac', 'javac.exe', 'java', 'java.exe', 'npx', 'sqlite3', 'sqlite3.exe'];
    if (safeExecutables.includes(base) || safeExecutables.includes(base.replace('.cmd', ''))) {
      checkCmd = languageOrCmd;
    }
  }

  if (!checkCmd) return { installed: false, version: null, error: 'Disallowed executable' };

  return new Promise((resolve) => {
    execFile(checkCmd[0], checkCmd.slice(1), { timeout: 4000, env: getSanitizedEnv() }, (error, stdout, stderr) => {
      if (error) {
        resolve({ installed: false, version: null, error: error.message });
      } else {
        const version = (stdout || stderr).toString().trim().split('\n')[0];
        resolve({ installed: true, version });
      }
    });
  });
});

// IPC: Secure Code Execution
ipcMain.handle('execute-code', async (_event, { code, language, stdin = '', timeoutMs = MAX_RUN_TIME_MS }) => {
  const langConfig = ALLOWED_LANGUAGES[language];
  if (!langConfig) {
    return {
      status: 'runtime_error',
      stdout: '',
      stderr: `Security policy: Language '${language}' is not recognized or permitted.`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  if (typeof code !== 'string' || code.length > 500000) {
    return {
      status: 'runtime_error',
      stdout: '',
      stderr: 'Code payload exceeds maximum allowed size (500KB).',
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  // Create isolated temp directory inside OS temp
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devcareer-code-'));
  // If java, use Solution.java
  const filename = language === 'java' ? 'Solution.java' : `solution${langConfig.extension}`;
  const srcFile = path.join(tmpDir, filename);
  const outFile = path.join(tmpDir, process.platform === 'win32' ? 'solution.exe' : 'solution');
  const startTime = Date.now();

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    // 1. Compilation Step (for compiled languages)
    if (langConfig.compileCmd) {
      const compileArgs = langConfig.compileCmd.map(arg =>
        arg.replace('$FILE', srcFile).replace('$OUT', outFile).replace('$DIR', tmpDir)
      );

      const compileResult = await new Promise((resolve) => {
        execFile(compileArgs[0], compileArgs.slice(1), {
          timeout: MAX_COMPILE_TIME_MS,
          cwd: tmpDir,
          maxBuffer: MAX_OUTPUT_SIZE,
          env: getSanitizedEnv(),
        }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        });
      });

      if (compileResult.error) {
        safeCleanup(tmpDir);
        return {
          status: 'compilation_error',
          stdout: compileResult.stdout || '',
          stderr: compileResult.stderr || compileResult.error.message || '',
          exitCode: compileResult.error.code || 1,
          executionTimeMs: Date.now() - startTime,
          compilationError: compileResult.stderr || compileResult.error.message || 'Compilation failed',
        };
      }
    }

    // 2. Execution Step
    const runArgs = langConfig.runCmd.map(arg =>
      arg.replace('$FILE', srcFile).replace('$OUT', outFile).replace('$DIR', tmpDir)
    );

    const effectiveTimeout = Math.min(Math.max(timeoutMs, 1000), 10000);

    const runResult = await new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const proc = spawn(runArgs[0], runArgs.slice(1), {
        cwd: tmpDir,
        timeout: effectiveTimeout,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: getSanitizedEnv(),
        windowsHide: true,
      });

      const execId = `exec-${Date.now()}-${Math.random()}`;
      activeExecutions.set(execId, proc);

      if (stdin && typeof stdin === 'string') {
        try {
          proc.stdin.write(stdin);
          proc.stdin.end();
        } catch (e) { /* ignore */ }
      } else {
        try { proc.stdin.end(); } catch (e) { /* ignore */ }
      }

      proc.stdout.on('data', (chunk) => {
        if (stdout.length < MAX_OUTPUT_SIZE) {
          stdout += chunk.toString();
        }
      });

      proc.stderr.on('data', (chunk) => {
        if (stderr.length < MAX_OUTPUT_SIZE) {
          stderr += chunk.toString();
        }
      });

      const timer = setTimeout(() => {
        timedOut = true;
        if (proc.pid) {
          killProcessTree(proc.pid);
        }
      }, effectiveTimeout);

      proc.on('close', (exitCode) => {
        clearTimeout(timer);
        activeExecutions.delete(execId);
        if (timedOut) {
          resolve({
            status: 'time_limit',
            stdout,
            stderr: `Time Limit Exceeded (${Math.round(effectiveTimeout / 1000)}s limit)`,
            exitCode: null,
          });
        } else if (exitCode !== 0) {
          resolve({
            status: 'runtime_error',
            stdout,
            stderr: stderr.trim() || `Process exited with code ${exitCode}`,
            exitCode,
          });
        } else {
          resolve({
            status: 'passed',
            stdout,
            stderr,
            exitCode: 0,
          });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        activeExecutions.delete(execId);
        resolve({
          status: 'runtime_error',
          stdout: '',
          stderr: err.message,
          exitCode: 1,
        });
      });
    });

    safeCleanup(tmpDir);
    return {
      ...runResult,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    safeCleanup(tmpDir);
    return {
      status: 'runtime_error',
      stdout: '',
      stderr: err.message || 'Execution error',
      exitCode: 1,
      executionTimeMs: Date.now() - startTime,
    };
  }
});

// IPC: Stop all running user processes
ipcMain.handle('kill-process', async () => {
  for (const [id, proc] of activeExecutions) {
    if (proc.pid) {
      killProcessTree(proc.pid);
    }
    activeExecutions.delete(id);
  }
  return true;
});

function safeCleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    // Windows file locking retry after 400ms
    setTimeout(() => {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e2) { /* ignore */ }
    }, 400);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
