import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, ChevronRight, BookOpen,
  Dumbbell, Brain, FileText, Play, Lock, Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { SkillNode, SkillStatus } from '../types';

const categories = ['DSA', 'Web Development', 'AI/ML', 'Cybersecurity', 'Core CS'];

const statusConfig: Record<SkillStatus, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  mastered: { icon: <CheckCircle2 size={16} />, label: 'Mastered', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  comfortable: { icon: <CheckCircle2 size={16} />, label: 'Comfortable', color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' },
  learning: { icon: <ArrowRight size={16} />, label: 'Learning', color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30' },
  needs_revision: { icon: <Brain size={16} />, label: 'Needs Revision', color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  not_started: { icon: <Circle size={16} />, label: 'Not Started', color: 'text-text-tertiary', bg: 'bg-surface-3', border: 'border-border-default' },
};

export default function RoadmapPage() {
  const { skills, selectedCategory, setSelectedCategory, selectedSkillId, setSelectedSkillId, setCurrentPage, setBhaiTeachingConcept } = useAppStore();
  const [detailOpen, setDetailOpen] = useState(false);

  const categorySkills = useMemo(() => 
    skills.filter(s => s.category === selectedCategory),
    [skills, selectedCategory]
  );

  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  const handleNodeClick = (skill: SkillNode) => {
    setSelectedSkillId(skill.id);
    setDetailOpen(true);
  };

  // Calculate positions for the roadmap graph
  const getNodePositions = (nodes: SkillNode[]) => {
    const levels: SkillNode[][] = [];
    const placed = new Set<string>();
    
    // Find root nodes (no prerequisites within this category)
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
    
    // Place remaining unplaced nodes
    const remaining = nodes.filter(n => !placed.has(n.id));
    if (remaining.length > 0) levels.push(remaining);
    
    return levels;
  };

  const levels = getNodePositions(categorySkills);

  return (
    <div className="h-full flex">
      {/* Main Roadmap Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-xl font-semibold text-text-primary mb-1">Skill Roadmap</h1>
            <p className="text-sm text-text-tertiary">Click any node to explore, learn, and practice.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 mb-8 bg-surface-2 rounded-lg p-1 w-fit">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setDetailOpen(false); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-surface-4 text-text-primary shadow-sm'
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

          {/* Visual Roadmap */}
          <div className="space-y-3">
            {levels.map((level, levelIndex) => (
              <div key={levelIndex} className="animate-slide-up" style={{ animationDelay: `${levelIndex * 80}ms` }}>
                {/* Connection Line */}
                {levelIndex > 0 && (
                  <div className="flex justify-center mb-3">
                    <div className="w-px h-8 bg-border-default" />
                  </div>
                )}
                
                {/* Level Nodes */}
                <div className="flex flex-wrap justify-center gap-3">
                  {level.map((skill) => {
                    const config = statusConfig[skill.status];
                    const isSelected = selectedSkillId === skill.id;
                    const progress = skill.conceptCount > 0 ? (skill.completedConcepts / skill.conceptCount) * 100 : 0;
                    
                    return (
                      <button
                        key={skill.id}
                        onClick={() => handleNodeClick(skill)}
                        className={`relative group px-5 py-3.5 rounded-xl border transition-all duration-200 min-w-[160px] ${
                          isSelected 
                            ? `${config.bg} ${config.border} shadow-elevated` 
                            : `bg-surface-2 border-border-default hover:border-border-strong hover:bg-surface-3`
                        }`}
                      >
                        {/* Status indicator */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={config.color}>{config.icon}</span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-primary group-hover:text-accent-blue'} transition-colors`}>
                            {skill.name}
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-surface-4 rounded-full h-1 mb-1">
                          <div 
                            className={`h-1 rounded-full transition-all ${
                              skill.status === 'mastered' ? 'bg-accent-green' :
                              skill.status === 'comfortable' ? 'bg-accent-blue' :
                              skill.status === 'learning' ? 'bg-accent-yellow' :
                              'bg-text-tertiary'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-2xs text-text-tertiary">
                          {skill.completedConcepts}/{skill.conceptCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-10 grid grid-cols-4 gap-3">
            {Object.entries(statusConfig).filter(([k]) => k !== 'needs_revision').map(([key, config]) => {
              const count = categorySkills.filter(s => s.status === key).length;
              return (
                <div key={key} className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
                  <span className={`${config.color} text-lg font-semibold`}>{count}</span>
                  <span className="block text-2xs text-text-tertiary mt-0.5">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Detail Panel */}
      {detailOpen && selectedSkill && (
        <div className="w-[340px] bg-surface-1 border-l border-border-default overflow-y-auto animate-slide-in-right">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-2xs font-semibold uppercase tracking-wider ${statusConfig[selectedSkill.status].color}`}>
                  {statusConfig[selectedSkill.status].label}
                </span>
                <button onClick={() => setDetailOpen(false)} className="text-text-tertiary hover:text-text-secondary text-lg">
                  ×
                </button>
              </div>
              <h2 className="text-lg font-semibold text-text-primary">{selectedSkill.name}</h2>
              <p className="text-sm text-text-tertiary mt-1">{selectedSkill.description}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-2xs text-text-tertiary mb-1.5">
                <span>Progress</span>
                <span>{selectedSkill.completedConcepts} / {selectedSkill.conceptCount}</span>
              </div>
              <div className="w-full bg-surface-4 rounded-full h-2">
                <div 
                  className="bg-accent-blue h-2 rounded-full transition-all"
                  style={{ width: `${(selectedSkill.completedConcepts / selectedSkill.conceptCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('learning')}
                className="w-full flex items-center gap-3 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/20 rounded-lg px-4 py-3 transition-colors"
              >
                <BookOpen size={16} />
                <span className="text-sm font-medium">Learn</span>
                <ChevronRight size={14} className="ml-auto" />
              </button>
              
              <button
                onClick={() => setCurrentPage('practice')}
                className="w-full flex items-center gap-3 bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default rounded-lg px-4 py-3 transition-colors"
              >
                <Dumbbell size={16} />
                <span className="text-sm font-medium">Practice</span>
                <ChevronRight size={14} className="ml-auto" />
              </button>
              
              <button
                onClick={() => { setBhaiTeachingConcept(selectedSkill.id); setCurrentPage('bhai'); }}
                className="w-full flex items-center gap-3 bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple border border-accent-purple/20 rounded-lg px-4 py-3 transition-colors"
              >
                <Sparkles size={16} />
                <span className="text-sm font-medium">Bhai, Teach Me</span>
                <ChevronRight size={14} className="ml-auto" />
              </button>

              <button
                onClick={() => {}}
                className="w-full flex items-center gap-3 bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default rounded-lg px-4 py-3 transition-colors"
              >
                <Brain size={16} />
                <span className="text-sm font-medium">Active Recall</span>
                <ChevronRight size={14} className="ml-auto" />
              </button>
              
              <button
                onClick={() => {}}
                className="w-full flex items-center gap-3 bg-surface-3 hover:bg-surface-4 text-text-secondary border border-border-default rounded-lg px-4 py-3 transition-colors"
              >
                <FileText size={16} />
                <span className="text-sm font-medium">Resources</span>
                <ChevronRight size={14} className="ml-auto" />
              </button>
            </div>

            {/* Why It Matters */}
            <div className="bg-surface-3 rounded-lg p-3">
              <h4 className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Why It Matters</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {selectedSkill.name} is a fundamental concept tested in coding interviews at top companies. 
                Mastering it unlocks multiple advanced topics.
              </p>
            </div>

            {/* Prerequisites */}
            {selectedSkill.prerequisites.length > 0 && (
              <div>
                <h4 className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Prerequisites</h4>
                <div className="space-y-1.5">
                  {selectedSkill.prerequisites.map(preId => {
                    const pre = skills.find(s => s.id === preId);
                    if (!pre) return null;
                    const preConfig = statusConfig[pre.status];
                    return (
                      <div key={preId} className="flex items-center gap-2 text-sm">
                        <span className={preConfig.color}>{preConfig.icon}</span>
                        <span className="text-text-secondary">{pre.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Skills */}
            {selectedSkill.children.length > 0 && (
              <div>
                <h4 className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Unlocks</h4>
                <div className="space-y-1.5">
                  {selectedSkill.children.map(childId => {
                    const child = skills.find(s => s.id === childId);
                    if (!child) return null;
                    return (
                      <button
                        key={childId}
                        onClick={() => handleNodeClick(child)}
                        className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors w-full"
                      >
                        <Lock size={12} />
                        <span>{child.name}</span>
                        <ChevronRight size={12} className="ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
