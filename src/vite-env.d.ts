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
    // Coding Lab
    checkLanguage?: (languageOrCmd: string | string[]) => Promise<{ installed: boolean; version: string | null; error?: string } | null>;
    executeCode?: (params: {
      code: string;
      language: string;
      stdin?: string;
      timeoutMs?: number;
    }) => Promise<{
      status: string;
      stdout: string;
      stderr: string;
      exitCode: number | null;
      executionTimeMs: number;
      compilationError?: string;
    }>;
    killProcess?: () => Promise<boolean>;
  };
}
