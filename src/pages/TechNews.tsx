import React, { useState, useMemo } from 'react';
import {
  Newspaper, ExternalLink, Bookmark, BookmarkCheck, Sparkles, Filter,
  Search, ArrowRight, BookOpen, Clock, ShieldCheck, Flame
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { verifiedTechNewsArticles } from '../data/techNewsData';
import type { TechNewsCategory, TechNewsArticle } from '../types';

const CATEGORIES: TechNewsCategory[] = [
  'AI/ML',
  'Software Engineering',
  'Cybersecurity',
  'Cloud',
  'Developer Tools',
  'Open Source',
  'Programming Languages',
  'Databases',
  'Web',
  'Research',
  'Tech Industry',
];

export default function TechNewsPage() {
  const { savedTechNewsIds, toggleSaveTechNews, setCurrentPage, setSelectedConceptId } = useAppStore();

  const [activeTab, setActiveTab] = useState<'for_you' | 'all_tech' | 'saved'>('for_you');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return verifiedTechNewsArticles.filter((article: TechNewsArticle) => {
      if (activeTab === 'saved' && !savedTechNewsIds.includes(article.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = article.summary.toLowerCase().includes(q);
        const matchesSource = article.source.toLowerCase().includes(q);
        const matchesCategory = article.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesSource && !matchesCategory) return false;
      }
      return true;
    });
  }, [activeTab, selectedCategory, searchQuery, savedTechNewsIds]);

  const handleLearnConcept = (article: TechNewsArticle) => {
    if (article.relatedConceptId) {
      setSelectedConceptId(article.relatedConceptId);
    }
    setCurrentPage('learning');
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Top Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/30 text-copper text-xs font-mono tracking-wider uppercase mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            Verified Developer Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Tech News & Engineering Releases
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Strictly verified releases, official blog announcements, and architecture updates directly connected to your learning goals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-carbon border border-border/60 rounded-full p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'for_you'
                ? 'bg-copper text-black font-semibold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('all_tech')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'all_tech'
                ? 'bg-copper text-black font-semibold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Tech
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-copper text-black font-semibold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Saved ({savedTechNewsIds.length})
          </button>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-carbon border border-border/40 p-3 rounded-[10px] mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified releases, tools or engineering topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-graphite/40 border border-border/50 rounded-full text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-copper/60 transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by Category"
          className="px-3 py-1.5 text-xs bg-graphite/40 border border-border/50 rounded-full text-text-secondary focus:outline-none focus:border-copper/60 shrink-0"
        >
          <option value="all">All Categories ({CATEGORIES.length})</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Feed */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-[10px] bg-carbon border border-border/40 text-text-tertiary">
          <p className="text-sm">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article: TechNewsArticle) => {
            const isSaved = savedTechNewsIds.includes(article.id);

            return (
              <div
                key={article.id}
                className="p-5 rounded-[10px] bg-carbon border border-border/40 hover:border-border/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Verification badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-copper/10 text-copper border border-copper/20">
                        {article.category}
                      </span>
                      <span className="text-[11px] font-mono text-text-tertiary flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSaveTechNews(article.id)}
                      className="text-text-tertiary hover:text-copper transition-colors p-1"
                      title={isSaved ? 'Remove from saved' : 'Save article'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-copper" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-semibold text-text-primary mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {article.summary}
                  </p>

                  {/* Why it matters to you */}
                  <div className="p-3 rounded-[8px] bg-graphite/40 border border-border/30 text-xs text-text-secondary mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-copper font-semibold block mb-0.5">
                      Why it matters:
                    </span>
                    <p className="text-[11px] leading-relaxed text-text-secondary font-sans">{article.whyItMatters}</p>
                  </div>

                  {/* Relevant skill tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.relevantSkills.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-graphite text-text-tertiary border border-border/30"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {article.relatedConceptId && (
                      <button
                        onClick={() => handleLearnConcept(article)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-copper hover:underline"
                      >
                        <BookOpen className="w-3 h-3" /> Learn Concept
                      </button>
                    )}

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-graphite hover:bg-graphite/80 text-text-primary border border-border/50 transition-colors"
                    >
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
