import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronDown, Clock, CheckCircle2,
  Brain, Dumbbell, Sparkles, ArrowLeft, ArrowRight, Zap,
  Play, FileText, Video, Globe, Check, Target, RotateCcw,
  ExternalLink as ExternalLinkIcon, Code2, AlertTriangle, Eye, HelpCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useCodingLabStore } from '../store/useCodingLabStore';
import ExternalLink from '../components/common/ExternalLink';
import type { Problem, Concept } from '../types';
import { soundManager } from '../utils/soundManager';
import TopicVisualizer from '../components/learning/TopicVisualizer';
import { getTopicResource } from '../data/topicResourcesData';

type WorkspaceTab = 'learn' | 'notes' | 'w3schools' | 'videos' | 'practice' | 'recall';

export default function LearningPage() {
  const { skills, concepts, resources, reviews, problems, setCurrentPage, setBhaiTeachingConcept, completeConcept } = useAppStore();
  const { selectedProblem, labView } = useCodingLabStore();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>('binary-search');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>('bs-intro');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('learn');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['theIdea', 'theIntuition']));

  // Active Recall Quiz state
  const [revealedRecall, setRevealedRecall] = useState<Record<number, boolean>>({});

  const [completionResult, setCompletionResult] = useState<{
    conceptName: string;
    skillName: string;
    nextProblem?: Problem;
    suggestedActionText: string;
  } | null>(null);
  
  const now = new Date();
  const dueReviews = reviews.filter(r => new Date(r.nextReview) <= now);
  const learningSkills = skills.filter(s => s.status === 'learning' || s.status === 'comfortable' || s.status === 'mastered');

  const effectiveSkillId = selectedSkillId || 'binary-search';
  const skillConcepts = concepts.filter(c => c.skillId === effectiveSkillId);
  const skillObj = skills.find(s => s.id === effectiveSkillId);

  const selectedConcept: Concept = concepts.find(c => c.id === selectedConceptId && c.skillId === effectiveSkillId) 
    || skillConcepts[0] 
    || concepts.find(c => c.skillId === effectiveSkillId)
    || {
      id: `${effectiveSkillId}-overview`,
      skillId: effectiveSkillId,
      name: skillObj?.name || 'Topic Deep Dive',
      description: skillObj?.description || 'Core engineering principles and patterns',
      theIdea: `Mastering ${skillObj?.name || 'this topic'} provides the fundamental abstractions needed for high-performance software engineering and technical interview readiness.`,
      theIntuition: `Approach ${skillObj?.name || 'this topic'} by understanding the underlying mental model before writing code.`,
      howItWorks: `Understand the core data layouts, study standard runtime trade-offs, and practice with real patterns.`,
      example: `// Core pattern for ${skillObj?.name}\n// Optimized implementation and test cases`,
      commonMistake: 'Overlooking edge cases or failing to evaluate worst-case time and space complexities.',
      whenToUse: `Whenever architecting resilient systems or solving problems in ${skillObj?.category || 'computer science'}.`,
      interviewRelevance: `Consistently tested in engineering interview technical screenings.`,
      status: 'learning',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
    };

  const topicRes = getTopicResource(effectiveSkillId);
  const conceptProblems = problems.filter(p => p.conceptId === selectedConcept?.id || p.topic.includes(effectiveSkillId));

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    setExpandedSections(next);
  };

  const handleComplete = () => {
    if (!selectedConcept) return;
    const result = completeConcept(selectedConcept.id);
    setCompletionResult(result);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Return to Coding Lab Banner (Phase 10) */}
      {selectedProblem && labView === 'problem' && (
        <div className="bg-accent-blue/10 border-b border-accent-blue/20 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 animate-fade-in">
          <div className="flex items-center gap-2 text-2xs text-accent-blue min-w-0">
            <Code2 size={14} className="shrink-0" />
            <span className="truncate">Currently studying concept for: <strong className="text-white">{selectedProblem.title}</strong></span>
          </div>
          <button
            onClick={() => {
              soundManager.play('navigation');
              setCurrentPage('codinglab');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue text-white text-2xs font-semibold hover:bg-accent-blue/90 transition-all shadow-sm shrink-0 w-full sm:w-auto"
          >
            <ArrowLeft size={12} />
            <span>Return to Problem</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Left: Skill/Concept List (Desktop Only) */}
        <div className="hidden md:flex w-[260px] bg-surface-1 border-r border-border-default overflow-y-auto shrink-0 flex-col justify-between">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Learning</h2>
              <span className="text-2xs text-accent-copper font-medium">Topic Workspace</span>
            </div>
          
          {/* Due Reviews Banner */}
          {dueReviews.length > 0 && (
            <div className="w-full mb-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-[10px] p-3 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-accent-yellow" />
                <span className="text-xs font-semibold text-accent-yellow">{dueReviews.length} Reviews Due</span>
              </div>
              <p className="text-2xs text-text-tertiary">Spaced repetition reviews ready</p>
            </div>
          )}

          {/* Skills List */}
          <div className="space-y-1">
            {learningSkills.map(skill => {
              const isSelected = skill.id === selectedSkillId;
              const skillConcepts = concepts.filter(c => c.skillId === skill.id);
              
              return (
                <div key={skill.id} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      soundManager.play('buttonClick');
                      setSelectedSkillId(skill.id);
                      const matching = concepts.filter(c => c.skillId === skill.id);
                      if (matching.length > 0) {
                        setSelectedConceptId(matching[0].id);
                      } else {
                        setSelectedConceptId(`${skill.id}-overview`);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'bg-surface-3 text-text-primary' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-2 h-2 rounded-full ${
                        skill.status === 'mastered' ? 'bg-accent-green' :
                        skill.status === 'comfortable' ? 'bg-accent-blue' :
                        'bg-accent-yellow'
                      }`} />
                      <span className="truncate">{skill.name}</span>
                    </div>
                    <span className="text-2xs text-text-tertiary">
                      {skill.completedConcepts}/{skill.conceptCount}
                    </span>
                  </button>

                  {/* Sub-concepts */}
                  {isSelected && (
                    <div className="ml-4 pl-2 border-l border-border-default space-y-0.5 my-1">
                      {skillConcepts.map(concept => (
                        <button
                          key={concept.id}
                          onClick={() => {
                            soundManager.play('buttonClick');
                            setSelectedConceptId(concept.id);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-2xs transition-colors ${
                            selectedConceptId === concept.id
                              ? 'bg-surface-4 text-text-primary font-medium'
                              : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            concept.status === 'mastered' ? 'bg-accent-green' :
                            concept.status === 'comfortable' ? 'bg-accent-blue' :
                            'bg-accent-yellow'
                          }`} />
                          <span className="truncate text-left">{concept.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom OM Quick Link */}
        <div className="p-3 border-t border-border-subtle bg-surface-1/50">
          <button
            onClick={() => {
              if (selectedConcept) setBhaiTeachingConcept(selectedConcept.id);
              setCurrentPage('om');
            }}
            className="w-full py-2 px-3 rounded-full bg-surface-3 hover:bg-surface-4 border border-border-subtle text-2xs text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} className="text-accent-copper" />
            <span>Ask OM About This</span>
          </button>
        </div>
      </div>

      {/* Center: Topic Workspace */}
      <div className="flex-1 overflow-y-auto">
        {selectedConcept ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-fade-in w-full min-w-0">
            {/* Return to Problem Callout if launched from a problem (Spec Section 16) */}
            {selectedProblem && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[10px] bg-copper/10 border border-copper/30 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-copper/20 flex items-center justify-center text-copper shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-primary">
                      Currently Practicing: <span className="text-copper">{selectedProblem.title}</span>
                    </div>
                    <div className="text-2xs text-text-tertiary">
                      Your code draft and custom testcases are safely preserved in Coding Lab.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.play('navigation');
                    setCurrentPage('codinglab');
                  }}
                  className="px-4 py-1.5 rounded-full bg-copper text-black text-xs font-semibold hover:bg-copper/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <span>Return to Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Topic Selector (Visible on < md screens) */}
            <div className="md:hidden bg-surface-2 border border-border-default rounded-[10px] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs uppercase tracking-wider font-semibold text-accent-copper">Active Topic</span>
                <span className="text-3xs text-text-tertiary">{skillObj?.name}</span>
              </div>
              <select
                value={effectiveSkillId}
                onChange={e => {
                  const sId = e.target.value;
                  setSelectedSkillId(sId);
                  const matching = concepts.filter(c => c.skillId === sId);
                  if (matching.length > 0) setSelectedConceptId(matching[0].id);
                  else setSelectedConceptId(`${sId}-overview`);
                }}
                className="w-full bg-surface-3 border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-border-strong cursor-pointer"
              >
                {learningSkills.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
              {skillConcepts.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {skillConcepts.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConceptId(c.id)}
                      className={`px-2.5 py-1 rounded-full text-3xs whitespace-nowrap transition-all shrink-0 ${
                        selectedConcept?.id === c.id
                          ? 'bg-accent-copper/20 text-accent-copper border border-accent-copper/40 font-semibold'
                          : 'bg-surface-3 text-text-tertiary'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header: Section 30 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                  <span className="font-semibold text-accent-copper uppercase tracking-wider">
                    {skillObj?.name || 'DSA'}
                  </span>
                  <span>/</span>
                  <span className="text-text-secondary font-medium">{selectedConcept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-text-tertiary">Skill Progress:</span>
                  <span className="text-xs font-semibold text-accent-copper font-mono">
                    {skillObj ? Math.round((skillObj.completedConcepts / skillObj.conceptCount) * 100) : 40}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-normal">
                    {selectedConcept.name}
                  </h1>
                  <p className="text-xs text-text-secondary mt-1">
                    {selectedConcept.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setBhaiTeachingConcept(selectedConcept.id);
                      setCurrentPage('om');
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-accent-copper" />
                    <span>OM Mentor</span>
                  </button>

                  <button
                    onClick={handleComplete}
                    className="bg-paper-white hover:bg-bone text-obsidian px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                  >
                    <Check size={13} className="text-accent-green" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>

              {/* Workspace Navigation Tabs (Section 30) */}
              <div className="flex items-center gap-1 border-b border-border-default pt-2 overflow-x-auto">
                {[
                  { id: 'learn', label: 'LEARN', icon: <BookOpen size={13} /> },
                  { id: 'notes', label: 'NOTES', icon: <FileText size={13} /> },
                  { id: 'w3schools', label: 'W3SCHOOLS', icon: <Globe size={13} /> },
                  { id: 'videos', label: 'VIDEOS', icon: <Video size={13} /> },
                  { id: 'practice', label: 'PRACTICE', icon: <Dumbbell size={13} /> },
                  { id: 'recall', label: 'RECALL', icon: <Brain size={13} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.play('buttonClick');
                      setActiveTab(tab.id as WorkspaceTab);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-2xs font-semibold tracking-wider transition-colors border-b-2 -mb-px shrink-0 ${
                      activeTab === tab.id
                        ? 'border-paper-white text-text-primary'
                        : 'border-transparent text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: LEARN (Intuition, How it Works & Interactive Visualizer) */}
            {activeTab === 'learn' && (
              <div className="space-y-6 animate-fade-in">
                {/* INTERACTIVE VISUALIZER (Section 37) */}
                <TopicVisualizer skillId={effectiveSkillId} topicName={selectedConcept.name} />

                {/* Intuition & Core Concept */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-surface-2 border border-border-default rounded-[10px] space-y-2">
                    <div className="flex items-center gap-2 text-2xs font-semibold text-accent-copper uppercase tracking-wider">
                      <Brain size={13} />
                      <span>The Intuition</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                      {selectedConcept.theIntuition}
                    </p>
                  </div>

                  <div className="p-5 bg-surface-2 border border-border-default rounded-[10px] space-y-2">
                    <div className="flex items-center gap-2 text-2xs font-semibold text-accent-blue uppercase tracking-wider">
                      <Zap size={13} />
                      <span>How It Works</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                      {selectedConcept.howItWorks}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NOTES (Section 31 - What it is, why it matters, mistakes, etc.) */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in">
                {[
                  { key: 'theIdea', title: 'What is it?', content: selectedConcept.theIdea, icon: <BookOpen size={14} className="text-text-tertiary" /> },
                  { key: 'theIntuition', title: 'Intuition & Why it Matters', content: selectedConcept.theIntuition, icon: <Brain size={14} className="text-accent-copper" /> },
                  { key: 'example', title: 'Concrete Trace Example', content: selectedConcept.example, icon: <Code2 size={14} className="text-accent-blue" /> },
                  { key: 'commonMistake', title: 'Common Mistakes & Edge Cases', content: selectedConcept.commonMistake, icon: <AlertTriangle size={14} className="text-accent-red" /> },
                  { key: 'whenToUse', title: 'When to Use It', content: selectedConcept.whenToUse, icon: <CheckCircle2 size={14} className="text-accent-green" /> },
                  { key: 'interviewRelevance', title: 'Interview & Contest Relevance', content: selectedConcept.interviewRelevance, icon: <Target size={14} className="text-accent-yellow" /> },
                ].map(section => (
                  <div key={section.key} className="bg-surface-2 border border-border-default rounded-[10px] p-4 space-y-2">
                    <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-text-secondary">
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                    <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line pl-6 font-mono">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: W3SCHOOLS (Section 32) */}
            {activeTab === 'w3schools' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center font-bold text-sm">
                      W3
                    </div>
                    <div>
                      <div className="text-2xs font-semibold uppercase tracking-wider text-accent-green">
                        W3Schools Verified Tutorial
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {topicRes.w3Title}
                      </h3>
                      <p className="text-2xs text-text-tertiary mt-0.5">
                        Tutorial · {topicRes.w3Difficulty} · Interactive Code Playground
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExternalLink
                      href={topicRes.w3Url}
                      className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors"
                      tooltipText="Open verified W3Schools Tutorial"
                    >
                      OPEN W3SCHOOLS ↗
                    </ExternalLink>

                    <ExternalLink
                      href={topicRes.w3Url}
                      className="px-3.5 py-1.5 rounded-full bg-paper-white text-obsidian text-xs font-semibold transition-all active:scale-[0.98]"
                      tooltipText="Run interactive exercise on W3Schools"
                    >
                      TRY EXERCISE
                    </ExternalLink>
                  </div>
                </div>

                <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-sm">
                      DOCS
                    </div>
                    <div>
                      <div className="text-2xs font-semibold uppercase tracking-wider text-accent-blue">
                        Official Developer Reference
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {selectedConcept.name} Specifications & Runtime Guarantees
                      </h3>
                      <p className="text-2xs text-text-tertiary mt-0.5">
                        Industry Standard API Reference · Best Practices
                      </p>
                    </div>
                  </div>

                  <ExternalLink
                    href={topicRes.w3Url}
                    className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors"
                    tooltipText="Open Reference Documentation"
                  >
                    OPEN DOCS ↗
                  </ExternalLink>
                </div>
              </div>
            )}

            {/* TAB 4: VIDEOS (Section 33 - START HERE, DEEP DIVE, OPTIONAL) */}
            {activeTab === 'videos' && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-3">
                  {/* Video 1: START HERE */}
                  <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-red/10 text-accent-red flex items-center justify-center shrink-0">
                        <Video size={18} />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red text-3xs font-bold tracking-wider uppercase">
                          START HERE
                        </span>
                        <h4 className="text-sm font-semibold text-text-primary mt-1">
                          {topicRes.startVideo.title}
                        </h4>
                        <p className="text-2xs text-text-tertiary">
                          {topicRes.startVideo.channel} · {topicRes.startVideo.duration} · Visual Breakdown
                        </p>
                      </div>
                    </div>

                    <ExternalLink
                      href={topicRes.startVideo.url}
                      className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors shrink-0"
                      tooltipText="Watch on YouTube"
                    >
                      Watch ↗
                    </ExternalLink>
                  </div>

                  {/* Video 2: DEEP DIVE */}
                  <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-purple/10 text-accent-purple flex items-center justify-center shrink-0">
                        <Video size={18} />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-3xs font-bold tracking-wider uppercase">
                          DEEP DIVE
                        </span>
                        <h4 className="text-sm font-semibold text-text-primary mt-1">
                          {topicRes.deepVideo.title}
                        </h4>
                        <p className="text-2xs text-text-tertiary">
                          {topicRes.deepVideo.channel} · {topicRes.deepVideo.duration} · Advanced patterns & variations
                        </p>
                      </div>
                    </div>

                    <ExternalLink
                      href={topicRes.deepVideo.url}
                      className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors shrink-0"
                      tooltipText="Watch on YouTube"
                    >
                      Watch ↗
                    </ExternalLink>
                  </div>

                  {/* Video 3: OPTIONAL */}
                  <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-4 text-text-secondary flex items-center justify-center shrink-0">
                        <Video size={18} />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-surface-3 text-text-tertiary text-3xs font-bold tracking-wider uppercase">
                          OPTIONAL
                        </span>
                        <h4 className="text-sm font-semibold text-text-primary mt-1">
                          Recurrence Relations & Master Theorem for Divide & Conquer
                        </h4>
                        <p className="text-2xs text-text-tertiary">
                          Abdul Bari · 35 mins · Theoretical proofs
                        </p>
                      </div>
                    </div>

                    <ExternalLink
                      href="https://www.youtube.com/watch?v=GU7DpgHINWQ"
                      className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors shrink-0"
                      tooltipText="Watch on YouTube"
                    >
                      Watch ↗
                    </ExternalLink>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PRACTICE */}
            {activeTab === 'practice' && (
              <div className="space-y-3 animate-fade-in">
                {conceptProblems.map(p => (
                  <div
                    key={p.id}
                    className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        p.difficulty === 'beginner' ? 'bg-accent-green/10 text-accent-green' :
                        p.difficulty === 'intermediate' ? 'bg-accent-yellow/10 text-accent-yellow' :
                        'bg-accent-red/10 text-accent-red'
                      }`}>
                        {p.difficulty === 'beginner' ? 'E' : p.difficulty === 'intermediate' ? 'M' : 'H'}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{p.title}</h4>
                        <p className="text-2xs text-text-tertiary">{p.platform} · {p.topic.join(', ')}</p>
                      </div>
                    </div>

                    <ExternalLink
                      href={p.url}
                      className="px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default text-xs font-medium transition-colors"
                      tooltipText={`Solve on ${p.platform}`}
                    >
                      Solve Problem
                    </ExternalLink>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: ACTIVE RECALL (Section 38) */}
            {activeTab === 'recall' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-surface-2 border border-border-default rounded-[10px] flex items-center gap-3">
                  <Brain size={20} className="text-accent-copper shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      “Don’t look back. Let’s see what you remember.”
                    </h3>
                    <p className="text-2xs text-text-tertiary">
                      Test your mental retention before moving to another topic. Active recall solidifies long-term memory.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {topicRes.recallQuestions.map(item => {
                    const isRevealed = revealedRecall[item.id];
                    return (
                      <div key={item.id} className="p-4 bg-surface-2 border border-border-default rounded-[10px] space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-medium text-text-primary">
                            Q{item.id}. {item.q}
                          </div>
                          <button
                            onClick={() => {
                              soundManager.play('buttonClick');
                              setRevealedRecall({ ...revealedRecall, [item.id]: !isRevealed });
                            }}
                            className="text-2xs text-accent-copper hover:underline flex items-center gap-1 shrink-0"
                          >
                            <Eye size={12} />
                            <span>{isRevealed ? 'Hide Answer' : 'Check Recall'}</span>
                          </button>
                        </div>

                        {isRevealed && (
                          <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle text-xs text-text-secondary leading-relaxed font-mono animate-fade-in">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPLETION BANNER: Section 5 & Master Prompt */}
            {completionResult && (
              <div className="mt-8 bg-surface-2 border border-accent-green/40 rounded-[10px] p-5 animate-scale-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-green/20 border border-accent-green/40 flex items-center justify-center text-accent-green shrink-0 mt-0.5 animate-pulse-subtle">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent-green uppercase tracking-wider">
                        {completionResult.conceptName} Complete.
                      </span>
                      <span className="text-2xs text-text-tertiary">· Spaced Review Scheduled</span>
                    </div>

                    <p className="text-sm text-text-primary mt-1 font-medium">
                      “Nice. Ab next step: solve 2 problems without looking at the notes.”
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => setCurrentPage('practice')}
                        className="px-4 py-2 rounded-full bg-paper-white text-surface-0 hover:bg-bone text-xs font-semibold transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                      >
                        <Target size={13} className="text-accent-copper" />
                        <span>START PRACTICE</span>
                      </button>

                      <button
                        onClick={() => setCompletionResult(null)}
                        className="text-2xs text-text-tertiary hover:text-text-secondary"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-text-tertiary text-xs">
            Select a concept from the left panel to begin.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
