import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, User, Zap, Clock, ChevronRight, ArrowUpRight, Gamepad2, Dumbbell, Brain, Diamond, LayoutGrid, Search, FileText } from 'lucide-react';
import { useApp } from '../store/store';
import type { Tournament } from '../types';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { formatDate } from '../utils/time';
import { buildAppSearchResults } from '../utils/appSearch';
import EmptyState from '../components/EmptyState';
import WelcomeBanner from '../components/WelcomeBanner';

const statusColors: Record<string, string> = {
  active: 'text-arena-accent',
  registration: 'text-blue-400',
  draft: 'text-arena-text-muted',
  completed: 'text-arena-text-muted',
};

const statusBgs: Record<string, string> = {
  active: 'bg-arena-accent/10 border-arena-accent/20',
  registration: 'bg-blue-500/10 border-blue-500/20',
  draft: 'bg-gray-500/10 border-gray-500/20',
  completed: 'bg-gray-400/10 border-gray-400/20',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  registration: 'Registration',
  draft: 'Draft',
  completed: 'Completed',
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const INDIVIDUAL_GAMES = new Set([
  'chess',
  'checkers',
  'go',
  'mahjong',
  'poker',
  'uno',
  'tennis',
  'table tennis',
  'smash bros',
  'street fighter 6',
  'fortnite',
  'tekken 8',
]);

function TournamentCard({ t }: { t: Tournament }) {
  const navigate = useNavigate();
  const isIndividualGame = INDIVIDUAL_GAMES.has(t.game.toLowerCase());
  const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
  const liveMatches = t.matches.filter(m => m.status === 'live').length;
  const completedMatches = t.matches.filter(m => m.status === 'completed').length;
  const progress = t.matches.length > 0 ? Math.round((completedMatches / t.matches.length) * 100) : 0;

  return (
    <motion.div 
      variants={fadeUp}
      className="glass-card flex flex-col p-5 data-[density=compact]:p-3 group cursor-pointer" 
      onClick={() => navigate(`/tournaments/${t.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-arena-text group-hover:text-arena-accent transition-colors truncate pr-2">{t.name}</h3>
          <p className="text-sm text-arena-text-muted mt-1 capitalize">{t.game} <span className="ox-2 opacity-50">•</span> {t.format.replace(/-/g, ' ')}</p>
        </div>
        <div className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border flex items-center gap-1.5 whitespace-nowrap ${statusColors[t.status]} ${statusBgs[t.status]}`}>
          {liveMatches > 0 && <span className="w-1.5 h-1.5 rounded-full bg-arena-accent shadow-[0_0_8px_rgba(232,255,71,0.8)] animate-pulse" />}
          {statusLabels[t.status]}
        </div>
      </div>

      <div className="grid grid-cols-[max-content_max-content_1fr] items-center gap-3 data-[density=compact]:gap-2 text-sm text-arena-text mb-6 data-[density=compact]:mb-3">
        <div className="min-w-0 flex items-center gap-1.5 bg-arena-surface border border-arena-border px-2.5 py-1.5 rounded-lg">
          <Users size={14} className="text-arena-text-muted" />
          <span className="font-medium">
            {confirmed}
            <span className="text-arena-text-muted">/{t.maxParticipants}</span>
            <span className="text-arena-text-muted hidden sm:inline"> {isIndividualGame ? 'players' : 'teams'}</span>
          </span>
        </div>
        <div className="min-w-0 flex items-center gap-1.5 bg-arena-surface border border-arena-border px-2.5 py-1.5 rounded-lg">
          <Trophy size={14} className="text-arena-text-muted" />
          <span className="font-medium">{completedMatches} <span className="text-arena-text-muted hidden sm:inline">matches</span></span>
        </div>
        {liveMatches > 0 && (
          <div className="justify-self-end flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 whitespace-nowrap">
            <Zap size={14} className="fill-current" />
            <span className="font-bold">{liveMatches} live</span>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {t.matches.length > 0 && (
           <div className="w-full h-1.5 bg-arena-border rounded-full overflow-hidden mb-4">
             <div className="h-full bg-linear-to-r from-arena-accent to-[#b5d61f] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
           </div>
        )}

        {t.status === 'draft' && (
          <button
            type="button"
            className="mb-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-400 transition-all hover:bg-orange-500/16 hover:text-orange-300 active:scale-[0.98]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${t.id}`);
            }}
          >
            <FileText size={16} />
            <span>Information Needed</span>
          </button>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-arena-border">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-arena-text-muted uppercase tracking-widest">
            <Clock size={14} />
            {formatDate(t.startDate, { month: 'short', day: 'numeric' })}
          </span>
          <div className="w-8 h-8 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center text-arena-text-muted group-hover:bg-arena-surface-hover group-hover:text-arena-text transition-all group-hover:translate-x-1">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const GAME_CATEGORIES: Record<string, string[]> = {
  'E-Sports': ['valorant', 'league of legends', 'cs2', 'rocket league', 'overwatch 2', 'apex legends', 'smash bros', 'street fighter 6', 'fortnite', 'tekken 8'],
  'Sports': ['soccer', 'american football', 'basketball', 'tennis', 'volleyball', 'badminton', 'table tennis', 'baseball'],
  'Board': ['chess', 'checkers', 'go', 'mahjong', 'scrabble', 'monopoly', 'backgammon'],
  'Card': ['poker', 'uno', 'blackjack', 'magic: the gathering', 'yu-gi-oh', 'hearthstone'],
};

const CATEGORY_TABS = [
  { label: 'All', Icon: LayoutGrid },
  { label: 'E-Sports', Icon: Gamepad2 },
  { label: 'Sports', Icon: Dumbbell },
  { label: 'Board', Icon: Brain },
  { label: 'Card', Icon: Diamond },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const state = useApp();
  const tournaments = state?.tournaments || [];
  const notifications = state?.notifications || [];
  const settings = state?.settings;
  const appSearchQuery = state?.appSearchQuery ?? '';
  const setAppSearchQuery = state?.setAppSearchQuery ?? (() => {});
  const timePrefs = settings?.timePrefs ?? {
    format: '12h',
    timezone: 'America/New_York',
  };

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [focusedSearchResultIndex, setFocusedSearchResultIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const categoryFiltered = categoryFilter === 'All'
    ? tournaments
    : tournaments.filter((t: Tournament) =>
        (GAME_CATEGORIES[categoryFilter] ?? []).includes(t.game.toLowerCase())
      );
  const all = categoryFiltered;
  const active   = all.filter((t: Tournament) => t.status === 'active');
  const upcoming = all.filter((t: Tournament) => t.status === 'registration');
  const drafts   = all.filter((t: Tournament) => t.status === 'draft');
  const other    = all.filter((t: Tournament) => t.status !== 'active' && t.status !== 'registration' && t.status !== 'draft');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchResults = buildAppSearchResults({
    query: appSearchQuery,
    tournaments,
    notifications,
    timePrefs,
  });

  useEffect(() => {
    if (!showSearchResults || searchResults.length === 0) {
      setFocusedSearchResultIndex(-1);
      return;
    }
    setFocusedSearchResultIndex(0);
  }, [showSearchResults, searchResults.length]);

  const handleSelectSearchResult = (path: string) => {
    navigate(path);
    setAppSearchQuery('');
    setShowSearchResults(false);
    setFocusedSearchResultIndex(-1);
    setMobileSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchResults || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSearchResultIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSearchResultIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (focusedSearchResultIndex < 0) return;
      e.preventDefault();
      handleSelectSearchResult(searchResults[focusedSearchResultIndex].path);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchResults(false);
      setFocusedSearchResultIndex(-1);
    }
  };

  const teamTournaments = all.filter((t: Tournament) => !INDIVIDUAL_GAMES.has(t.game.toLowerCase())).length;
  const individualTournaments = all.filter((t: Tournament) => INDIVIDUAL_GAMES.has(t.game.toLowerCase())).length;
  const liveNow = all.reduce((acc: number, t: Tournament) => acc + t.matches.filter(m => m.status === 'live').length, 0);

  const handleCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const nextIndex =
      e.key === 'ArrowRight'
        ? (index + 1) % CATEGORY_TABS.length
        : (index - 1 + CATEGORY_TABS.length) % CATEGORY_TABS.length;
    const nextTab = CATEGORY_TABS[nextIndex];
    setCategoryFilter(nextTab.label);
    categoryTabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 data-[density=compact]:gap-3 mb-10 data-[density=compact]:mb-4 mt-4 xl:mt-8"
      >
        <div>
          <div className="flex items-start justify-between gap-4 md:block">
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-arena-text flex items-center gap-3">
              Arena<span className="text-accent-gradient drop-shadow-md">OPS</span>
            </h1>
            <button
              type="button"
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
              className="md:hidden inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-arena-border bg-arena-surface px-4 text-arena-text-muted shadow-sm transition-colors active:scale-95"
              onClick={() => setMobileSearchOpen((open) => !open)}
            >
              <Search size={18} />
              <span className="text-sm font-semibold">Search</span>
            </button>
          </div>
          <p className="text-arena-text-muted text-lg sm:text-xl font-medium mt-1">Tournament overview & operation center</p>
          {mobileSearchOpen && (
            <div className="md:hidden mt-4 relative" ref={searchRef}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={appSearchQuery}
                onChange={(e) => {
                  setAppSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tournaments, players, rooms..."
                className="w-full rounded-xl border border-arena-border bg-arena-surface pl-10 pr-4 py-3 text-sm text-arena-text placeholder:text-arena-text-muted outline-none focus:border-arena-accent/50 focus:ring-2 focus:ring-arena-accent/15"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-xl border border-arena-border bg-arena-surface shadow-2xl">
                  {searchResults.map((r, i) => (
                    <button
                      key={`${r.path}-${r.label}-${i}`}
                      type="button"
                      className={`flex w-full items-center gap-3 border-b border-arena-border px-4 py-3 text-left transition-colors last:border-0 ${i === focusedSearchResultIndex ? 'bg-arena-surface-hover' : 'hover:bg-arena-surface-hover'}`}
                      onClick={() => handleSelectSearchResult(r.path)}
                      onMouseEnter={() => setFocusedSearchResultIndex(i)}
                    >
                      <r.icon size={15} className="shrink-0 text-arena-accent" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-arena-text">{r.label}</p>
                        <p className="truncate text-xs text-arena-text-muted">{r.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSearchResults && appSearchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-xl border border-arena-border bg-arena-surface px-4 py-3 text-sm text-arena-text-muted shadow-2xl">
                  No results for "{appSearchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl shadow-[0_0_15px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all active:scale-95"
          onClick={() => navigate('/create')}
        >
          Create Tournament <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </motion.div>
      <WelcomeBanner />

      {/* Hero Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 data-[density=compact]:gap-2 mb-12 data-[density=compact]:mb-6"
      >
        {[
          { label: all.length === 1 ? 'Total Tournament' : 'Total Tournaments', value: all.length,          Icon: Trophy,  color: 'text-arena-text',   iconColor: 'text-arena-text-muted',  top: '' },
          { label: active.length === 1 ? 'Active Tournament' : 'Active Tournaments', value: active.length,      Icon: Trophy,  color: 'text-arena-accent', iconColor: 'text-arena-accent',       top: 'border-t-2 border-arena-accent/40', glow: 'shadow-[0_4px_20px_rgba(232,255,71,0.08)]' },
          { label: liveNow === 1 ? 'Match Live' : 'Matches Live',      value: liveNow,             Icon: Zap,     color: liveNow > 0 ? 'text-red-400' : 'text-arena-text', iconColor: liveNow > 0 ? 'text-red-400' : 'text-arena-text-muted', top: liveNow > 0 ? 'border-t-2 border-red-500/40' : '', glow: liveNow > 0 ? 'shadow-[0_4px_20px_rgba(248,113,113,0.08)]' : '' },
          { label: teamTournaments === 1 ? 'Team Tournament' : 'Team Tournaments',  value: teamTournaments,     Icon: Users,   color: 'text-arena-text',   iconColor: 'text-arena-text-muted',  top: '' },
          { label: individualTournaments === 1 ? 'Individual Event' : 'Individual Events', value: individualTournaments, Icon: User, color: 'text-arena-text',   iconColor: 'text-arena-text-muted',  top: '' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className={`glass-panel p-6 data-[density=compact]:p-4 ${stat.top || ''} ${stat.glow || ''}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider">{stat.label}</p>
              <stat.Icon size={15} className={stat.iconColor} />
            </div>
            <p className={`font-display text-4xl md:text-5xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8 data-[density=compact]:mb-4" role="tablist" aria-label="Tournament categories">
        {CATEGORY_TABS.map(({ label, Icon }, index) => (
          <button
            ref={(node) => {
              categoryTabRefs.current[index] = node;
            }}
            key={label}
            onClick={() => setCategoryFilter(label)}
            onKeyDown={(e) => handleCategoryKeyDown(e, index)}
            role="tab"
            aria-selected={categoryFilter === label}
            tabIndex={categoryFilter === label ? 0 : -1}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all active:scale-95 ${
              categoryFilter === label
                ? 'bg-arena-accent text-arena-bg border-arena-accent shadow-[0_0_12px_rgba(232,255,71,0.25)]'
                : 'bg-arena-surface border-arena-border text-arena-text-muted hover:border-arena-accent/40 hover:text-arena-text'
            }`}
          >
            <Icon size={13} /><span>{label}</span>
          </button>
        ))}
      </div>

      {active.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-arena-text flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-arena-accent rounded-full" />
            {active.length === 1 ? 'Active Tournament' : 'Active Tournaments'}
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {active.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-arena-text flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            {upcoming.length === 1 ? 'Open Registration' : 'Open Registrations'}
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {upcoming.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      {drafts.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-arena-text flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-gray-500 rounded-full" />
            {drafts.length === 1 ? 'Draft Tournament' : 'Draft Tournaments'}
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {drafts.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      {other.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-arena-text flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-gray-600 rounded-full" />
            {other.length === 1 ? 'Completed Tournament' : 'Completed Tournaments'}
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {other.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      {all.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="No tournaments yet"
          description="Create your first tournament to get started"
          action={{ label: '+ Create Tournament', onClick: () => navigate('/create') }}
        />
      )}
    </div>
  );
}
