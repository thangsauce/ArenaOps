import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Zap, Trophy, Calendar, MapPin, Users, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const features = [
  {
    icon: Trophy,
    title: 'Tournament Management',
    desc: 'Create and run single-elimination, round-robin, and double-elimination brackets with ease.',
  },
  {
    icon: Zap,
    title: 'Live Match Control',
    desc: 'Start matches, report scores, handle no-shows, and push real-time updates to all participants.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    desc: 'Collect availability, auto-generate conflict-free schedules, and send confirmation links.',
  },
  {
    icon: MapPin,
    title: 'Room Booking',
    desc: 'Assign venues, manage time slots, and prevent double-bookings across all your events.',
  },
  {
    icon: Users,
    title: 'Participant Tracking',
    desc: 'Register teams and players, track check-ins, and manage waitlists automatically.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Give organizers, referees, and volunteers the exact permissions they need — nothing more.',
  },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arena-bg relative overflow-hidden font-sans text-arena-text flex flex-col">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-arena-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 bg-arena-accent/10 rounded-lg text-arena-accent">
            <Zap size={22} className="fill-current" />
          </div>
          <span className="font-display tracking-wide text-2xl font-bold">ArenaOPS</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 text-sm font-medium text-arena-text-muted hover:text-arena-text transition-colors"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
          <button 
            className="px-5 py-2 text-sm font-bold text-arena-bg bg-arena-accent hover:bg-arena-accent-hover rounded-lg shadow-[0_0_20px_rgba(232,255,71,0.2)] hover:shadow-[0_0_30px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate('/register')}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center z-10 flex-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-accent mb-8 shadow-lg"
        >
          <Zap size={14} className="fill-current" />
          <span className="tracking-wider uppercase">University Esports Platform</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight mb-6"
        >
          Run your tournaments.<br />
          <span className="text-accent-gradient drop-shadow-md">Not spreadsheets.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-arena-text-muted mb-10 leading-relaxed"
        >
          ArenaOPS is the all-in-one tournament management platform built for university esports clubs —
          from first registration to final bracket, live on game day.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button 
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.25)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate('/register')}
          >
            Create free account 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            className="w-full sm:w-auto px-8 py-4 glass-card font-semibold text-white hover:bg-white/5 disabled:opacity-50 transition-all active:scale-95"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </motion.div>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-arena-text-muted font-medium"
        >
            No credit card required · Free for university clubs
        </motion.p>
      </section>

      {/* Stats bar */}
      <div className="relative z-10 border-y border-arena-border bg-arena-surface/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-10">
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-arena-border"
            >
                {[
                    { num: '50+', label: 'Active clubs' },
                    { num: '2,400+', label: 'Tournaments run' },
                    { num: '18k+', label: 'Players managed' },
                    { num: '99.9%', label: 'Uptime on game day' }
                ].map((stat, i) => (
                    <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center px-4">
                        <span className="font-display text-4xl md:text-5xl text-arena-accent font-bold mb-1 drop-shadow-[0_0_15px_rgba(232,255,71,0.3)]">{stat.num}</span>
                        <span className="text-sm text-arena-text-muted font-medium uppercase tracking-wider">{stat.label}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </div>

      {/* Features */}
      <section className="relative py-24 px-6 z-10 flex-1">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Everything your club needs</h2>
            <p className="text-arena-text-muted text-lg max-w-2xl mx-auto">
                Purpose-built for the chaos of running esports events at scale.
            </p>
            </div>
            
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {features.map(({ icon: Icon, title, desc }) => (
                <motion.div 
                    key={title} 
                    variants={fadeUp} 
                    className="glass-card p-6 flex flex-col group hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-xl bg-arena-accent/10 border border-arena-accent/20 flex items-center justify-center text-arena-accent mb-6 group-hover:scale-110 group-hover:bg-arena-accent group-hover:text-arena-bg transition-all duration-300">
                        <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-arena-text mb-2">{title}</h3>
                    <p className="text-arena-text-muted leading-relaxed">{desc}</p>
                </motion.div>
            ))}
            </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto glass-panel p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Ready to level up your events?</h2>
                <p className="text-arena-text-muted text-lg mb-8 max-w-xl mx-auto">Join hundreds of university clubs already using ArenaOPS.</p>
                <button 
                    className="group flex items-center justify-center gap-2 px-8 py-4 mx-auto bg-arena-accent hover:bg-[#dfff00] text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.2)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
                    onClick={() => navigate('/register')}
                >
                    Create your free account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </section>

      <ThemeToggle />

      {/* Footer */}
      <footer className="border-t border-arena-border bg-arena-surface/50 py-8 px-6 mt-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 opacity-50">
                <Zap size={18} className="text-arena-accent fill-current" />
                <span className="font-display font-bold tracking-wide text-lg">ArenaOPS</span>
            </div>
            <p className="text-sm text-arena-text-muted font-medium">© 2026 ArenaOPS · Built for university esports</p>
        </div>
      </footer>
    </div>
  );
}
