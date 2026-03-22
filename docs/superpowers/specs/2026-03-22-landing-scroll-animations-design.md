# Landing Page Scroll Animations — Design Spec
**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add consistent scroll-triggered "fade up" reveal animations to all major content sections of `Landing.tsx`. As the user scrolls down, text and mockup images animate into view. All new animations fire once on first scroll into view and do not repeat. Existing animations on excluded sections must not be modified.

---

## Animation Parameters (Option A — Gentle Float)

| Property | Value |
|---|---|
| Initial state | `opacity: 0, y: 22` |
| Animated state | `opacity: 1, y: 0` |
| Duration | `0.55s` |
| Easing | `ease` |
| Viewport trigger margin | `-80px` (triggers slightly before fully on-screen) |
| Repeat | `once: true` |
| Grid stagger interval | `120ms` between each child item (`staggerChildren: 0.12`) |

---

## Components

Two reusable components defined at the top of `Landing.tsx` (no new file needed):

### `<FadeUp>`

Wraps any single block — a heading, paragraph, or button group. Accepts an optional `delay` prop (number in seconds) for manual cascading.

```tsx
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### `<FadeUpGrid>` + `<FadeUpItem>`

Container/child pair for grids. The container sets `staggerChildren: 0.12` so each `<FadeUpItem>` inherits its delay automatically — no manual delay needed on the children. The `item` variant key must match between container and child.

```tsx
const fadeUpGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUpItemVariants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function FadeUpGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUpGridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeUpItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUpItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
```

---

## Application Scope

### Games section (lines ~3478–3596)

| Element | Treatment |
|---|---|
| Section heading (`<h2>` with per-word blur slide-in `whileInView`) | ❌ Leave alone — already animated |
| Subtext `<p>` (line ~3525) — plain `<p>`, no current animation | Wrap in `<FadeUp>` |
| Category tab buttons grid `<div>` (the flex container holding all 4 `CategoryButton`s) | Wrap the grid `<div>` itself in a single `<FadeUp>` — do **not** use `<FadeUpGrid>/<FadeUpItem>` here. `CategoryButton` renders a `motion.button` with `useSpring`-driven `x`/`y` values; wrapping individual buttons in `FadeUpItem` would cause Framer Motion variant leakage into those spring values. |
| Browse card marquee strips | ❌ Leave alone — auto-scrolling, would flicker |
| Mobile horizontal card scroller | ❌ Leave alone — same reason |

### Features section — "Everything your club needs" (lines ~3598–4304)

**Section heading + subtext** (`ref={clubHeadingRef}` / `ref={mobileClubHeadingRef}`): ❌ Leave alone — custom impact/crack phase animation driven by `useInView`. Do not add any wrapper.

**Feature showcase rows (5 rows total).** Each row currently wraps the entire row in one `motion.div` with `{ opacity: 0, y: 40 }`. Replace with split animations:

- Remove the existing `motion.div` wrapper from each row (or convert to a plain `div`)
- Wrap the **text side** `<div className="flex-1 ...">` in `<FadeUp>`
- Wrap the **mockup side** `<div className="flex-1 ...">` in a `motion.div` with a horizontal slide-in, per the table below

> **Row child order note:** Rows 2 and 4 use `flex-col-reverse lg:flex-row` and place the **mockup `div` first** in JSX (it appears on the left visually due to flex-reverse). For these rows, the text-side `<div className="flex-1">` is the **second** child in JSX. Rows 1, 3, and 5 use `flex-col lg:flex-row` and place text first, mockup second in JSX.

| Row | Layout class | Mockup position | Slide-in direction |
|---|---|---|---|
| 1 · Tournament Management | `flex-col lg:flex-row` | Right | `initial: { opacity: 0, x: 60 }` → `whileInView: { opacity: 1, x: 0 }` |
| 2 · Live Match Control | `flex-col-reverse lg:flex-row` | Left | `initial: { opacity: 0, x: -60 }` → `whileInView: { opacity: 1, x: 0 }` |
| 3 · Schedule | `flex-col lg:flex-row` | Right | `initial: { opacity: 0, x: 60 }` → `whileInView: { opacity: 1, x: 0 }` |
| 4 · Participants & Notifications | `flex-col-reverse lg:flex-row` | Left | `initial: { opacity: 0, x: -60 }` → `whileInView: { opacity: 1, x: 0 }` |
| 5 · Share Event | `flex-col lg:flex-row` | Right | `initial: { opacity: 0, x: 60 }` → `whileInView: { opacity: 1, x: 0 }` |

Mockup slide-in parameters: `duration: 0.55`, `ease: "easeOut"`, `viewport: { once: true, margin: "-80px" }`.

Both text and mockup sides trigger at the same scroll point — text floats up while mockup slides in from its side simultaneously.

> **Note:** The existing rows use `ease: [0.22, 1, 0.36, 1]`. This spec intentionally replaces that with `ease: "easeOut"` to be consistent with the rest of the page's new animations.

### CTA Banner (lines ~4306–4410)

The banner heading contains an inner `motion.span` with a bounce/glow `whileInView` effect (`once: false`) on the word "level". This must be preserved exactly as-is.

Treatment: wrap the `<div className="relative z-10">` (line ~4324, containing the `<h2>`, `<p>`, and `<button>`) in a single `<FadeUp>` with no delay. The `<Parallax>` component that wraps the entire banner remains the outer wrapper and is **not** touched — `<FadeUp>` sits inside `<Parallax>`, directly around the content block only. The inner `motion.span` bounce will fire independently after the container fades in.

```tsx
<Parallax ...>                  {/* unchanged outer wrapper */}
  {/* decorative elements unchanged */}
  <FadeUp>
    <div className="relative z-10">
      <h2>...</h2>              {/* inner motion.span bounce preserved */}
      <p>...</p>
      <button>...</button>
    </div>
  </FadeUp>
</Parallax>
```

Also add `<FadeUp>` around the Features section `<p>` subtext at line ~3929 ("Purpose-built for the chaos of running tournaments at scale.").

### Sections left completely alone

| Section | Reason |
|---|---|
| Hero section (heading, subtitle, CTA buttons, formats chips) | Load-triggered `animate=` animations; visible on page load — no scroll needed |
| Stats row | Already has `whileInView` stagger, keep as-is |
| "Built for clubs" / "Everything your club needs" heading | Custom `useInView` impact/crack phase animation |
| Per-word blur slide-in animations in Games heading | Already have `whileInView`, keep as-is |
| Browse card marquee strips | Auto-scrolling; `whileInView` would cause flicker |
| Mobile horizontal card scroller | Same reason as marquee |
| Footer | Already has `whileInView fadeUp` variant |

> **Important:** Do not modify the `viewport` settings on any excluded section. "Consistent viewport settings" in this spec applies only to newly added animations.

---

## Implementation Notes

- All four components (`FadeUp`, `FadeUpGrid`, `FadeUpItem`, and the two variant objects) are defined at the top of `Landing.tsx` alongside the existing `staggerContainer` and `fadeUp` variants. No new files needed.
- `FadeUpGrid` passes variants down to children via Framer Motion's variant propagation — `FadeUpItem` children must not set their own `initial`/`animate` props (only `variants`).
- The `delay` prop on `<FadeUp>` is in seconds (e.g. `delay={0.1}`).
- All new `viewport` configs use `{ once: true, margin: "-80px" }` — do not change existing viewport configs on excluded elements.
