import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Zap, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../store/store';
import type { Tournament } from '../types';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const statusColors: Record<string, string> = {
  active: 'text-arena-accent',
  registration: 'text-blue-400',
  draft: 'text-gray-500',
  completed: 'text-gray-400',
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

function TournamentCard({ t }: { t: Tournament }) {
  const navigate = useNavigate();
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
          <h3 className="text-lg font-bold text-white group-hover:text-arena-accent transition-colors truncate pr-2">{t.name}</h3>
          <p className="text-sm text-gray-400 mt-1 capitalize">{t.game} <span className="ox-2 opacity-50">•</span> {t.format.replace(/-/g, ' ')}</p>
        </div>
        <div className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border flex items-center gap-1.5 whitespace-nowrap ${statusColors[t.status]} ${statusBgs[t.status]}`}>
          {liveMatches > 0 && <span className="w-1.5 h-1.5 rounded-full bg-arena-accent shadow-[0_0_8px_rgba(232,255,71,0.8)] animate-pulse" />}
          {statusLabels[t.status]}
        </div>
      </div>

      <div className="flex items-center gap-4 data-[density=compact]:gap-2 text-sm text-gray-300 mb-6 data-[density=compact]:mb-3">
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
          <Users size={14} className="text-gray-500" />
          <span className="font-medium">{confirmed}<span className="text-gray-500">/{t.maxParticipants}</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
          <Trophy size={14} className="text-gray-500" />
          <span className="font-medium">{completedMatches} <span className="text-gray-500 hidden sm:inline">matches</span></span>
        </div>
        {liveMatches > 0 && (
          <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 ml-auto">
            <Zap size={14} className="fill-current" />
            <span className="font-bold">{liveMatches} live</span>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {t.matches.length > 0 && (
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
             <div className="h-full bg-gradient-to-r from-arena-accent to-[#b5d61f] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
           </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <Clock size={14} />
            {t.startDate}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all group-hover:translate-x-1">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const GAME_CATEGORIES: Record<string, string[]> = {
  'E-Sports':     ['valorant', 'league of legends', 'cs2', 'rocket league', 'overwatch 2', 'apex legends', 'smash bros', 'street fighter 6', 'fortnite', 'tekken 8'],
  'Sports':       ['soccer', 'american football', 'basketball', 'tennis', 'volleyball', 'badminton', 'table tennis', 'baseball'],
  'Board & Card': ['chess', 'checkers', 'poker', 'magic: the gathering', 'hearthstone', 'go'],
};

const CATEGORY_TABS = [
  { label: 'All',          icon: '🎮' },
  { label: 'E-Sports',     icon: '⚡' },
  { label: 'Sports',       icon: '🏆' },
  { label: 'Board & Card', icon: '♟️' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const state = useApp();
  const tournaments = state?.tournaments || [];

  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = categoryFilter === 'All'
    ? tournaments
    : tournaments.filter((t: Tournament) =>
        (GAME_CATEGORIES[categoryFilter] ?? []).includes(t.game.toLowerCase())
      );
  const active   = filtered.filter((t: Tournament) => t.status === 'active');
  const upcoming = filtered.filter((t: Tournament) => t.status === 'registration');
  const all      = filtered;

  const totalParticipants = all.reduce((acc: number, t: Tournament) => acc + t.participants.filter(p => p.status === 'confirmed').length, 0);
  const liveNow = all.reduce((acc: number, t: Tournament) => acc + t.matches.filter(m => m.status === 'live').length, 0);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 data-[density=compact]:gap-3 mb-10 data-[density=compact]:mb-4 mt-4 xl:mt-8"
      >
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
            <span className="text-accent-gradient drop-shadow-md">Arena</span>OPS
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl font-medium mt-1">Tournament overview & operation center</p>
        </div>
        <button 
          className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-arena-accent hover:bg-[#dfff00] text-arena-bg font-bold rounded-xl shadow-[0_0_15px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all active:scale-95"
          onClick={() => navigate('/create')}
        >
          Create Tournament <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </motion.div>

      {/* Hero Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 data-[density=compact]:gap-2 mb-12 data-[density=compact]:mb-6"
      >
        {[
          { label: 'Total Tournaments', value: all.length },
          { label: 'Active Now', value: active.length, color: 'text-arena-accent', glow: 'shadow-[0_4px_20px_rgba(232,255,71,0.1)]' },
          { label: 'Participants', value: totalParticipants },
          { label: 'Matches Live', value: liveNow, color: 'text-red-400', glow: liveNow > 0 ? 'shadow-[0_4px_20px_rgba(248,113,113,0.1)] border-red-500/20' : '' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className={`glass-panel p-6 data-[density=compact]:p-4 ${stat.glow || ''}`}>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`font-display text-4xl md:text-5xl font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8 data-[density=compact]:mb-4">
        {CATEGORY_TABS.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setCategoryFilter(label)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all active:scale-95 ${
              categoryFilter === label
                ? 'bg-arena-accent text-arena-bg border-arena-accent shadow-[0_0_12px_rgba(232,255,71,0.25)]'
                : 'bg-arena-surface border-arena-border text-arena-text-muted hover:border-arena-accent/40 hover:text-arena-text'
            }`}
          >
            <span>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>

      {active.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-arena-accent rounded-full" />
            Active Tournaments
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {active.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12 data-[density=compact]:mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            Open Registration
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
            {upcoming.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
          </motion.div>
        </section>
      )}

      <section className="mb-12 data-[density=compact]:mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 data-[density=compact]:mb-3">
          <div className="w-2 h-6 bg-gray-600 rounded-full" />
          All Tournaments
        </h2>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 data-[density=compact]:gap-3">
          {all.map((t: Tournament) => <TournamentCard key={t.id} t={t} />)}
        </motion.div>
      </section>
    </div>
  );
}
