import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useApp } from "../store/store";

export default function ThemeToggle() {
  const { settings, updateSettings } = useApp();
  const location = useLocation();
  const theme = settings.appearance.theme;
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    const showThenHide = () => {
      setVisible(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setVisible(false);
      }, 10000);
    };

    showThenHide();

    window.addEventListener("mousemove", showThenHide);
    window.addEventListener("keydown", showThenHide);
    window.addEventListener("touchstart", showThenHide, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("mousemove", showThenHide);
      window.removeEventListener("keydown", showThenHide);
      window.removeEventListener("touchstart", showThenHide);
    };
  }, []);

  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  const toggleTheme = () => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        theme: isDark ? "light" : "dark",
      },
    });
  };

  const isLandingPage = location.pathname === "/";
  const isRightMenu = settings?.appearance?.mobileMenuPosition !== "left";
  // On landing page it's always on the right. Otherwise, it dodges the mobile menu.
  const positionClass =
    isLandingPage || !isRightMenu
      ? "right-6"
      : "left-6 lg:left-auto lg:right-6";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`fixed bottom-6 ${positionClass} z-50 inline-flex items-center justify-center transition-all duration-500 active:scale-95 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ color: isDark ? "#f3f4f6" : "#111827" }}
    >
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-xl transition-transform duration-300"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(232,255,71,0.16), rgba(232,255,71,0.06))"
            : "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(242,244,247,0.9))",
          borderColor: isDark ? "rgba(232,255,71,0.18)" : "rgba(17,24,39,0.08)",
          boxShadow: isDark
            ? "0 0 28px rgba(232,255,71,0.24), 0 16px 36px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 0 24px rgba(94,107,0,0.12), 0 16px 36px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.75)",
        }}
      >
        {isDark ? (
          <Sun size={18} strokeWidth={2.5} />
        ) : (
          <Moon size={18} strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
