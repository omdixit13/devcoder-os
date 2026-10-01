import React, { useState } from 'react';
import {
  X, Sparkles, CheckCircle2, Circle, Clock, Calendar, MapPin,
  ExternalLink, Trophy, Shield, Star, BookOpen, Video, Globe,
  Dumbbell, ArrowRight, Check, AlertCircle, ChevronRight, MessageSquare
} from 'lucide-react';
import type { Opportunity, OpportunityPrepConcept, OpportunityPrepProblem } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  opportunity: Opportunity;
  onClose: () => void;
}

type TabType = 'requirements' | 'skills' | 'concepts' | 'resources' | 'practice' | 'roadmap';

export default function OpportunityPrepModal({ opportunity, onClose }: Props) {
  const { setCurrentPage, setBhaiTeachingConcept, addBhaiMessage, applications, addApplication } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('requirements');

  // Track user interactive progress in this session
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>(() => {
    // default half skills checked as recognized
    const init: Record<string, boolean> = {};
    opportunity.skills.forEach((s, i) => {
      init[s] = i % 2 === 0;
    });
    return init;
  });

  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>({});
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>({});

  const prep = opportunity.prepPlan;

  // Check if already tracked in applications
  const isTracked = applications.some(a => 
    a.company.toLowerCase() === opportunity.organizer.toLowerCase() ||
    a.role.toLowerCase().includes(opportunity.title.toLowerCase())
  );

  const [trackedStatus, setTrackedStatus] = useState<boolean>(isTracked);

  const toggleSkill = (skill: string) => {
    setCheckedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };

  const toggleProblem = (id: string) => {
    setSolvedProblems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGoal = (goalKey: string) => {
    setCompletedGoals(prev => ({ ...prev, [goalKey]: !prev[goalKey] }));
  };

  // Calculate readiness score
  const totalSkills = opportunity.skills.length;
  const skillsDone = Object.values(checkedSkills).filter(Boolean).length;
  
  const totalProblems = prep?.practiceProblems?.length || 1;
  const problemsDone = Object.values(solvedProblems).filter(Boolean).length;

  const totalGoals = prep?.roadmapPhases?.reduce((acc, p) => acc + p.goals.length, 0) || 1;
  const goalsDone = Object.values(completedGoals).filter(Boolean).length;

  const readinessScore = Math.min(
    100,
    Math.round(
      (skillsDone / (totalSkills || 1)) * 35 +
      (problemsDone / totalProblems) * 35 +
      (goalsDone / totalGoals) * 30
    )
  );

  const handleTrackInApplications = () => {
    if (trackedStatus) return;
    addApplication({
      id: `app-${Date.now()}`,
      company: opportunity.organizer,
      role: opportunity.title,
      location: opportunity.location,
      eligibility: opportunity.eligibility,
      deadline: opportunity.deadline,
      skills: opportunity.skills,
      status: 'preparing',
      notes: `Targeting deadline: ${opportunity.deadline}. Mode: ${opportunity.mode}. Prize: ${opportunity.prize}`,
      url: opportunity.url,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setTrackedStatus(true);
  };

  const handleAskBhaiConcept = (concept: OpportunityPrepConcept) => {
    const prompt = concept.bhaiPrompt || `Bhai, teach me ${concept.name} for my preparation for ${opportunity.title}`;
    addBhaiMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      type: 'text',
    });
    setBhaiTeachingConcept(concept.id);
    setCurrentPage('bhai');
    onClose();
  };

  const handleAskBhaiGeneral = () => {
    const prompt = `Bhai, I want to prepare for ${opportunity.title} by ${opportunity.organizer}. Deadline is ${new Date(opportunity.deadline).toLocaleDateString('en-IN')}. Please give me a strategic roadmap and your best tips to stand out!`;
    addBhaiMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      type: 'text',
    });
    setCurrentPage('bhai');
    onClose();
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'requirements', label: 'Requirements & Format', icon: <Shield size={14} /> },
    { id: 'skills', label: 'Skills & Stack', icon: <Star size={14} /> },
    { id: 'concepts', label: 'Key Concepts & Notes', icon: <BookOpen size={14} /> },
    { id: 'resources', label: 'Verified Videos & Docs', icon: <Video size={14} /> },
    { id: 'practice', label: 'Target Practice', icon: <Dumbbell size={14} /> },
    { id: 'roadmap', label: 'Preparation Roadmap', icon: <Clock size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] bg-surface-1 border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-border-default bg-surface-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 border border-accent-blue/20 flex items-center justify-center text-accent-blue shrink-0">
              <Trophy size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold uppercase tracking-wider text-accent-blue">
                  {opportunity.organizer}
                </span>
                <span className="text-2xs text-text-tertiary">·</span>
                <span className="text-2xs text-text-tertiary capitalize">
                  {opportunity.type.replace('_', ' ')}
                </span>
                <span className="text-2xs text-text-tertiary">·</span>
                <span className="text-2xs text-text-tertiary">
                  Verified: {new Date(opportunity.lastVerified).toLocaleDateString('en-IN')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-text-primary truncate">
                Prepare for: {opportunity.title}
              </h2>
            </div>
          </div>

          {/* Right Header: Readiness & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Readiness Meter */}
            <div className="bg-surface-3 border border-border-subtle rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xs text-text-tertiary font-medium">Readiness</div>
                <div className="text-sm font-bold text-accent-cyan">{readinessScore}%</div>
              </div>
              <div className="w-10 h-2 bg-surface-4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan transition-all duration-300"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>

            {/* Track in Applications */}
            <button
              onClick={handleTrackInApplications}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                trackedStatus
                  ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                  : 'bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default'
              }`}
            >
              {trackedStatus ? <Check size={14} /> : <Calendar size={14} />}
              {trackedStatus ? 'Tracking in Apps' : 'Track in Applications'}
            </button>

            {/* Ask Bhai */}
            <button
              onClick={handleAskBhaiGeneral}
              className="flex items-center gap-1.5 bg-accent-purple/15 hover:bg-accent-purple/25 text-accent-purple border border-accent-purple/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Sparkles size={14} />
              Ask Bhai
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-border-default bg-surface-1 flex items-center gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-0">
          
          {/* TAB 1: REQUIREMENTS & FORMAT */}
          {activeTab === 'requirements' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-surface-2 border border-border-default rounded-xl p-4">
                  <div className="flex items-center gap-2 text-text-tertiary text-2xs uppercase tracking-wider mb-1">
                    <Calendar size={12} /> Deadline
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    {new Date(opportunity.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-2xs text-accent-yellow mt-0.5 font-medium">
                    {Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                </div>

                <div className="bg-surface-2 border border-border-default rounded-xl p-4">
                  <div className="flex items-center gap-2 text-text-tertiary text-2xs uppercase tracking-wider mb-1">
                    <MapPin size={12} /> Format & Mode
                  </div>
                  <div className="text-sm font-semibold text-text-primary capitalize">
                    {opportunity.location} ({opportunity.mode})
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">Verified official venue</div>
                </div>

                <div className="bg-surface-2 border border-border-default rounded-xl p-4">
                  <div className="flex items-center gap-2 text-text-tertiary text-2xs uppercase tracking-wider mb-1">
                    <Shield size={12} /> Eligibility
                  </div>
                  <div className="text-sm font-semibold text-text-primary truncate">
                    {opportunity.eligibility}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">Pre-verified criteria</div>
                </div>

                <div className="bg-surface-2 border border-border-default rounded-xl p-4">
                  <div className="flex items-center gap-2 text-text-tertiary text-2xs uppercase tracking-wider mb-1">
                    <Star size={12} /> Reward & Perks
                  </div>
                  <div className="text-sm font-semibold text-accent-green truncate">
                    {opportunity.prize}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">Career acceleration</div>
                </div>
              </div>

              {/* Rounds Breakdown */}
              {prep?.rounds && prep.rounds.length > 0 && (
                <div className="bg-surface-2 border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-accent-blue" />
                    Rounds & Selection Format
                  </h3>
                  <div className="space-y-3">
                    {prep.rounds.map((round, idx) => (
                      <div key={idx} className="bg-surface-3 border border-border-subtle rounded-xl p-4 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface-4 flex items-center justify-center font-bold text-xs text-accent-blue shrink-0">
                          0{idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-text-primary">{round.name}</h4>
                            {round.duration && (
                              <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-4 text-text-tertiary font-medium">
                                {round.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{round.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What Evaluators Look For */}
              <div className="bg-surface-2 border border-border-default rounded-xl p-5">
                <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-yellow" />
                  Bhai's Strategic Advice
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  "Most candidates fail because they start solving without understanding the core evaluation metric. 
                  For {opportunity.organizer}, focus on clean reproducible code, edge case handling, and explaining your thought process clearly."
                </p>
                <div className="flex gap-3">
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open Official Portal
                  </a>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    Review Skills Checklist <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & STACK */}
          {activeTab === 'skills' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-surface-2 border border-border-default rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Required Skills Assessment</h3>
                    <p className="text-xs text-text-tertiary">Check off skills you already know to see your preparation readiness score.</p>
                  </div>
                  <div className="text-xs font-bold text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full">
                    {skillsDone} / {totalSkills} Confirmed
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {opportunity.skills.map((skill) => {
                    const isChecked = !!checkedSkills[skill];
                    return (
                      <div
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-accent-green/10 border-accent-green/30 text-text-primary'
                            : 'bg-surface-3 border-border-subtle text-text-secondary hover:bg-surface-4'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            isChecked ? 'bg-accent-green text-white' : 'border border-text-tertiary'
                          }`}>
                            {isChecked && <Check size={14} />}
                          </div>
                          <div>
                            <span className="text-sm font-semibold">{skill}</span>
                            <span className="block text-2xs text-text-tertiary">
                              {isChecked ? 'Ready & Confirmed' : 'Needs Practice / Revision'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                          isChecked ? 'bg-accent-green/20 text-accent-green' : 'bg-surface-4 text-text-tertiary'
                        }`}>
                          {isChecked ? 'Mastered' : 'To Learn'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary"
                >
                  ← Back to Requirements
                </button>
                <button
                  onClick={() => setActiveTab('concepts')}
                  className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Explore Key Concepts & Notes <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONCEPTS & NOTES */}
          {activeTab === 'concepts' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Curated Conceptual Breakdown</h3>
                  <p className="text-xs text-text-tertiary">High-yield concepts tested in this specific opportunity.</p>
                </div>
              </div>

              {prep?.keyConcepts?.map((concept) => (
                <div key={concept.id} className="bg-surface-2 border border-border-default rounded-xl p-5 hover:border-border-strong transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xs font-semibold uppercase tracking-wider text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10">
                          {concept.category}
                        </span>
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded capitalize ${
                          concept.importance === 'essential'
                            ? 'bg-accent-red/10 text-accent-red'
                            : 'bg-accent-yellow/10 text-accent-yellow'
                        }`}>
                          {concept.importance}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary mt-1">{concept.name}</h4>
                    </div>

                    <button
                      onClick={() => handleAskBhaiConcept(concept)}
                      className="flex items-center gap-1.5 bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple border border-accent-purple/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                    >
                      <Sparkles size={14} />
                      Bhai, Teach Me This
                    </button>
                  </div>

                  <div className="mt-3 bg-surface-3 border border-border-subtle rounded-lg p-3">
                    <div className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Bhai's Study Notes:</div>
                    <p className="text-xs text-text-secondary leading-relaxed">{concept.notes}</p>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary"
                >
                  ← Back to Skills
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  View Verified Videos & Docs <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED VIDEOS & DOCUMENTATION */}
          {activeTab === 'resources' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-text-primary">Verified Study Resources & Documentation</h3>
                <p className="text-xs text-text-tertiary">Direct links to official docs, curated playlists, and architectural guides.</p>
              </div>

              <div className="space-y-3">
                {prep?.resources?.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-2 border border-border-default rounded-xl p-4 flex items-center justify-between hover:border-border-strong hover:bg-surface-3 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        res.type === 'video'
                          ? 'bg-accent-red/15 text-accent-red'
                          : res.type === 'documentation'
                          ? 'bg-accent-blue/15 text-accent-blue'
                          : 'bg-accent-yellow/15 text-accent-yellow'
                      }`}>
                        {res.type === 'video' ? <Video size={18} /> : res.type === 'documentation' ? <Globe size={18} /> : <BookOpen size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                            {res.source}
                          </span>
                          <span className="text-2xs text-text-tertiary">·</span>
                          <span className="text-2xs text-text-tertiary capitalize">
                            {res.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors truncate">
                          {res.title}
                        </h4>
                        <div className="text-2xs text-text-tertiary mt-0.5">
                          Estimated duration: {res.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-accent-blue shrink-0 font-medium">
                      <span>Open Link</span>
                      <ExternalLink size={14} />
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveTab('concepts')}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary"
                >
                  ← Back to Concepts
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Solve Practice Problems <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PRACTICE PROBLEMS */}
          {activeTab === 'practice' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Target Practice Problems</h3>
                  <p className="text-xs text-text-tertiary">Problems tagged to the exact patterns required for {opportunity.title}.</p>
                </div>
                <div className="text-xs font-bold text-accent-green bg-accent-green/10 px-3 py-1 rounded-full">
                  {problemsDone} / {totalProblems} Solved
                </div>
              </div>

              <div className="space-y-3">
                {prep?.practiceProblems?.map((prob) => {
                  const isDone = !!solvedProblems[prob.id];
                  return (
                    <div
                      key={prob.id}
                      className={`bg-surface-2 border rounded-xl p-4 flex items-center justify-between transition-all ${
                        isDone ? 'border-accent-green/40 bg-accent-green/5' : 'border-border-default hover:bg-surface-3'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleProblem(prob.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            isDone ? 'bg-accent-green text-white' : 'border border-text-tertiary hover:border-text-primary'
                          }`}
                        >
                          {isDone && <Check size={14} />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                              {prob.platform}
                            </span>
                            <span className="text-2xs text-text-tertiary">·</span>
                            <span className="text-2xs text-text-tertiary">
                              {prob.topic}
                            </span>
                          </div>
                          <h4 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                            {prob.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded capitalize ${
                          prob.difficulty === 'beginner'
                            ? 'bg-accent-green/10 text-accent-green'
                            : prob.difficulty === 'intermediate'
                            ? 'bg-accent-yellow/10 text-accent-yellow'
                            : 'bg-accent-red/10 text-accent-red'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Solve <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary"
                >
                  ← Back to Resources
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  View Preparation Roadmap <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ROADMAP & TIMELINE */}
          {activeTab === 'roadmap' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Step-by-Step Preparation Roadmap</h3>
                  <p className="text-xs text-text-tertiary">Execute phases in order to peak before the deadline.</p>
                </div>
                <div className="text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full">
                  {goalsDone} / {totalGoals} Milestones Achieved
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-default">
                {prep?.roadmapPhases?.map((phase, pIdx) => (
                  <div key={pIdx} className="relative">
                    {/* Step Indicator */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center text-2xs font-bold text-white ring-4 ring-surface-0">
                      {pIdx + 1}
                    </div>

                    <div className="bg-surface-2 border border-border-default rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-text-primary">{phase.phase}</h4>
                        <span className="text-2xs font-semibold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full">
                          {phase.timeframe}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {phase.goals.map((goal, gIdx) => {
                          const goalKey = `${pIdx}-${gIdx}`;
                          const isDone = !!completedGoals[goalKey];
                          return (
                            <div
                              key={gIdx}
                              onClick={() => toggleGoal(goalKey)}
                              className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${
                                isDone ? 'bg-accent-green/10 border-accent-green/30 text-text-primary' : 'bg-surface-3 border-border-subtle text-text-secondary hover:bg-surface-4'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                isDone ? 'bg-accent-green text-white' : 'border border-text-tertiary'
                              }`}>
                                {isDone && <Check size={12} />}
                              </div>
                              <span className={`text-xs ${isDone ? 'line-through text-text-tertiary font-normal' : 'font-medium'}`}>
                                {goal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Summary Card */}
              <div className="bg-gradient-to-r from-accent-blue/10 via-surface-2 to-accent-cyan/10 border border-accent-blue/20 rounded-xl p-6 flex items-center justify-between gap-6">
                <div>
                  <h4 className="text-base font-bold text-text-primary mb-1">
                    Ready to ace {opportunity.title}?
                  </h4>
                  <p className="text-xs text-text-secondary">
                    You have achieved a readiness score of <strong className="text-accent-cyan">{readinessScore}%</strong>. Keep practicing and check in with Bade Bhai if you get stuck!
                  </p>
                </div>
                <button
                  onClick={handleAskBhaiGeneral}
                  className="bg-accent-blue hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 transition-colors shadow-lg shadow-accent-blue/20"
                >
                  <MessageSquare size={14} />
                  Start Revision with Bhai
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
