import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useApp } from '../../store/store';
import ThemeToggle from '../ThemeToggle';
import InteractiveGrid from '../InteractiveGrid';
import { useEffect } from 'react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const state = useApp();
  const density = state?.settings?.appearance?.density || 'comfortable';

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto lg:ml-64 relative z-10 p-4 md:p-8 scroll-smooth">
        {/* Mobile Hamburger Header */}
        <div className="flex items-center justify-between lg:hidden mb-6">
          <span className="font-display font-bold text-2xl tracking-wide text-arena-accent">ArenaOPS</span>
          <button
            className="p-2 -mr-2 text-arena-text-muted hover:text-arena-text transition-colors"
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
        
        <Outlet />
      </main>
      <ThemeToggle />
    </div>
  );
}
