import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, ChevronRight, BookOpen,
  Dumbbell, Brain, FileText, Play, Lock, Sparkles, Plus, Trash2,
  Calendar, Flag, Edit3, X, Check, Save, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { SkillNode, SkillStatus } from '../types';
import { soundManager } from '../utils/soundManager';

const categories = ['DSA', 'Web Development', 'AI/ML', 'Cybersecurity', 'Core CS'];

const statusConfig: Record<SkillStatus, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  mastered: { icon: <CheckCircle2 size={16} />, label: 'Mastered', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  comfortable: { icon: <CheckCircle2 size={16} />, label: 'Comfortable', color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' },
  learning: { icon: <ArrowRight size={16} />, label: 'Learning', color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30' },
  needs_revision: { icon: <Brain size={16} />, label: 'Needs Revision', color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  not_started: { icon: <Circle size={16} />, label: 'Not Started', color: 'text-text-tertiary', bg: 'bg-surface-3', border: 'border-border-default' },
};

export default function RoadmapPage() {
  const {
    skills,
    selectedCategory,
    setSelectedCategory,
    selectedSkillId,
    setSelectedSkillId,
    updateSkillStatus,
    addSkillNode,
    removeSkillNode,
    updateSkillCustomData,
    setCurrentPage,
    setBhaiTeachingConcept,
  } = useAppStore();

  const [detailOpen, setDetailOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Node Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newDeadline, setNewDeadline] = useState('');

  // Editing current node custom state
  const [editNotes, setEditNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  const categorySkills = useMemo(() => 
    skills.filter(s => s.category === selectedCategory),
    [skills, selectedCategory]
  );

  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  // Sync notes when skill changes
  React.useEffect(() => {
    if (selectedSkill) {
      setEditNotes(selectedSkill.notes || '');
      setNotesSaved(false);
    }
  }, [selectedSkillId]);

  const handleNodeClick = (skill: SkillNode) => {
    soundManager.play('click');
    setSelectedSkillId(skill.id);
    setDetailOpen(true);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNode: SkillNode = {
      id: `custom-${Date.now()}`,
      name: newTitle.trim(),
      category: selectedCategory,
      status: 'not_started',
      children: [],
      prerequisites: [],
      description: newDesc.trim() || 'Custom roadmap milestone added by user.',
      conceptCount: 1,
      completedConcepts: 0,
      priority: newPriority,
      deadline: newDeadline || undefined,
      isCustom: true,
    };

    addSkillNode(newNode);
    setNewTitle('');
    setNewDesc('');
    setNewDeadline('');
    setShowAddModal(false);
  };

  const handleSaveNotes = () => {
    if (!selectedSkill) return;
    updateSkillCustomData(selectedSkill.id, { notes: editNotes });
    soundManager.play('click');
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  // Calculate positions for the roadmap graph
  const getNodePositions = (nodes: SkillNode[]) => {
    const levels: SkillNode[][] = [];
    const placed = new Set<string>();
    
    const catIds = new Set(nodes.map(n => n.id));
    let currentLevel = nodes.filter(n => n.prerequisites.every(p => !catIds.has(p)));
    
    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      currentLevel.forEach(n => placed.add(n.id));
      
      const nextLevel = nodes.filter(n => 
        !placed.has(n.id) && 
        n.prerequisites.filter(p => catIds.has(p)).every(p => placed.has(p))
      );
      currentLevel = nextLevel;
    }
    
    const remaining = nodes.filter(n => !placed.has(n.id));
    if (remaining.length > 0) levels.push(remaining);
    
    return levels;
  };

  const levels = getNodePositions(categorySkills);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Roadmap Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 animate-fade-in">
            <div>
              <h1 className="text-xl font-semibold text-text-primary mb-1">Custom Skill Roadmap</h1>
              <p className="text-sm text-text-tertiary">
                Personalized milestone progression. Click any node to track, prioritize, or customize.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-3 border border-border-default text-text-primary text-xs font-medium hover:bg-surface-4 hover:border-border-strong transition-all shadow-sm"
            >
              <Plus size={14} className="text-accent-copper" />
              Add Milestone
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 mb-8 bg-surface-2 rounded-lg p-1 w-fit flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setDetailOpen(false); }}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-surface-4 text-text-primary shadow-sm font-semibold'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={config.color}>{config.icon}</span>
                <span className="text-2xs text-text-tertiary">{config.label}</span>
              </div>
            ))}
          </div>

          {/* Roadmap Graph */}
          <div className="space-y-12 relative">
            {levels.map((level, levelIdx) => (
              <div key={levelIdx} className="relative">
                {/* Level Connector Line */}
                {levelIdx < levels.length - 1 && (
                  <div className="absolute left-1/2 -bottom-8 w-px h-8 bg-border-default -translate-x-1/2 z-0" />
                )}

                <div className="flex justify-center gap-4 flex-wrap relative z-10">
                  {level.map(skill => {
                    const config = statusConfig[skill.status];
                    const isSelected = selectedSkillId === skill.id;

                    return (
                      <button
                        key={skill.id}
                        onClick={() => handleNodeClick(skill)}
                        className={`group relative flex flex-col items-center p-4 rounded-[12px] border transition-all min-w-[170px] max-w-[210px] text-center ${config.bg} ${config.border} ${
                          isSelected ? 'ring-2 ring-accent-copper scale-105 shadow-md' : 'hover:scale-102 hover:shadow-sm'
                        }`}
                      >
                        {/* Priority Badge */}
                        {skill.priority && (
                          <span className={`absolute top-2 right-2 text-3xs px-1.5 py-0.5 rounded-full font-semibold ${
                            skill.priority === 'High' ? 'bg-accent-red/20 text-accent-red' :
                            skill.priority === 'Medium' ? 'bg-accent-yellow/20 text-accent-yellow' :
                            'bg-surface-4 text-text-tertiary'
                          }`}>
                            {skill.priority}
                          </span>
                        )}

                        <span className={`${config.color} mb-2`}>{config.icon}</span>
                        <span className="text-xs font-semibold text-text-primary group-hover:text-white transition-colors leading-tight mb-1">
                          {skill.name}
                        </span>
                        <span className="text-3xs text-text-tertiary">
                          {skill.completedConcepts}/{skill.conceptCount} Concepts
                        </span>
                        {skill.deadline && (
                          <span className="text-3xs text-accent-copper mt-1 font-mono">
                            Target: {skill.deadline}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-12 grid grid-cols-4 gap-3">
            {Object.entries(statusConfig).filter(([k]) => k !== 'needs_revision').map(([key, config]) => {
              const count = categorySkills.filter(s => s.status === key).length;
              return (
                <div key={key} className="bg-surface-2 border border-border-default rounded-[10px] p-3 text-center">
                  <span className={`${config.color} text-lg font-semibold`}>{count}</span>
                  <span className="block text-2xs text-text-tertiary mt-0.5">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Detail & Customization Drawer (Phase 20) */}
      {detailOpen && selectedSkill && (
        <div className="w-[360px] bg-surface-1 border-l border-border-default overflow-y-auto animate-slide-in-right flex flex-col shrink-0">
          <div className="p-5 space-y-5 flex-1">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-2xs font-semibold uppercase tracking-wider ${statusConfig[selectedSkill.status].color}`}>
                  {statusConfig[selectedSkill.status].label}
                </span>
                <button onClick={() => setDetailOpen(false)} className="text-text-tertiary hover:text-text-primary text-base">
                  ✕
                </button>
              </div>
              <h2 className="text-base font-semibold text-text-primary">{selectedSkill.name}</h2>
              <p className="text-xs text-text-tertiary mt-1 leading-relaxed">{selectedSkill.description}</p>
            </div>

            {/* Quick Milestone Custom Actions (Phase 20: Mark Known / Skip) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  updateSkillStatus(selectedSkill.id, 'mastered');
                  soundManager.play('milestone');
                }}
                className={`py-1.5 px-3 rounded-full text-2xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                  selectedSkill.status === 'mastered'
                    ? 'bg-accent-green/20 border-accent-green text-accent-green'
                    : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary'
                }`}
              >
                <Check size={12} />
                Mark as Known
              </button>
              <button
                onClick={() => {
                  updateSkillStatus(selectedSkill.id, 'comfortable');
                  soundManager.play('click');
                }}
                className="py-1.5 px-3 rounded-full text-2xs font-semibold bg-surface-3 border border-border-default text-text-secondary hover:text-text-primary flex items-center justify-center gap-1 transition-all"
              >
                Skip / Learned
              </button>
            </div>

            {/* Priority & Target Deadline Controls */}
            <div className="bg-surface-2 border border-border-subtle rounded-[10px] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-2xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                  <Flag size={12} className="text-accent-copper" /> Priority
                </label>
                <select
                  value={selectedSkill.priority || 'Medium'}
                  onChange={e => updateSkillCustomData(selectedSkill.id, { priority: e.target.value as any })}
                  className="bg-surface-3 border border-border-default rounded-md px-2 py-0.5 text-2xs text-text-primary outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-2xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                  <Calendar size={12} className="text-accent-blue" /> Target Date
                </label>
                <input
                  type="date"
                  value={selectedSkill.deadline || ''}
                  onChange={e => updateSkillCustomData(selectedSkill.id, { deadline: e.target.value })}
                  className="bg-surface-3 border border-border-default rounded-md px-2 py-0.5 text-2xs text-text-primary outline-none"
                />
              </div>
            </div>

            {/* Personal Notes (Phase 20) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-2xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                  <Edit3 size={12} className="text-accent-yellow" /> Personal Notes
                </label>
                {notesSaved && (
                  <span className="text-3xs text-accent-green flex items-center gap-1">
                    <Check size={10} /> Saved
                  </span>
                )}
              </div>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Key mental models, gotchas, interview insights..."
                className="w-full h-24 bg-surface-2 border border-border-default rounded-[8px] p-2.5 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-strong resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded-full bg-surface-3 border border-border-default hover:bg-surface-4 text-text-secondary hover:text-text-primary text-2xs font-medium flex items-center gap-1 ml-auto transition-colors"
              >
                <Save size={10} />
                Save Notes
              </button>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setCurrentPage('learning')}
                className="w-full flex items-center gap-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/20 rounded-[8px] px-3.5 py-2.5 text-xs font-medium transition-colors"
              >
                <BookOpen size={14} />
                <span>Open Lesson & Visualizer</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
              
              <button
                onClick={() => setCurrentPage('codinglab')}
                className="w-full flex items-center gap-2.5 bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default rounded-[8px] px-3.5 py-2.5 text-xs font-medium transition-colors"
              >
                <Dumbbell size={14} />
                <span>Practice in Coding Lab</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
            </div>

            {/* Custom Milestone Delete */}
            {selectedSkill.isCustom && (
              <div className="pt-2">
                <button
                  onClick={() => removeSkillNode(selectedSkill.id)}
                  className="w-full py-1.5 rounded-full border border-accent-red/30 text-accent-red hover:bg-accent-red/10 text-2xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete Custom Milestone
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-accent-copper" />
                <h3 className="text-sm font-semibold text-text-primary">Add Custom Roadmap Milestone</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-text-tertiary hover:text-text-primary text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-3">
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Milestone Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus (Raft/Paxos)"
                  className="w-full bg-surface-3 border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                  required
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Description & Goals
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What will you build or learn in this milestone?"
                  className="w-full h-20 bg-surface-3 border border-border-default rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-border-strong resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full bg-surface-3 border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full bg-surface-3 border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded-full text-xs text-text-tertiary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full bg-accent-copper text-white text-xs font-semibold hover:bg-accent-copper/90 transition-all shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
