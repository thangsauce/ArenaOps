import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useApp } from "../../store/store";
import ThemeToggle from "../ThemeToggle";
import InteractiveGrid from "../InteractiveGrid";
import { ArrowUp, ArrowUpRight, ChevronDown } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLiveMenu, setShowLiveMenu] = useState(false);
  const state = useApp();
  const mainRef = useRef<HTMLElement | null>(null);
  const liveMenuRef = useRef<HTMLDivElement | null>(null);
  const density = state?.settings?.appearance?.density || "comfortable";
  const liveTournaments = useMemo(
    () => (state?.tournaments ?? []).filter((t) => t.status === "active"),
    [state?.tournaments],
  );
  const featuredTournament = useMemo(() => {
    const tournaments = state?.tournaments ?? [];
    return (
      liveTournaments[0] ??
      tournaments.find((t) => t.status === "registration") ??
      tournaments[0] ??
      null
    );
  }, [liveTournaments, state?.tournaments]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      setShowScrollTop(main.scrollTop > 240);
    };

    handleScroll();
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showLiveMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        liveMenuRef.current &&
        !liveMenuRef.current.contains(event.target as Node)
      ) {
        setShowLiveMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showLiveMenu]);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-arena-bg flex font-sans text-arena-text overflow-hidden relative transition-colors duration-300">
      {/* Interactive grid background */}
      <InteractiveGrid />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-10%] left-1/3 w-200 h-125 bg-arena-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-150 h-150 bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed left */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main
        ref={mainRef}
        className="flex-1 flex flex-col h-screen overflow-y-auto lg:ml-64 relative z-10 p-4 md:p-8 scroll-smooth"
      >
        {/* Mobile Hamburger Header */}
        <div
          className={`flex items-center justify-between lg:hidden mb-6 ${state?.settings?.appearance?.mobileMenuPosition === "left" ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="font-display font-bold text-2xl tracking-wide text-arena-accent">
            ArenaOPS
          </span>
          <button
            className={`p-2 ${state?.settings?.appearance?.mobileMenuPosition === "left" ? "-ml-2" : "-mr-2"} text-arena-text-muted hover:text-arena-text transition-colors`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-3/4 bg-current rounded-full self-end" />
            </div>
          </button>
        </div>

        {featuredTournament && (
          <div className="mb-4 flex justify-end">
            {liveTournaments.length > 1 ? (
              <div ref={liveMenuRef} className="relative">
                <button
                  type="button"
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/25 bg-arena-surface px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:border-red-400/40 hover:text-red-300"
                  onClick={() => setShowLiveMenu((prev) => !prev)}
                  aria-expanded={showLiveMenu}
                  aria-haspopup="menu"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)] animate-pulse" />
                  <span className="truncate">
                    Live: {liveTournaments.length} tournaments
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform ${showLiveMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showLiveMenu && (
                  <div className="absolute right-0 mt-2 flex min-w-65 flex-col gap-1 rounded-2xl border border-arena-border bg-arena-surface p-2 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                    {liveTournaments.map((tournament) => (
                      <Link
                        key={tournament.id}
                        to={`/tournaments/${tournament.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-arena-text-muted transition-colors hover:bg-arena-surface-hover hover:text-arena-text"
                        onClick={() => setShowLiveMenu(false)}
                      >
                        <span className="truncate">{tournament.name}</span>
                        <ArrowUpRight size={14} className="shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={`/tournaments/${featuredTournament.id}`}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border bg-arena-surface px-4 py-2 text-sm font-semibold transition-colors ${
                  liveTournaments.length === 1
                    ? "border-red-500/25 text-red-400 hover:border-red-400/40 hover:text-red-300"
                    : "border-arena-border text-arena-text-muted hover:border-arena-accent/40 hover:text-arena-text"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    liveTournaments.length === 1
                      ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)] animate-pulse"
                      : "bg-arena-accent"
                  }`}
                />
                <span className="truncate">
                  {liveTournaments.length === 1 ? "Live" : "Tournament"}:{" "}
                  {featuredTournament.name}
                </span>
                <ArrowUpRight size={14} className="shrink-0" />
              </Link>
            )}
          </div>
        )}

        <Outlet />

        <div
          className={`pointer-events-none fixed bottom-6 left-0 right-0 z-30 transition-all duration-300 ease-out md:bottom-8 lg:left-64 ${
            showScrollTop
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto w-full px-4 md:px-8">
            <div className="mx-auto flex w-full max-w-7xl justify-center">
              <button
                type="button"
                onClick={scrollToTop}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-arena-accent/30 bg-arena-surface/95 text-arena-text shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-300 hover:border-arena-accent/50 hover:text-arena-accent ${
                  showScrollTop
                    ? "pointer-events-auto scale-100"
                    : "pointer-events-none scale-95"
                }`}
                aria-label="Back to top"
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>
      <ThemeToggle />
    </div>
  );
}
