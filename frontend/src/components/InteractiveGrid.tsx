import React, { useEffect, useRef } from 'react';

export default function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };

    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      const px = ((cx / window.innerWidth)  - 0.5) * 30;
      const py = ((cy / window.innerHeight) - 0.5) * 30;
      el.style.setProperty('--cx', `${cx}px`);
      el.style.setProperty('--cy', `${cy}px`);
      el.style.setProperty('--px', `${px}px`);
      el.style.setProperty('--py', `${py}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ '--cx': '50vw', '--cy': '50vh', '--px': '0px', '--py': '0px' } as React.CSSProperties}
    >
      {/* Base dim grid — drifts subtly with cursor for parallax depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(var(--border) 1px, transparent 1px)',
            'linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '50px 50px',
          backgroundPosition: 'var(--px) var(--py)',
        }}
      />

      {/* Neon grid + glowing intersection dots — revealed near cursor via radial mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(var(--accent-rgb), 0.35) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(var(--accent-rgb), 0.35) 1px, transparent 1px)',
            'radial-gradient(circle, rgba(var(--accent-rgb), 1) 1.5px, transparent 1.5px)',
          ].join(', '),
          backgroundSize: '50px 50px, 50px 50px, 50px 50px',
          backgroundPosition: 'var(--px) var(--py)',
          WebkitMaskImage: 'radial-gradient(420px circle at var(--cx) var(--cy), black 0%, transparent 70%)',
          maskImage:        'radial-gradient(420px circle at var(--cx) var(--cy), black 0%, transparent 70%)',
        }}
      />

      {/* Soft accent bloom at cursor position */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(350px circle at var(--cx) var(--cy), rgba(var(--accent-rgb), 0.06), transparent)',
        }}
      />
    </div>
  );
}
