/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string;
    versions: {
      node: string;
      electron: string;
      chrome: string;
    };
    openExternal: (url: string) => Promise<boolean>;
    fetchLeetCodeStats?: (username: string) => Promise<any>;
  };
}
