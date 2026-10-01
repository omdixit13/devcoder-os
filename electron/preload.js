const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  fetchLeetCodeStats: (username) => ipcRenderer.invoke('fetch-leetcode-stats', username),
});
