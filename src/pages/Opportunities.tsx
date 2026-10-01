import React, { useState, useMemo } from 'react';
import {
  Trophy, Calendar, Clock, ExternalLink, MapPin, Filter,
  ChevronRight, Briefcase, Code2, Sparkles, Shield, Star,
  AlertTriangle, Search
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Opportunity, OpportunityType } from '../types';
import OpportunityPrepModal from '../components/opportunities/OpportunityPrepModal';

const typeLabels: Record<OpportunityType, string> = {
  contest: 'Contest', hackathon: 'Hackathon', ml_competition: 'ML Competition',
  internship: 'Internship', program: 'Program', challenge: 'Challenge',
};

const typeColors: Record<OpportunityType, { bg: string; text: string; icon: React.ReactNode }> = {
  contest: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', icon: <Code2 size={16} /> },
  hackathon: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', icon: <Trophy size={16} /> },
  ml_competition: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', icon: <Sparkles size={16} /> },
  internship: { bg: 'bg-accent-green/10', text: 'text-accent-green', icon: <Briefcase size={16} /> },
  program: { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow', icon: <Star size={16} /> },
  challenge: { bg: 'bg-accent-red/10', text: 'text-accent-red', icon: <Shield size={16} /> },
};

export default function OpportunitiesPage() {
  const { opportunities, setCurrentPage, setBhaiTeachingConcept } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [prepModalOpp, setPrepModalOpp] = useState<Opportunity | null>(null);
  const [showPrepMap, setShowPrepMap] = useState(false);

  const now = new Date();

  const filtered = useMemo(() => {
    let result = opportunities;
    if (filter !== 'all') result = result.filter(o => o.type === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.organizer.toLowerCase().includes(q) ||
        o.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [opportunities, filter, search]);

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'contest', label: 'Contests' },
    { key: 'hackathon', label: 'Hackathons' },
    { key: 'internship', label: 'Internships' },
    { key: 'program', label: 'Programs' },
    { key: 'ml_competition', label: 'ML' },
  ];

  return (
    <div className="h-full flex">
      {/* Main List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-xl font-semibold text-text-primary mb-1">Opportunities</h1>
            <p className="text-sm text-text-tertiary">Contests, hackathons, internships, and programs.</p>
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-border-default rounded-lg px-3 py-2">
              <Search size={14} className="text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search opportunities..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
              />
            </div>
          </div>

          <div className="flex gap-1 mb-6 bg-surface-2 rounded-lg p-1 w-fit flex-wrap">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f.key
                    ? 'bg-surface-4 text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-3">
            {filtered.map((opp, i) => {
              const days = daysUntil(opp.deadline);
              const colors = typeColors[opp.type];
              const isSelected = selectedOpp?.id === opp.id;
              
              return (
                <button
                  key={opp.id}
                  onClick={() => { setSelectedOpp(opp); setShowPrepMap(false); }}
                  className={`w-full text-left bg-surface-2 border rounded-xl p-5 transition-all group animate-slide-up ${
                    isSelected ? 'border-accent-blue/40 bg-surface-3' : 'border-border-default hover:border-border-strong hover:bg-surface-3'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 mt-0.5`}>
                      {colors.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-2xs font-semibold uppercase tracking-wider ${colors.text}`}>
                            {opp.organizer}
                          </span>
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors mt-0.5">
                            {opp.title}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold ${
                            days <= 2 ? 'text-accent-red' : days <= 7 ? 'text-accent-yellow' : 'text-text-secondary'
                          }`}>
                            {days > 0 ? `${days}d` : 'Today'}
                          </span>
                          <span className="block text-2xs text-text-tertiary">left</span>
                        </div>
                      </div>

                      <p className="text-xs text-text-tertiary mt-1.5 line-clamp-2">{opp.description}</p>

                      <div className="flex items-center gap-3 mt-3 text-2xs text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {opp.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} text-2xs font-medium`}>
                          {typeLabels[opp.type]}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {opp.skills.slice(0, 4).map((skill, j) => (
                          <span key={j} className="bg-surface-4 text-text-tertiary text-2xs px-2 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                        {opp.skills.length > 4 && (
                          <span className="text-2xs text-text-tertiary">+{opp.skills.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Trophy size={40} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-text-tertiary">No opportunities found matching your search.</p>
            </div>
          )}

          {/* Source Disclaimer */}
          <div className="mt-8 bg-surface-2 border border-border-default rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-accent-yellow shrink-0 mt-0.5" />
            <p className="text-2xs text-text-tertiary">
              Opportunity data is sourced from official platforms. Dates and details are verified at the time shown. 
              Always confirm directly with the organizer before applying.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedOpp && (
        <div className="w-[360px] bg-surface-1 border-l border-border-default overflow-y-auto animate-slide-in-right">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-2xs font-semibold uppercase tracking-wider ${typeColors[selectedOpp.type].text}`}>
                  {typeLabels[selectedOpp.type]}
                </span>
                <button onClick={() => setSelectedOpp(null)} className="text-text-tertiary hover:text-text-secondary text-lg">×</button>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mt-1">{selectedOpp.title}</h2>
              <p className="text-sm text-text-tertiary mt-0.5">{selectedOpp.organizer}</p>
            </div>

            {/* Meta */}
            <div className="space-y-2">
              {[
                { icon: <Calendar size={14} />, label: 'Deadline', value: new Date(selectedOpp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: <MapPin size={14} />, label: 'Location', value: `${selectedOpp.location} · ${selectedOpp.mode}` },
                { icon: <Shield size={14} />, label: 'Eligibility', value: selectedOpp.eligibility },
                { icon: <Star size={14} />, label: 'Prize', value: selectedOpp.prize },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="text-text-tertiary">{item.icon}</span>
                  <div>
                    <span className="text-2xs text-text-tertiary">{item.label}</span>
                    <span className="block text-sm text-text-secondary">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">About</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{selectedOpp.description}</p>
            </div>

            {/* Skills Required */}
            <div>
              <h4 className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedOpp.skills.map((skill, i) => (
                  <span key={i} className="bg-surface-3 text-text-secondary text-xs px-2.5 py-1 rounded-lg border border-border-subtle">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setPrepModalOpp(selectedOpp)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-blue to-accent-cyan hover:opacity-90 text-white font-semibold px-4 py-3 rounded-xl transition-all text-sm shadow-lg shadow-accent-blue/20"
              >
                <Sparkles size={16} />
                Prepare For This (Full Plan)
                <ChevronRight size={14} className="ml-auto" />
              </button>
              
              <a
                href={selectedOpp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default font-medium px-4 py-3 rounded-xl transition-colors text-sm"
              >
                <ExternalLink size={14} />
                Visit Official Page
              </a>
            </div>

            {/* Preparation Map */}
            {showPrepMap && (
              <div className="animate-slide-up">
                <h4 className="text-xs font-semibold text-text-primary mb-3">Preparation Map</h4>
                <div className="space-y-2">
                  {selectedOpp.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-surface-4 flex items-center justify-center text-2xs text-text-tertiary font-medium">
                        {i + 1}
                      </div>
                      <div className="flex-1 bg-surface-3 rounded-lg px-3 py-2">
                        <span className="text-sm text-text-secondary">{skill}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-accent-green" title="Known" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-accent-green/10 rounded-lg p-2">
                    <span className="text-lg font-semibold text-accent-green">{Math.floor(selectedOpp.skills.length * 0.4)}</span>
                    <span className="block text-2xs text-text-tertiary">You Know</span>
                  </div>
                  <div className="bg-accent-yellow/10 rounded-lg p-2">
                    <span className="text-lg font-semibold text-accent-yellow">{Math.ceil(selectedOpp.skills.length * 0.6)}</span>
                    <span className="block text-2xs text-text-tertiary">To Learn</span>
                  </div>
                </div>
              </div>
            )}

            {/* Source Info */}
            <div className="bg-surface-3 rounded-lg p-3 text-2xs text-text-tertiary">
              <div className="flex justify-between">
                <span>Source: {selectedOpp.source}</span>
                <a href={selectedOpp.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                  Verify ↗
                </a>
              </div>
              <div className="mt-1">
                Last verified: {new Date(selectedOpp.lastVerified).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preparation Modal */}
      {prepModalOpp && (
        <OpportunityPrepModal
          opportunity={prepModalOpp}
          onClose={() => setPrepModalOpp(null)}
        />
      )}
    </div>
  );
}
