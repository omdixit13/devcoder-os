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
