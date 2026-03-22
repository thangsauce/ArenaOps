# Landing Page Scroll Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll-triggered "gentle float" (fade + 22px up) animations to all major content sections of the landing page, with horizontal slide-ins for feature showcase mockup images.

**Architecture:** All changes are isolated to `frontend/src/pages/Landing.tsx`. Three new helper components (`FadeUp`, `FadeUpGrid`, `FadeUpItem`) and two variant objects are inserted once near the top of the file, then used as wrappers throughout. No new files are created.

**Tech Stack:** React 18, TypeScript, Framer Motion (already imported — `motion`, `useInView`, `useMotionValue`, `useSpring` from `framer-motion`)

---

## File Map

| File | Change |
|---|---|
| `frontend/src/pages/Landing.tsx` | Only file modified. All tasks below touch this file. |

> **Do not touch** any other file. `FadeUpGrid`/`FadeUpItem` are defined in this file for now; they have no current use for grids on this page but are available for future use.

---

> **Note on testing:** These are pure visual animation changes. There are no unit-testable behaviours. Each task uses TypeScript compilation (`npm run build` invokes `tsc -b`) as the automated check, and browser scroll-testing as acceptance. Run `npm run dev` from `frontend/` to preview.

---

## Task 1: Define FadeUp helper components

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:2527–2540` (after the existing animation variants block)

- [ ] **Step 1: Insert the new animation helpers after line 2540**

  Find the block ending at line 2540 (after `const fadeUp: Variants = { ... };`) and insert immediately after it:

  ```tsx
  // ── Scroll-reveal helpers ───────────────────────────────────────────────────────
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

  const fadeUpGridVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };

  const fadeUpItemVariants = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  function FadeUpGrid({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
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

  function FadeUpItem({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <motion.div variants={fadeUpItemVariants} className={className}>
        {children}
      </motion.div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles clean**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```
  Expected: build succeeds with no TypeScript errors. (Vite/esbuild warnings about unused vars are fine; TS errors are not.)

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: add FadeUp scroll-reveal helper components to Landing"
  ```

---

## Task 2: Animate Games section — subtext and category tabs

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~3576–3596`

The Games section (`{/* ── GAMES SECTION ── */}`, line ~3529) has:
- An `<h2>` with per-word blur `whileInView` spans — **leave alone**
- A plain `<p>` at line ~3576 — wrap in `<FadeUp>`
- A category tabs grid `<div>` at line ~3585 — wrap in `<FadeUp>`

- [ ] **Step 1: Wrap the subtext `<p>` in `<FadeUp>`**

  Find this exact code (inside the `<Parallax>` below the `<h2>`):
  ```tsx
          <p className="text-arena-text-muted text-lg max-w-xl mx-auto">
            From FPS to fighting games — run professional tournaments for every
            major title.
          </p>
  ```
  Replace with:
  ```tsx
          <FadeUp>
            <p className="text-arena-text-muted text-lg max-w-xl mx-auto">
              From FPS to fighting games — run professional tournaments for every
              major title.
            </p>
          </FadeUp>
  ```

- [ ] **Step 2: Wrap the category tabs grid `<div>` in `<FadeUp>`**

  Find this exact code (inside `{/* ── Browse Tournaments ── */}` `<Parallax>`):
  ```tsx
          {/* Category tabs */}
          <div className="mx-auto mb-10 grid max-w-md grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
  ```
  Replace with:
  ```tsx
          {/* Category tabs */}
          <FadeUp>
          <div className="mx-auto mb-10 grid max-w-md grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
  ```
  And close the `<FadeUp>` immediately after the closing `</div>` of that grid:
  ```tsx
          </div>
          </FadeUp>
  ```
  > **Important:** Do NOT use `<FadeUpGrid>`/`<FadeUpItem>` here. `CategoryButton` renders a `motion.button` driven by `useSpring` x/y values — individual wrapping would leak Framer Motion variants into those springs.

- [ ] **Step 3: TypeScript check**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```
  Expected: no TypeScript errors.

- [ ] **Step 4: Visual check**

  ```bash
  cd frontend && npm run dev
  ```
  Open the landing page. Scroll down to the Games section. The subtext paragraph and category tabs grid should both float up (22px, 0.55s) as they enter the viewport. The heading words should still slide in with blur as before — unchanged.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: add scroll-reveal to Games section subtext and category tabs"
  ```

---

## Task 3: Animate Features section subtext

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~3929`

The Features section heading (`ref={clubHeadingRef}`) has a custom impact animation — **leave it alone entirely**. Only the plain `<p>` below it gets `<FadeUp>`.

- [ ] **Step 1: Wrap the Features subtext `<p>` in `<FadeUp>`**

  Find this exact code (line ~3929, inside the `<Parallax>` just before `{/* ── Feature Showcases ── */}`):
  ```tsx
            <p className="text-arena-text-muted text-lg max-w-2xl mx-auto">
              Purpose-built for the chaos of running tournaments at scale.
            </p>
  ```
  Replace with:
  ```tsx
            <FadeUp>
              <p className="text-arena-text-muted text-lg max-w-2xl mx-auto">
                Purpose-built for the chaos of running tournaments at scale.
              </p>
            </FadeUp>
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```
  Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: add scroll-reveal to Features section subtext"
  ```

---

## Task 4: Feature showcase Row 1 — Tournament Management

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~3937–4008`

Layout: `flex-col lg:flex-row` — **text is first child** (left), **mockup is second child** (right). Mockup slides in from the right (`x: 60 → 0`).

- [ ] **Step 1: Replace the outer `motion.div` wrapper with a plain `div`**

  Find:
  ```tsx
            {/* 1 · Tournament Management */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
            >
  ```
  Replace with:
  ```tsx
            {/* 1 · Tournament Management */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
  ```
  And change the closing `</motion.div>` at the end of this row to `</div>`.

- [ ] **Step 2: Wrap the text side in `<FadeUp>`**

  The text side is the first `<div className="flex-1 text-center lg:text-left">`. Wrap it:
  ```tsx
              <FadeUp className="flex-1 text-center lg:text-left">
                {/* badge, h3, p, ul — all unchanged */}
              </FadeUp>
  ```
  Remove the original `className="flex-1 text-center lg:text-left"` from the inner div (it moves to `<FadeUp className=...>`). The inner div can be removed entirely if it only held that class, or kept as a plain div inside `<FadeUp>` — either is fine.

  > **Simpler approach:** Keep the inner div and just add `<FadeUp>` as a new wrapper around it:
  ```tsx
              <FadeUp>
                <div className="flex-1 text-center lg:text-left">
                  {/* unchanged content */}
                </div>
              </FadeUp>
  ```

- [ ] **Step 3: Wrap the mockup side in a `motion.div` with right-to-left slide**

  The mockup side is the second child — `<div className="flex-1 w-full rounded-2xl ...">`. Wrap it:
  ```tsx
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="w-full rounded-2xl border border-arena-border overflow-hidden" style={{ background: "var(--bg-2)" }}>
                  {/* unchanged mockup content */}
                </div>
              </motion.div>
  ```
  Move `flex-1` from the original div to the new `motion.div` wrapper. The inner div keeps all its other classes.

- [ ] **Step 4: TypeScript check**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```

- [ ] **Step 5: Visual check**

  Scroll to the "Brackets on demand" row. Text should float up, mockup should slide in from the right simultaneously.

- [ ] **Step 6: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: split-animate Row 1 (Tournament Management) showcase"
  ```

---

## Task 5: Feature showcase Row 2 — Live Match Control

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~4010–4082`

Layout: `flex-col-reverse lg:flex-row` — **mockup is first child in JSX** (appears left on desktop), **text is second child in JSX**. Mockup slides in from the left (`x: -60 → 0`).

- [ ] **Step 1: Replace the outer `motion.div` with a plain `div`**

  Find:
  ```tsx
            {/* 2 · Live Match Control */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20"
            >
  ```
  Replace with:
  ```tsx
            {/* 2 · Live Match Control */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
  ```
  Change the closing `</motion.div>` to `</div>`.

- [ ] **Step 2: Wrap the mockup side (first child) with a left slide-in**

  The first child is `{/* Mockup: Live Control */}` `<div className="flex-1 w-full rounded-2xl ...">`. Wrap it:
  ```tsx
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="w-full rounded-2xl border border-arena-border overflow-hidden" style={{ background: "var(--bg-2)" }}>
                  {/* unchanged */}
                </div>
              </motion.div>
  ```

- [ ] **Step 3: Wrap the text side (second child) in `<FadeUp>`**

  The second child is `<div className="flex-1 text-center lg:text-left">`. Wrap it:
  ```tsx
              <FadeUp>
                <div className="flex-1 text-center lg:text-left">
                  {/* unchanged */}
                </div>
              </FadeUp>
  ```

- [ ] **Step 4: TypeScript check + visual check**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```
  Scroll to "Run every live match" row. Mockup slides from left, text floats up.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: split-animate Row 2 (Live Match Control) showcase"
  ```

---

## Task 6: Feature showcase Row 3 — Scheduling & Room Booking

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~4084–4157`

Layout: `flex-col lg:flex-row` — **text is first child**, **mockup is second child** (right). Mockup slides from right (`x: 60 → 0`). Same pattern as Row 1.

- [ ] **Step 1: Replace outer `motion.div` with plain `div`**

  Find:
  ```tsx
            {/* 3 · Scheduling & Room Booking */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
            >
  ```
  Replace with:
  ```tsx
            {/* 3 · Scheduling & Room Booking */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
  ```
  Change the closing `</motion.div>` to `</div>`.

- [ ] **Step 2: Wrap text side (first child) in `<FadeUp>`**

  ```tsx
              <FadeUp>
                <div className="flex-1 text-center lg:text-left">
                  {/* unchanged */}
                </div>
              </FadeUp>
  ```

- [ ] **Step 3: Wrap mockup side (second child) with right slide-in**

  ```tsx
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="w-full ...">
                  {/* unchanged mockup content */}
                </div>
              </motion.div>
  ```

- [ ] **Step 4: TypeScript check + visual check + commit**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: split-animate Row 3 (Scheduling & Room Booking) showcase"
  ```

---

## Task 7: Feature showcase Row 4 — Participants & Notifications

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~4159–4241`

Layout: `flex-col-reverse lg:flex-row` — **mockup is first child in JSX** (appears left), **text is second child**. Mockup slides from left (`x: -60 → 0`). Same pattern as Row 2.

- [ ] **Step 1: Replace outer `motion.div` with plain `div`**

  Find:
  ```tsx
            {/* 4 · Participants & Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20"
            >
  ```
  Replace with:
  ```tsx
            {/* 4 · Participants & Notifications */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
  ```
  Change the closing `</motion.div>` to `</div>`.

- [ ] **Step 2: Wrap mockup side (first child) with left slide-in**

  The first child is `<div className="flex-1 w-full grid grid-cols-2 gap-4">`. Wrap it:
  ```tsx
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="w-full grid grid-cols-2 gap-4">
                  {/* unchanged */}
                </div>
              </motion.div>
  ```

- [ ] **Step 3: Wrap text side (second child) in `<FadeUp>`**

  ```tsx
              <FadeUp>
                <div className="flex-1 text-center lg:text-left">
                  {/* unchanged */}
                </div>
              </FadeUp>
  ```

- [ ] **Step 4: TypeScript check + visual check + commit**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: split-animate Row 4 (Participants & Notifications) showcase"
  ```

---

## Task 8: Feature showcase Row 5 — Share Event

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~4243–4301`

Layout: `flex-col lg:flex-row` — **text is first child**, **mockup is second child** (right). Mockup slides from right (`x: 60 → 0`). Same pattern as Rows 1 and 3.

- [ ] **Step 1: Replace outer `motion.div` with plain `div`**

  Find:
  ```tsx
            {/* 5 · Share Event */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
            >
  ```
  Replace with:
  ```tsx
            {/* 5 · Share Event */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
  ```
  Change the closing `</motion.div>` to `</div>`.

- [ ] **Step 2: Wrap text side (first child) in `<FadeUp>`**

  ```tsx
              <FadeUp>
                <div className="flex-1 text-center lg:text-left">
                  {/* unchanged */}
                </div>
              </FadeUp>
  ```

- [ ] **Step 3: Wrap mockup side (second child) with right slide-in**

  The mockup is `<div className="flex-1 w-full max-w-[440px] rounded-[20px] ...">`. Wrap it:
  ```tsx
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="w-full max-w-[440px] rounded-[20px] border border-arena-border overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.35)]" style={{ background: "var(--surface)" }}>
                  {/* unchanged */}
                </div>
              </motion.div>
  ```

- [ ] **Step 4: TypeScript check + visual check + commit**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: split-animate Row 5 (Share Event) showcase"
  ```

---

## Task 9: CTA Banner

**Files:**
- Modify: `frontend/src/pages/Landing.tsx:~4357–4415`

The CTA section structure is:
```
<section>
  <Parallax ...>
    <div absolute .../>           ← decorative hover gradient, unchanged
    <div pointer-events-none .../>  ← plus burst decorations, unchanged
    <div className="relative z-10"> ← THIS gets wrapped in <FadeUp>
      <h2>                          ← contains motion.span with useAnimationControls, unchanged
      <p>
      <button>
    </div>
  </Parallax>
</section>
```

- [ ] **Step 1: Wrap `<div className="relative z-10">` in `<FadeUp>`**

  Find:
  ```tsx
          <div className="relative z-10">
            <h2
              ref={ctaLevelRef}
  ```
  Replace with:
  ```tsx
          <FadeUp>
          <div className="relative z-10">
            <h2
              ref={ctaLevelRef}
  ```
  And add the closing tag after the `</div>`:
  ```tsx
          </div>
          </FadeUp>
  ```
  > The `<Parallax>` wrapper, the absolute decorative divs, and the inner `motion.span` on "level" (which uses `useAnimationControls` driven by `ctaLevelInView` + hover) must all remain **exactly as-is**. Do not add `whileInView` to the `<h2>` or its children.

- [ ] **Step 2: TypeScript check**

  ```bash
  cd frontend && npm run build 2>&1 | head -30
  ```
  Expected: no TypeScript errors.

- [ ] **Step 3: Visual check — full page scroll**

  ```bash
  cd frontend && npm run dev
  ```
  Scroll through the entire landing page top to bottom and verify:
  - [ ] Games section subtext floats up ✓
  - [ ] Category tabs grid floats up ✓
  - [ ] Features section subtext floats up ✓
  - [ ] Row 1 mockup slides from right, text floats up ✓
  - [ ] Row 2 mockup slides from left, text floats up ✓
  - [ ] Row 3 mockup slides from right, text floats up ✓
  - [ ] Row 4 mockup slides from left, text floats up ✓
  - [ ] Row 5 mockup slides from right, text floats up ✓
  - [ ] CTA banner fades up as it enters view ✓
  - [ ] Hero section: no change ✓
  - [ ] Stats row: no change (still staggers as before) ✓
  - [ ] "Everything your club needs" heading: impact animation still fires ✓
  - [ ] Games heading word-blur: still slides in per-word ✓
  - [ ] Marquee strips: still scroll continuously, no flicker ✓
  - [ ] Footer: no change ✓

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/pages/Landing.tsx
  git commit -m "feat: add scroll-reveal to CTA banner"
  ```
