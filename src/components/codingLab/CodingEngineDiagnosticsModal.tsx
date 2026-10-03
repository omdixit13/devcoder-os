import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, CheckCircle2, AlertTriangle, XCircle, RefreshCw, X, Clock } from 'lucide-react';
import { getExecutionEngineStatus, type ExecutionDiagnostics } from '../../utils/codeExecutionService';
import { soundManager } from '../../utils/soundManager';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodingEngineDiagnosticsModal({ isOpen, onClose }: DiagnosticsModalProps) {
  const [diagnostics, setDiagnostics] = useState<ExecutionDiagnostics>(getExecutionEngineStatus());

  useEffect(() => {
    if (isOpen) {
      setDiagnostics(getExecutionEngineStatus());
    }
  }, [isOpen]);

  const handleRefresh = () => {
    soundManager.play('click');
    setDiagnostics(getExecutionEngineStatus());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-lg w-full space-y-5 animate-scale-up shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-default font-sans">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-accent-copper" />
            <h3 className="text-sm font-semibold text-text-primary tracking-wide">
              CODING ENGINE STATUS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
              title="Refresh status"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Diagnostic Items Grid */}
        <div className="space-y-3">
          {/* Python Runtime */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-surface-3 border border-border-subtle">
            <span className="text-text-secondary">Python runtime:</span>
            <span className={`px-2 py-0.5 rounded text-2xs font-bold flex items-center gap-1.5 ${
              diagnostics.pythonRuntime === 'READY'
                ? 'bg-accent-green/15 text-accent-green'
                : diagnostics.pythonRuntime === 'FALLBACK'
                ? 'bg-accent-yellow/15 text-accent-yellow'
                : 'bg-accent-red/15 text-accent-red'
            }`}>
              {diagnostics.pythonRuntime === 'READY' && <CheckCircle2 size={12} />}
              {diagnostics.pythonRuntime === 'FALLBACK' && <AlertTriangle size={12} />}
              {diagnostics.pythonRuntime}
            </span>
          </div>

          {/* Web Worker */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-surface-3 border border-border-subtle">
            <span className="text-text-secondary">Worker:</span>
            <span className={`px-2 py-0.5 rounded text-2xs font-bold flex items-center gap-1.5 ${
              diagnostics.workerStatus === 'READY'
                ? 'bg-accent-green/15 text-accent-green'
                : diagnostics.workerStatus === 'INITIALIZING'
                ? 'bg-accent-yellow/15 text-accent-yellow'
                : 'bg-accent-red/15 text-accent-red'
            }`}>
              {diagnostics.workerStatus === 'READY' && <CheckCircle2 size={12} />}
              {diagnostics.workerStatus === 'INITIALIZING' && <RefreshCw size={12} className="animate-spin" />}
              {diagnostics.workerStatus === 'ERROR' && <XCircle size={12} />}
              {diagnostics.workerStatus}
            </span>
          </div>

          {/* Execution Engine */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-surface-3 border border-border-subtle">
            <span className="text-text-secondary">Execution:</span>
            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-accent-green/15 text-accent-green flex items-center gap-1.5">
              <CheckCircle2 size={12} /> READY
            </span>
          </div>

          {/* Environment */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-surface-3 border border-border-subtle">
            <span className="text-text-secondary">Environment:</span>
            <span className="px-2 py-0.5 rounded text-2xs font-semibold text-text-primary bg-surface-4">
              {diagnostics.environment} (Netlify WebAssembly Sandbox)
            </span>
          </div>

          {/* Last Execution Info */}
          <div className="p-3 rounded-[8px] bg-surface-3 border border-border-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Last execution:</span>
              <span className="text-text-quaternary text-3xs font-mono">
                {diagnostics.lastExecution ? new Date(diagnostics.lastExecution.timestamp).toLocaleTimeString() : 'No execution yet'}
              </span>
            </div>
            {diagnostics.lastExecution && (
              <div className="text-3xs text-text-tertiary space-y-0.5 pt-1 border-t border-border-subtle">
                <div>Language: <span className="text-text-primary">{diagnostics.lastExecution.language}</span></div>
                <div>Status: <span className="text-text-primary">{diagnostics.lastExecution.status}</span></div>
                <div>Execution Time: <span className="text-text-primary">{diagnostics.lastExecution.executionTimeMs}ms</span></div>
              </div>
            )}
          </div>

          {/* Last Error */}
          <div className="p-3 rounded-[8px] bg-surface-3 border border-border-subtle space-y-1">
            <span className="text-text-secondary">Last error:</span>
            <div className={`p-2 rounded text-3xs whitespace-pre-wrap break-all ${
              diagnostics.lastExecution?.error
                ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                : 'bg-surface-4 text-text-quaternary italic'
            }`}>
              {diagnostics.lastExecution?.error || 'None (Engine operational)'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end font-sans">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-surface-4 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
