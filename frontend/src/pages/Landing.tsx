import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import {
  Zap,
  Trophy,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Shield,
  Gamepad2,
  Github,
  Mail,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const games = [
  {
    name: "VALORANT",
    genre: "Tactical FPS",
    format: "5v5",
    color1: "#1a0508",
    color2: "#cc1828",
    accent: "#ff4655",
  },
  {
    name: "LEAGUE OF LEGENDS",
    genre: "MOBA",
    format: "5v5",
    color1: "#020a14",
    color2: "#0d2a4a",
    accent: "#C89B3C",
  },
  {
    name: "CS2",
    genre: "FPS",
    format: "5v5",
    color1: "#08101c",
    color2: "#162244",
    accent: "#4a9eff",
  },
  {
    name: "ROCKET LEAGUE",
    genre: "Sports",
    format: "3v3",
    color1: "#08001a",
    color2: "#200060",
    accent: "#00d4ff",
  },
  {
    name: "OVERWATCH 2",
    genre: "Hero Shooter",
    format: "5v5",
    color1: "#1a0c00",
    color2: "#502800",
    accent: "#ff6b00",
  },
  {
    name: "APEX LEGENDS",
    genre: "Battle Royale",
    format: "3v3",
    color1: "#100000",
    color2: "#3a0800",
    accent: "#fc4d2c",
  },
  {
    name: "SMASH BROS",
    genre: "Fighting",
    format: "1v1",
    color1: "#0e0210",
    color2: "#38003c",
    accent: "#ff2244",
  },
  {
    name: "STREET FIGHTER 6",
    genre: "Fighting",
    format: "1v1",
    color1: "#0a0010",
    color2: "#2a0050",
    accent: "#cc00ff",
  },
  {
    name: "FORTNITE",
    genre: "Battle Royale",
    format: "Squads",
    color1: "#001028",
    color2: "#002060",
    accent: "#00b4ff",
  },
  {
    name: "TEKKEN 8",
    genre: "Fighting",
    format: "1v1",
    color1: "#100008",
    color2: "#3c0020",
    accent: "#ff0066",
  },
];

const features = [
  {
    icon: Trophy,
    title: "Tournament Management",
    desc: "Create and run single-elimination, round-robin, and double-elimination brackets with ease.",
  },
  {
    icon: Zap,
    title: "Live Match Control",
    desc: "Start matches, report scores, handle no-shows, and push real-time updates to all participants.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Collect availability, auto-generate conflict-free schedules, and send confirmation links.",
  },
  {
    icon: MapPin,
    title: "Room Booking",
    desc: "Assign venues, manage time slots, and prevent double-bookings across all your events.",
  },
  {
    icon: Users,
    title: "Participant Tracking",
    desc: "Register teams and players, track check-ins, and manage waitlists automatically.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Give organizers, referees, and volunteers the exact permissions they need — nothing more.",
  },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

type Game = (typeof games)[0];

// ── Interactive grid background ──────────────────────────────────────────────
function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      const px = (cx / window.innerWidth - 0.5) * 30;
      const py = (cy / window.innerHeight - 0.5) * 30;
      el.style.setProperty("--cx", `${cx}px`);
      el.style.setProperty("--cy", `${cy}px`);
      el.style.setProperty("--px", `${px}px`);
      el.style.setProperty("--py", `${py}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={
        {
          "--cx": "50vw",
          "--cy": "50vh",
          "--px": "0px",
          "--py": "0px",
        } as React.CSSProperties
      }
    >
      {/* Base dim grid — drifts subtly with cursor for parallax depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(var(--border) 1px, transparent 1px)",
            "linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "50px 50px",
          backgroundPosition: "var(--px) var(--py)",
        }}
      />

      {/* Neon grid + glowing intersection dots — revealed near cursor via radial mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(var(--accent-rgb), 0.35) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(var(--accent-rgb), 0.35) 1px, transparent 1px)",
            "radial-gradient(circle, rgba(var(--accent-rgb), 1) 1.5px, transparent 1.5px)",
          ].join(", "),
          backgroundSize: "50px 50px, 50px 50px, 50px 50px",
          backgroundPosition: "var(--px) var(--py)",
          WebkitMaskImage:
            "radial-gradient(420px circle at var(--cx) var(--cy), black 0%, transparent 70%)",
          maskImage:
            "radial-gradient(420px circle at var(--cx) var(--cy), black 0%, transparent 70%)",
        }}
      />

      {/* Soft accent bloom at cursor position */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(350px circle at var(--cx) var(--cy), rgba(var(--accent-rgb), 0.06), transparent)",
        }}
      />
    </div>
  );
}

function MarqueeCard({ game }: { game: Game }) {
  return (
    <div
      className="relative shrink-0 w-52 h-32 rounded-2xl overflow-hidden border border-white/10 cursor-pointer group select-none"
      style={{
        background: `linear-gradient(135deg, ${game.color1} 0%, ${game.color2} 100%)`,
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 75% 25%, ${game.accent}55 0%, transparent 65%)`,
        }}
      />
      {/* Corner bloom */}
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: game.accent }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <p
          className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1 opacity-80"
          style={{ color: game.accent }}
        >
          {game.format} · {game.genre}
        </p>
        <p className="font-display text-white text-lg leading-tight">
          {game.name}
        </p>
      </div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-2xl cursor-pointer group border border-white/10 h-44 hover:-translate-y-1 transition-transform duration-300"
      style={{
        background: `linear-gradient(135deg, ${game.color1} 0%, ${game.color2} 100%)`,
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 80% 15%, ${game.accent}45 0%, transparent 60%)`,
        }}
      />
      {/* Corner bloom */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: game.accent }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${game.accent}55`,
              color: game.accent,
              backgroundColor: `${game.accent}18`,
            }}
          >
            {game.genre}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            {game.format}
          </span>
        </div>
        <h3 className="font-display text-white text-2xl leading-tight">
          {game.name}
        </h3>
      </div>
      {/* Hover overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
        <span className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-white/10 border border-white/25 backdrop-blur-sm">
          Browse Tournaments <ArrowRight size={12} />
        </span>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arena-bg relative overflow-hidden font-sans text-arena-text flex flex-col">
      {/* Interactive cursor-reactive grid background */}
      <InteractiveGrid />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-arena-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-arena-accent/10 rounded-lg text-arena-accent">
            <Zap size={22} className="fill-current" />
          </div>
          <span className="font-display tracking-wide text-2xl font-bold">
            ArenaOPS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-sm font-medium text-arena-text-muted hover:text-arena-text transition-colors"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
          <button
            className="px-5 py-2 text-sm font-bold text-arena-bg bg-arena-accent hover:bg-arena-accent-hover rounded-lg shadow-[0_0_20px_rgba(232,255,71,0.2)] hover:shadow-[0_0_30px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate("/register")}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-accent mb-8 shadow-lg"
        >
          <Zap size={14} className="fill-current" />
          <span className="tracking-wider uppercase">
            University Esports Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight mb-6"
        >
          Run your tournaments.
          <br />
          <span className="text-accent-gradient drop-shadow-md">
            Not spreadsheets.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-arena-text-muted mb-10 leading-relaxed"
        >
          ArenaOPS is the all-in-one tournament management platform built for
          university esports clubs — from first registration to final bracket,
          live on game day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.25)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate("/register")}
          >
            Create an account
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-arena-text-muted font-medium"
        >
          No credit card required · Made for university clubs
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
              { num: "50+", label: "Active clubs" },
              { num: "2,400+", label: "Tournaments run" },
              { num: "18k+", label: "Players managed" },
              { num: "99.9%", label: "Uptime on game day" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center text-center px-4"
              >
                <span className="font-display text-4xl md:text-5xl text-arena-accent font-bold mb-1 drop-shadow-[0_0_15px_rgba(232,255,71,0.3)]">
                  {stat.num}
                </span>
                <span className="text-sm text-arena-text-muted font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── GAMES SECTION ── */}
      <section className="relative py-20 z-10">
        {/* Section ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/5 blur-[120px] rounded-full" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full" />
        </div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-6 mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-accent mb-6 shadow-lg">
            <Gamepad2 size={14} />
            <span className="tracking-wider uppercase">10 Supported Games</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            Your game.
            <br />
            <span className="text-accent-gradient">Your tournament.</span>
          </h2>
          <p className="text-arena-text-muted text-lg max-w-xl mx-auto">
            From FPS to fighting games — run professional tournaments for every
            major esports title.
          </p>
        </motion.div>

        {/* Marquee strip 1 — scrolling left */}
        <div
          className="relative mb-4 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="flex gap-4 w-max marquee-track animate-marquee-left px-4">
            {[...games, ...games].map((game, i) => (
              <MarqueeCard key={i} game={game} />
            ))}
          </div>
        </div>

        {/* Marquee strip 2 — scrolling right */}
        <div
          className="relative mb-16 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="flex gap-4 w-max marquee-track animate-marquee-right px-4">
            {[...[...games].reverse(), ...[...games].reverse()].map(
              (game, i) => (
                <MarqueeCard key={i} game={game} />
              ),
            )}
          </div>
        </div>

        {/* Games grid */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-arena-text">
              Browse Tournaments
            </h3>
            <span className="text-sm text-arena-text-muted font-medium">
              {games.length} games available
            </span>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {games.map((game) => (
              <GameCard key={game.name} game={game} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6 z-10 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              Everything your club needs
            </h2>
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
                <h3 className="text-xl font-bold text-arena-text mb-2">
                  {title}
                </h3>
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
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              Ready to level up your events?
            </h2>
            <p className="text-arena-text-muted text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of university clubs already using ArenaOPS.
            </p>
            <button
              className="group flex items-center justify-center gap-2 px-8 py-4 mx-auto bg-arena-accent hover:bg-[#dfff00] text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.2)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
              onClick={() => navigate("/register")}
            >
              Create your an account{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      <ThemeToggle />

      {/* Footer */}
      <footer className="relative z-10">
        {/* Accent gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-arena-accent/40 to-transparent" />

        <div className="border-t border-arena-border bg-arena-surface/20 backdrop-blur-sm">
          {/* Main footer grid */}
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Brand column */}
              <div className="md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-arena-accent/10 rounded-lg text-arena-accent">
                    <Zap size={18} className="fill-current" />
                  </div>
                  <span className="font-display tracking-wide text-xl font-bold">
                    ArenaOPS
                  </span>
                </div>
                <p className="text-sm text-arena-text-muted leading-relaxed mb-6 max-w-xs">
                  The all-in-one tournament platform built for university
                  esports clubs — from first registration to final bracket.
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { icon: Github, label: "GitHub" },
                    { icon: Globe, label: "Website" },
                    { icon: Mail, label: "Email" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      aria-label={label}
                      className="w-9 h-9 rounded-lg border border-arena-border bg-arena-surface/50 flex items-center justify-center text-arena-text-muted hover:text-arena-accent hover:border-arena-accent/30 hover:bg-arena-accent/5 transition-all duration-200"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform links */}
              <div>
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-5">
                  Platform
                </h4>
                <ul className="space-y-3">
                  {[
                    "Tournament Management",
                    "Live Match Control",
                    "Smart Scheduling",
                    "Room Booking",
                    "Participant Tracking",
                    "Role-Based Access",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-5">
                  Resources
                </h4>
                <ul className="space-y-3">
                  {[
                    "Documentation",
                    "API Reference",
                    "Changelog",
                    "System Status",
                    "Support Center",
                    "Community",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-5">
                  Legal
                </h4>
                <ul className="space-y-3">
                  {[
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "Data Processing",
                    "Contact Us",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-arena-border">
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-arena-text-muted">
                © 2026 ArenaOPS · All rights reserved
              </p>
              <div className="flex items-center gap-1.5 text-xs text-arena-text-muted">
                <span>Made for university clubs</span>
                <span className="text-arena-border">·</span>
                <span className="text-arena-accent font-semibold">
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
