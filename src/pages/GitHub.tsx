import React, { useState } from 'react';
import { GitBranch, Star, Code2, FolderGit } from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import ExternalLink from '../components/common/ExternalLink';
import ProfileCard from '../components/common/ProfileCard';
import { useAppStore } from '../store/useAppStore';

const mockRepos = [
  { name: 'bholenath-os', description: 'Personal developer career OS', language: 'TypeScript', stars: 2, updated: '2 hours ago' },
  { name: 'dsa-solutions', description: 'My DSA problem solutions in C++ and Python', language: 'C++', stars: 5, updated: '1 day ago' },
  { name: 'ml-experiments', description: 'Machine learning experiments and notebooks', language: 'Python', stars: 1, updated: '1 week ago' },
  { name: 'portfolio-website', description: 'Personal portfolio built with React', language: 'JavaScript', stars: 3, updated: '2 weeks ago' },
];

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-400',
  'C++': 'bg-pink-400',
  Python: 'bg-yellow-400',
  JavaScript: 'bg-yellow-300',
};

export default function GitHubPage() {
  const { githubProfileUrl, setLoginModalOpen, isProfileConnected, syncedSolutions, addSyncedSolution } = useAppStore();
  const handle = githubProfileUrl ? githubProfileUrl.replace(/https?:\/\/github\.com\/?/i, '').replace(/\/$/, '') : '';
  const [activeTab, setActiveTab] = useState<'repos' | 'sync'>('repos');
  const [newProblem, setNewProblem] = useState('');
  const [newLanguage, setNewLanguage] = useState('C++');
  const [newRepo, setNewRepo] = useState('dsa-solutions');
  const [newCode, setNewCode] = useState('');

  const handleSyncSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.trim() || !newCode.trim()) return;
    addSyncedSolution({
      problem: newProblem.trim(),
      difficulty: 'Medium',
      topic: 'Algorithms',
      language: newLanguage,
      code: newCode.trim(),
      repository: newRepo.trim() || 'dsa-solutions',
      url: `https://github.com/${handle || 'user'}/${newRepo.trim() || 'dsa-solutions'}`
    });
    setNewProblem('');
    setNewCode('');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full min-w-0">
        <div className="animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary mb-1">GitHub</h1>
          <p className="text-xs sm:text-sm text-text-tertiary">Track your repositories, contributions, and developer profile.</p>
        </div>

        {/* Profile Card */}
        <ProfileCard />

        {/* Connection Status */}
        <div className="bg-surface-2 border border-border-default rounded-[10px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 animate-slide-up">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-4 flex items-center justify-center shrink-0">
              <GithubIcon size={22} className="text-text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">
                {handle ? 'GitHub Connected' : 'Connect Your GitHub Profile'}
              </h3>
              <p className="text-2xs text-text-tertiary">
                {handle ? (
                  <>
                    <span className="text-accent-copper font-medium">@{handle}</span> · Active developer link
                  </>
                ) : (
                  'Link your GitHub username to track repos and commits directly.'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {githubProfileUrl ? (
              <>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-full hover:bg-surface-3 text-text-tertiary hover:text-text-secondary text-xs transition-colors"
                >
                  Change Account
                </button>
                <ExternalLink
                  href={githubProfileUrl}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors"
                  tooltipText={`Open https://github.com/${handle}`}
                >
                  Open Profile
                </ExternalLink>
              </>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 rounded-full bg-paper-white text-surface-0 hover:bg-bone text-xs font-semibold transition-all shadow-sm w-full sm:w-auto"
              >
                + Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-text-primary">12</span>
            <span className="block text-2xs text-text-tertiary">Repositories</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-accent-green">247</span>
            <span className="block text-2xs text-text-tertiary">Contributions</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-accent-yellow">11</span>
            <span className="block text-2xs text-text-tertiary">Stars</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-accent-blue">7</span>
            <span className="block text-2xs text-text-tertiary">Day Streak</span>
          </div>
        </div>

        {/* Navigation Tabs between Repositories and Solution Sync */}
        <div className="flex items-center gap-2 border-b border-border-default pb-2">
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'repos'
                ? 'bg-surface-3 text-text-primary border border-border-subtle'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Repositories ({mockRepos.length})
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-surface-3 text-text-primary border border-border-subtle'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <GitBranch size={13} className="text-accent-copper" />
            <span>Solution Sync Log ({syncedSolutions.length})</span>
          </button>
        </div>

        {/* Tab 1: Repositories */}
        {activeTab === 'repos' && (
          <div className="animate-slide-up space-y-2" style={{ animationDelay: '200ms' }}>
            {mockRepos.map((repo, i) => (
              <div key={repo.name} className="bg-surface-2 border border-border-default rounded-[10px] p-4 hover:border-border-strong hover:bg-surface-3 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FolderGit size={14} className="text-accent-copper" />
                      <span className="text-sm font-medium text-text-primary group-hover:text-accent-copper transition-colors">{repo.name}</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{repo.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`} />
                        {repo.language}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={10} />
                        {repo.stars}
                      </span>
                      <span>Updated {repo.updated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: GitHub Solution Sync (Section 14) */}
        {activeTab === 'sync' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sync New Solution Box */}
            <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Sync Real Solved Solution</h3>
                  <p className="text-2xs text-text-tertiary mt-0.5">
                    Save your verified problem solutions into your local commit history and repository archive.
                  </p>
                </div>
                <span className="text-2xs text-accent-copper font-mono">Real Solutions Only</span>
              </div>

              <form onSubmit={handleSyncSolution} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-2xs text-text-secondary mb-1">Problem Title</label>
                    <input
                      type="text"
                      value={newProblem}
                      onChange={e => setNewProblem(e.target.value)}
                      placeholder="e.g. Search in Rotated Sorted Array"
                      className="w-full bg-surface-1 border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs text-text-secondary mb-1">Language</label>
                    <select
                      value={newLanguage}
                      onChange={e => setNewLanguage(e.target.value)}
                      className="w-full bg-surface-1 border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                    >
                      <option value="C++">C++</option>
                      <option value="Python">Python</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Java">Java</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs text-text-secondary mb-1">Target Repository</label>
                    <input
                      type="text"
                      value={newRepo}
                      onChange={e => setNewRepo(e.target.value)}
                      placeholder="e.g. dsa-solutions"
                      className="w-full bg-surface-1 border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs text-text-secondary mb-1">Real Solution Code</label>
                  <textarea
                    rows={4}
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="// Paste your actual tested solution code here..."
                    className="w-full bg-surface-1 border border-border-default rounded-lg p-3 text-xs font-mono text-text-primary focus:outline-none focus:border-border-strong leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xs text-text-tertiary">
                    No fabricated commits. Only store solutions you have actually worked on.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-paper-white hover:bg-bone text-obsidian text-xs font-semibold transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                  >
                    <GitBranch size={13} />
                    <span>Sync & Commit Solution</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Previously Synced Solutions */}
            <div className="space-y-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                Saved Problem Commits ({syncedSolutions.length})
              </h4>
              {syncedSolutions.map(sol => (
                <div key={sol.id} className="p-4 bg-surface-2 border border-border-default rounded-[10px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">{sol.problem}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-3 text-2xs text-accent-copper font-mono">
                        {sol.language}
                      </span>
                      <span className="text-2xs text-text-tertiary">in repo: {sol.repository}</span>
                    </div>
                    <span className="text-2xs text-text-tertiary font-mono">{sol.date}</span>
                  </div>
                  <pre className="p-3 bg-surface-1 rounded-lg border border-border-subtle font-mono text-2xs text-text-secondary overflow-x-auto leading-relaxed">
                    {sol.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
