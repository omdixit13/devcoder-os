import React, { useState } from 'react';
import {
  Shield, ExternalLink, Terminal, Lock, Globe, Server, CheckCircle2,
  AlertTriangle, BookOpen, Layers, Flame, ArrowUpRight
} from 'lucide-react';
import { cybersecurityCurriculum, type CyberTrackModule } from '../data/cybersecurityData';
import { useAppStore } from '../store/useAppStore';

export default function CybersecurityPage() {
  const { setCurrentPage } = useAppStore();
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const filteredModules = selectedDomain === 'all'
    ? cybersecurityCurriculum
    : cybersecurityCurriculum.filter((m: CyberTrackModule) => m.id === selectedDomain);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono tracking-wider uppercase mb-2">
            <Shield className="w-3.5 h-3.5" />
            Security Engineering & Defense
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Cybersecurity & Practical Labs
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Hands-on learning through verified, authorized educational sandboxes and competitive CTFs. No unauthorized testing.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-graphite/60 border border-border/50 text-xs font-mono text-text-tertiary self-start md:self-auto">
          <Terminal className="w-3.5 h-3.5 text-copper" />
          <span>Strictly Authorized Environments</span>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedDomain === 'all'
              ? 'bg-copper text-black font-semibold'
              : 'bg-carbon text-text-secondary border border-border/40 hover:text-text-primary'
          }`}
        >
          All Domains ({cybersecurityCurriculum.length})
        </button>
        {cybersecurityCurriculum.map((m: CyberTrackModule) => (
          <button
            key={m.id}
            onClick={() => setSelectedDomain(m.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedDomain === m.id
                ? 'bg-copper text-black font-semibold'
                : 'bg-carbon text-text-secondary border border-border/40 hover:text-text-primary'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredModules.map((mod: CyberTrackModule) => (
          <div
            key={mod.id}
            className="p-6 rounded-[10px] bg-carbon border border-border/40 hover:border-border/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-copper/10 text-copper border border-copper/20">
                  {mod.difficulty}
                </span>
                <span className="text-xs font-mono text-text-tertiary">
                  {mod.topics.length} Core Topics
                </span>
              </div>

              <h2 className="text-lg font-semibold text-text-primary mb-2">
                {mod.title}
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                {mod.description}
              </p>

              {/* Topics Covered */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">
                  Syllabus Breakdown:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mod.topics.map((t: string) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-graphite/50 text-text-secondary border border-border/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools & Utilities */}
              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1">
                  Essential Tools:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mod.keyTools.map((tool: string) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-copper border border-copper/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Authorized Lab Integrations */}
            <div className="space-y-2 pt-2 border-t border-border/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">
                Authorized Educational Sandboxes:
              </span>
              {mod.authorizedLabs.map((lab, i) => (
                <div key={i} className="p-3 rounded-[8px] bg-graphite/30 border border-border/30 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      {lab.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {lab.type} • {lab.platform}
                    </span>
                  </div>
                  <a
                    href={lab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-text-primary text-black font-semibold text-[11px] hover:bg-white/90 transition-all shrink-0"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
