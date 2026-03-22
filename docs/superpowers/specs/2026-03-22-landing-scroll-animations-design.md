# Landing Page Scroll Animations — Design Spec
**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add consistent scroll-triggered "fade up" reveal animations to all major content sections of `Landing.tsx`. As the user scrolls down the page, text, cards, and mockup images animate into view. All animations trigger once (on first scroll into view) and do not repeat.

---

## Animation Parameters (Option A — Gentle Float)

| Property | Value |
|---|---|
| Initial state | `opacity: 0, y: 22` |
| Animated state | `opacity: 1, y: 0` |
| Duration | `0.55s` |
| Easing | `ease` |
| Viewport trigger margin | `-80px` (triggers slightly before fully on-screen) |
| Repeat | `once: true` (fires once on first scroll into view) |
| Grid stagger interval | `120ms` between each child item |

---

## Components

Two reusable components defined at the top of `Landing.tsx` (no new file needed):

### `<FadeUp>`
Wraps any single block — heading, paragraph, button group, or standalone image. Accepts an optional `delay` prop (number, seconds) for manual cascading.

```tsx
<FadeUp delay={0.1}>
  <h2>Section heading</h2>
</FadeUp>
```

### `<FadeUpGrid>` + `<FadeUpItem>`
Container/child pair for any grid of cards or tiles. The container sets `staggerChildren: 0.12` so each child inherits its delay automatically.

```tsx
<FadeUpGrid>
  <FadeUpItem><FeatureCard ... /></FadeUpItem>
  <FadeUpItem><FeatureCard ... /></FadeUpItem>
  <FadeUpItem><FeatureCard ... /></FadeUpItem>
</FadeUpGrid>
```

---

## Application Scope

### Sections that get animated

| Section | Treatment |
|---|---|
| Games section — heading + subtext | `<FadeUp>` |
| Feature cards grid | `<FadeUpGrid>` + `<FadeUpItem>` per card |
| Formats section — heading + subtext | `<FadeUp>` |
| Formats section — chip row | `<FadeUp delay={0.1}>` |
| Formats section — detail card | `<FadeUp delay={0.2}>` |
| Step-by-step / how-it-works rows — text side | `<FadeUp>` |
| CTA banner — heading, subtext, button group | `<FadeUp>` with cascading delay |

### Feature showcase rows (slide-in mockups)

The "Everything Your Club Needs" section has 4 alternating rows (text + mockup). Each side animates independently:

- **Text side**: `<FadeUp>` (y: 22 → 0, same as everywhere else)
- **Mockup side**: Slide in from the direction it sits on screen:
  - Mockup on the **right** (rows 1 & 3): `initial: { opacity: 0, x: 60 }` → `whileInView: { opacity: 1, x: 0 }`
  - Mockup on the **left** (rows 2 & 4): `initial: { opacity: 0, x: -60 }` → `whileInView: { opacity: 1, x: 0 }`
  - Duration: `0.55s`, easing: `ease`, `once: true`
- Both sides trigger at the same scroll point so text floats up while mockup slides in simultaneously.

### Sections deliberately left alone

| Section | Reason |
|---|---|
| Hero heading | Custom typewriter / scorecard reveal animation |
| "Built for clubs" heading | Custom impact/crack phase animation with `useInView` |
| Word-blur slide-in animations | Already have `whileInView`, keep as-is |
| Stats row | Already has `whileInView` stagger, keep as-is |
| Browse card marquee strips | Auto-scrolling; `whileInView` would flicker mid-scroll |
| Mobile horizontal card scroller | Same reason as marquee strips |
| Footer | Already has `whileInView fadeUp` variant |

---

## Implementation Notes

- Both `<FadeUp>` and `<FadeUpGrid>/<FadeUpItem>` use Framer Motion (`motion.div` + `whileInView`) — no new dependencies.
- The existing feature showcase rows currently wrap the entire row in a single `motion.div` with `y: 40`. These will be replaced: the row wrapper becomes a plain `div`, and text/mockup sides each get their own independent animation.
- All new animations use `viewport={{ once: true, margin: "-80px" }}` consistently.
- The `delay` prop on `<FadeUp>` accepts a number in seconds (e.g. `delay={0.1}`).
