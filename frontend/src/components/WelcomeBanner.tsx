import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'arenaops_welcomed';
const BURST_COLORS = ['#e8ff47', '#ffffff', '#a8d400', '#ffe566'];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

function createBurst(cx: number, cy: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(1.2, 3.6);
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: rand(1.5, 3.5),
      alpha: 1,
      decay: rand(0.022, 0.034),
      color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
    };
  });
}

function runFireworks(canvas: HTMLCanvasElement, onStop: () => void) {
  const ctx = canvas.getContext('2d')!;
  if (!ctx) return () => {};

  let particles: Particle[] = [];
  let rafId = 0;
  let stopped = false;

  function fireBursts() {
    if (stopped) return;
    const w = canvas.width;
    const h = canvas.height;
    const positions = [w * 0.15, w * 0.5, w * 0.82];
    positions.forEach((bx, i) => {
      setTimeout(() => {
        if (!stopped) particles.push(...createBurst(bx, h * 0.5, Math.floor(rand(28, 40))));
      }, i * 180);
    });
  }

  function loop() {
    if (stopped) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0.01);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.alpha -= p.decay;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(loop);
  }

  fireBursts();
  rafId = requestAnimationFrame(loop);
  const interval = setInterval(fireBursts, 3500);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    clearInterval(interval);
    onStop();
  };
}

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!visible || prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stopRef.current = runFireworks(canvas, () => {});
    return () => {
      stopRef.current?.();
      stopRef.current = null;
      resizeObserver.disconnect();
    };
  }, [visible, prefersReduced]);

  const dismiss = () => {
    stopRef.current?.();
    stopRef.current = null;
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl border mb-6"
          style={{
            background: `rgba(var(--accent-rgb), 0.08)`,
            borderColor: `rgba(var(--accent-rgb), 0.2)`,
          }}
        >
          {/* Canvas fireworks */}
          {!prefersReduced ? (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            />
          ) : (
            <div
              className="absolute top-3 right-10 flex gap-1 pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 px-5 py-4 pr-12">
            <h2 className="font-bold text-lg mb-0.5">
              <span className="text-arena-accent">Welcome to Arena</span>
              <span className="text-arena-text">Ops!</span>
            </h2>
            <p className="text-arena-text-muted text-sm mb-3">
              Here's how to get started in 3 steps:
            </p>
            <div className="flex flex-wrap gap-2">
              {['1. Create a tournament', '2. Add participants', '3. Open Live Control'].map(step => (
                <span
                  key={step}
                  className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{
                    background: `rgba(var(--accent-rgb), 0.12)`,
                    borderColor: `rgba(var(--accent-rgb), 0.25)`,
                    color: 'var(--accent)',
                  }}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={dismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-arena-text-muted hover:text-arena-text hover:bg-arena-surface/50 transition-colors"
            aria-label="Dismiss welcome banner"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
