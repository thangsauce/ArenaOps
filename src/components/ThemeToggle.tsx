import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(d => !d)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full shadow-xl border transition-all duration-300 active:scale-95 hover:scale-105"
      style={{
        background: isDark ? '#e8ff47' : '#1a1a2e',
        borderColor: isDark ? 'rgba(232,255,71,0.3)' : 'rgba(255,255,255,0.1)',
        color: isDark ? '#0a0a09' : '#f3f4f6',
        boxShadow: isDark
          ? '0 4px 24px rgba(232,255,71,0.35)'
          : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
    </button>
  );
}
