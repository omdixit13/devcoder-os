import React, { useState } from 'react';
import {
  Briefcase, Plus, ChevronRight, Calendar, MapPin,
  Trash2, ArrowRight, Search
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ApplicationStatus, InternshipApplication } from '../types';
import ProfileCard from '../components/common/ProfileCard';
import ExternalLink from '../components/common/ExternalLink';

const statusSteps: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'saved', label: 'Saved', color: 'text-text-tertiary' },
  { key: 'preparing', label: 'Preparing', color: 'text-accent-yellow' },
  { key: 'applied', label: 'Applied', color: 'text-accent-blue' },
  { key: 'assessment', label: 'Assessment', color: 'text-accent-cyan' },
  { key: 'interview', label: 'Interview', color: 'text-accent-purple' },
  { key: 'completed', label: 'Completed', color: 'text-accent-green' },
];

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? applications.filter(a => a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    : applications;

  const getStatusIndex = (status: ApplicationStatus) => statusSteps.findIndex(s => s.key === status);
  
  const advanceStatus = (app: InternshipApplication) => {
    const currentIndex = getStatusIndex(app.status);
    if (currentIndex < statusSteps.length - 1 && app.status !== 'rejected') {
      updateApplicationStatus(app.id, statusSteps[currentIndex + 1].key);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="text-xl font-semibold text-text-primary mb-1">Applications</h1>
            <p className="text-xs sm:text-sm text-text-tertiary">Track your internship and job applications pipeline.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1.5 bg-paper-white hover:bg-white/90 text-obsidian px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-sm w-full sm:w-auto shrink-0"
          >
            <Plus size={14} /> <span>Add Application</span>
          </button>
        </div>

        {/* Profile Card */}
        <ProfileCard />

        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-2 border border-border-default rounded-lg px-3 py-2">
          <Search size={14} className="text-text-tertiary shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0" />
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {statusSteps.map(step => {
            const count = applications.filter(a => a.status === step.key).length;
            return (
              <div key={step.key} className="bg-surface-2 border border-border-default rounded-lg p-2 text-center">
                <span className={`text-lg font-semibold ${step.color}`}>{count}</span>
                <span className="block text-2xs text-text-tertiary">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Application Cards */}
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const statusIndex = getStatusIndex(app.status);
            const statusInfo = statusSteps[statusIndex];
            
            return (
              <div key={app.id} className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{app.company}</h3>
                    <p className="text-xs text-text-tertiary mt-0.5">{app.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xs font-semibold px-2.5 py-1 rounded-full ${
                      app.status === 'completed' ? 'bg-accent-green/10 text-accent-green' :
                      app.status === 'rejected' ? 'bg-accent-red/10 text-accent-red' :
                      'bg-surface-4 ' + statusInfo.color
                    }`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="flex items-center gap-1 mb-4">
                  {statusSteps.map((step, si) => (
                    <React.Fragment key={step.key}>
                      <div className={`h-1.5 flex-1 rounded-full ${
                        si <= statusIndex ? (app.status === 'rejected' ? 'bg-accent-red' : 'bg-accent-blue') : 'bg-surface-4'
                      }`} />
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-2xs text-text-tertiary mb-3">
                  <span className="flex items-center gap-1"><MapPin size={10} />{app.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />Deadline: {new Date(app.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {app.skills.map((skill, j) => (
                    <span key={j} className="bg-surface-4 text-text-tertiary text-2xs px-2 py-0.5 rounded-md">{skill}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {app.status !== 'completed' && app.status !== 'rejected' && (
                    <button
                      onClick={() => advanceStatus(app)}
                      className="flex items-center gap-1 text-2xs text-accent-blue hover:text-blue-400 bg-accent-blue/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      Advance <ArrowRight size={10} />
                    </button>
                  )}
                  {app.url && (
                    <ExternalLink
                      href={app.url}
                      className="text-2xs text-text-tertiary hover:text-text-primary px-3 py-1.5 rounded-full bg-surface-4 transition-colors"
                      tooltipText={`Visit ${app.company} careers portal`}
                    >
                      Visit
                    </ExternalLink>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Briefcase size={40} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">No applications yet. Start tracking your applications!</p>
          </div>
        )}
      </div>
    </div>
  );
}
