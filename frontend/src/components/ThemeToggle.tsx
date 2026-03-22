import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../store/store';

export default function ThemeToggle() {
  const { settings, updateSettings } = useApp();
  const theme = settings.appearance.theme;
  const [prefersDark, setPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  const toggleTheme = () => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        theme: isDark ? 'light' : 'dark',
      },
    });
  };

  return (
    <button
      onClick={toggleTheme}
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
