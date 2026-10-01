import {
  Play, Clock, Target, Zap, ChevronRight, BookOpen,
  Trophy, BarChart3, Calendar, ArrowRight, CheckCircle2,
  Brain, Flame, Timer, Code2, Sparkles, UserPlus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ProfileCard from '../components/common/ProfileCard';
import ExternalLink from '../components/common/ExternalLink';
import NotificationPermissionPrompt from '../components/notifications/NotificationPermissionPrompt';
import { soundManager } from '../utils/soundManager';
import { getTimeGreeting } from '../utils/greetingUtils';

export default function HomePage() {
  const { 
    userName, dailyStats, reviews, opportunities, skills, contests,
    setCurrentPage, problems, isProfileConnected, setLoginModalOpen 
  } = useAppStore();
  
  const now = new Date();
  const timeGreeting = getTimeGreeting(userName);
  
  const dueReviews = reviews.filter(r => new Date(r.nextReview) <= now);
  const upcomingOpps = opportunities
    .filter(o => new Date(o.deadline) > now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);
  
  const solvedCount = problems.filter(p => p.status === 'solved').length;
  const currentlyLearning = skills.filter(s => s.status === 'learning');
  
  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-accent-green';
      case 'comfortable': return 'text-accent-blue';
      case 'learning': return 'text-accent-yellow';
      case 'needs_revision': return 'text-accent-red';
      default: return 'text-text-tertiary';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Notification Permission Banner */}
      <div className="pt-4">
        <NotificationPermissionPrompt />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 w-full min-w-0">
        
        {/* Time-Based Greeting & Profile Card */}
        <div className="space-y-4 animate-fade-in min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base sm:text-lg">{timeGreeting.emoji}</span>
              <span className="text-2xs font-semibold uppercase tracking-wider text-accent-copper">
                {timeGreeting.salutation}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif text-text-primary tracking-tight font-normal break-words">
              {isProfileConnected && userName ? (
                <>
                  {timeGreeting.title.split(',')[0]}, <span className="text-paper-white font-serif">{userName.toUpperCase()}</span>
                </>
              ) : (
                <>
                  WELCOME, <span className="text-paper-white font-serif">DEVELOPER</span>
                </>
              )}
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-light italic">
              “{timeGreeting.subtitle}”
            </p>
          </div>

          {/* Quick Sign Up Card for New Users / Guests */}
          {!isProfileConnected && (
            <div className="bg-gradient-to-r from-accent-copper/15 via-surface-2 to-accent-blue/15 border border-accent-copper/40 rounded-[14px] p-4 sm:p-5 relative overflow-hidden shadow-xl animate-slide-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent-copper/20 text-accent-copper border border-accent-copper/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent-copper">Start Here</span>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-accent-copper/20 text-accent-copper font-medium">New Account</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary mt-0.5">
                      Create your account & personalize your OS
                    </h3>
                    <p className="text-xs text-text-tertiary mt-1 max-w-xl">
                      Sign up with your name and link your GitHub & LeetCode to track real problem streaks, personalized AI hints, and tailored career targets.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent-copper hover:bg-copper-accent-hover text-surface-0 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 shrink-0"
                >
                  <UserPlus size={16} />
                  <span>Sign Up / Create Profile</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Persistent Personal Profile Card */}
          <ProfileCard />
        </div>

        {/* NEXT MOVE — Primary CTA */}
        <div className="animate-slide-up">
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-6 relative overflow-hidden group">
            {/* Subtle glow accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-copper/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-accent-copper" />
                <span className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">Your Next Move</span>
              </div>
              
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                Complete Binary Search revision & practice
              </h2>
              <p className="text-xs text-text-secondary mb-4">
                You're on Binary Search — solidify algorithmic intuition with 2 focused problems.
              </p>
              
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <Timer size={14} />
                  <span className="text-xs">~25 min</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <Brain size={14} />
                  <span className="text-xs">Binary Search</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  soundManager.play('buttonClick');
                  setCurrentPage('learning');
                }}
                className="inline-flex items-center gap-2 bg-paper-white hover:bg-bone text-obsidian font-semibold px-6 py-2.5 rounded-full transition-all active:scale-[0.98] shadow-md text-xs tracking-wider"
              >
                <Play size={14} />
                <span>START SESSION</span>
              </button>
            </div>
          </div>
        </div>

        {/* TODAY Stats */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Today</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              icon={<Clock size={16} />} 
              label="Learning" 
              value={`${dailyStats.learningMinutes} min`} 
              color="text-accent-blue" 
            />
            <StatCard 
              icon={<Target size={16} />} 
              label="Problems" 
              value={`${dailyStats.problemsSolved} / ${dailyStats.problemsAttempted}`} 
              color="text-accent-green" 
            />
            <StatCard 
              icon={<Brain size={16} />} 
              label="Review" 
              value={`${dueReviews.length} due`} 
              color={dueReviews.length > 0 ? 'text-accent-yellow' : 'text-accent-green'} 
            />
            <StatCard 
              icon={<Flame size={16} />} 
              label="Streak" 
              value="7 days" 
              color="text-accent-red" 
            />
          </div>
        </div>

        {/* Due Reviews */}
        {dueReviews.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="bg-surface-2 border border-accent-yellow/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-accent-yellow" />
                  <span className="text-sm font-medium text-text-primary">Spaced Review Due</span>
                </div>
                <button 
                  onClick={() => setCurrentPage('learning')}
                  className="text-2xs text-accent-yellow hover:text-yellow-400 font-medium flex items-center gap-1"
                >
                  Start review <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {dueReviews.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 px-3 bg-surface-3 rounded-lg">
                    <span className="text-sm text-text-secondary">{r.conceptName}</span>
                    <span className="text-2xs text-text-tertiary">~5 min recall</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Continue Learning</h3>
            <button onClick={() => setCurrentPage('roadmap')} className="text-2xs text-accent-blue hover:text-blue-400 font-medium flex items-center gap-1">
              View roadmap <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentlyLearning.slice(0, 4).map(skill => (
              <button
                key={skill.id}
                onClick={() => setCurrentPage('learning')}
                className="bg-surface-2 border border-border-default rounded-xl p-4 text-left hover:border-border-strong hover:bg-surface-3 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">{skill.name}</span>
                  <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-secondary transition-colors" />
                </div>
                <div className="w-full bg-surface-4 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-accent-blue h-1.5 rounded-full transition-all"
                    style={{ width: `${(skill.completedConcepts / skill.conceptCount) * 100}%` }}
                  />
                </div>
                <span className="text-2xs text-text-tertiary">
                  {skill.completedConcepts} / {skill.conceptCount} concepts
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Opportunities */}
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Upcoming Opportunities</h3>
            <button onClick={() => setCurrentPage('opportunities')} className="text-2xs text-accent-blue hover:text-blue-400 font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingOpps.map(opp => {
              const days = daysUntil(opp.deadline);
              return (
                <button
                  key={opp.id}
                  onClick={() => setCurrentPage('opportunities')}
                  className="w-full bg-surface-2 border border-border-default rounded-xl p-4 flex items-center gap-4 hover:border-border-strong hover:bg-surface-3 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    opp.type === 'contest' ? 'bg-accent-blue/10 text-accent-blue' :
                    opp.type === 'hackathon' ? 'bg-accent-purple/10 text-accent-purple' :
                    opp.type === 'internship' ? 'bg-accent-green/10 text-accent-green' :
                    'bg-accent-yellow/10 text-accent-yellow'
                  }`}>
                    {opp.type === 'contest' ? <Code2 size={18} /> :
                     opp.type === 'hackathon' ? <Trophy size={18} /> :
                     <Calendar size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                        {opp.title}
                      </span>
                    </div>
                    <span className="text-2xs text-text-tertiary">{opp.organizer} · {opp.mode}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-semibold ${days <= 3 ? 'text-accent-red' : days <= 7 ? 'text-accent-yellow' : 'text-text-secondary'}`}>
                      {days}d
                    </span>
                    <span className="block text-2xs text-text-tertiary">left</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Progress */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Skill Progress</h3>
            <button onClick={() => setCurrentPage('roadmap')} className="text-2xs text-accent-blue hover:text-blue-400 font-medium flex items-center gap-1">
              Full map <ChevronRight size={12} />
            </button>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['DSA', 'Web Development', 'AI/ML'].map(cat => {
                const catSkills = skills.filter(s => s.category === cat);
                const mastered = catSkills.filter(s => s.status === 'mastered').length;
                const comfortable = catSkills.filter(s => s.status === 'comfortable').length;
                const total = catSkills.length;
                const progress = ((mastered + comfortable * 0.7) / total) * 100;
                
                return (
                  <div key={cat} className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#26262c" strokeWidth="3" />
                        <circle 
                          cx="18" cy="18" r="15.5" fill="none" 
                          stroke={cat === 'DSA' ? '#3b82f6' : cat === 'Web Development' ? '#22c55e' : '#a855f7'} 
                          strokeWidth="3"
                          strokeDasharray={`${progress} ${100 - progress}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold text-text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{cat}</span>
                    <span className="block text-2xs text-text-tertiary">{mastered}/{total} mastered</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {[
              { text: 'Solved "Binary Search" on LeetCode', time: '2 hours ago', icon: <CheckCircle2 size={14} />, color: 'text-accent-green' },
              { text: 'Completed Sliding Window lesson', time: '5 hours ago', icon: <BookOpen size={14} />, color: 'text-accent-blue' },
              { text: 'Reviewed Hashing concepts', time: 'Yesterday', icon: <Brain size={14} />, color: 'text-accent-purple' },
              { text: 'Solved 2 Two Pointer problems', time: 'Yesterday', icon: <Target size={14} />, color: 'text-accent-cyan' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors">
                <span className={item.color}>{item.icon}</span>
                <span className="text-sm text-text-secondary flex-1">{item.text}</span>
                <span className="text-2xs text-text-tertiary">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-surface-2 border border-border-default rounded-xl p-3">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-lg font-semibold text-text-primary">{value}</div>
      <div className="text-2xs text-text-tertiary">{label}</div>
    </div>
  );
}

