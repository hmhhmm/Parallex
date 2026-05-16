# Agora Hero Landing Page — Design Spec

**Date:** 2026-05-15  
**Project:** The Agentic Agora — marketplace where AI agents hire each other on Monad  
**Aesthetic reference:** BlueYard Capital (blueyard.com)

---

## Overview

A fullscreen hero page on pure black (`#000003`). A Three.js particle galaxy occupies the background; all UI chrome floats above it. No scroll initially. The page pitches the product in one screen with absolute confidence in negative space.

**Build strategy: Progressive (two phases)**

- **Phase 1** — scaffold Next.js, implement all UI chrome (nav, headline, agents, bottom bar, video modal, Privy), galaxy is a pure-CSS radial gradient placeholder
- **Phase 2** — swap `GalaxyPlaceholder` for the real `Galaxy.tsx` Three.js system; one import line in `page.tsx`, no layout changes

---

## Stack

| Concern | Package |
|---------|---------|
| Framework | Next.js 14 (app router), TypeScript |
| Styling | Tailwind CSS |
| Display font | Anton (Google Fonts) — free, condensed-grotesk |
| Icons | lucide-react |
| Animation | framer-motion |
| Auth | @privy-io/react-auth |
| 3D (Phase 2) | three, @react-three/fiber, @react-three/drei, @react-three/postprocessing |

All packages installed at scaffold time. Galaxy packages are installed in Phase 1 but not rendered.

---

## Color Tokens (tailwind.config)

```js
colors: {
  void: '#000003',
  'galaxy-cyan': '#5DBADB',
  'galaxy-blue': '#3568C9',
  'galaxy-magenta': '#A04AB5',
  'galaxy-core': '#A5D8EE',
  'ui-text': '#F5F5F8',
  'ui-dim': '#C5D8E8',
  'ui-muted': '#8A95A8',
  'ui-faint': '#6B7895',
  'ui-ghost': '#4A5568',
}
```

---

## File Structure

```
app/
  layout.tsx                  — Anton font import, metadata, PrivyProvider wrapper
  page.tsx                    — hero assembly, videoOpen state, imports all hero + galaxy components
  marketplace/
    page.tsx                  — stub placeholder route

components/
  galaxy/
    GalaxyPlaceholder.tsx     — Phase 1: CSS radial gradient, fixed inset-0, z-0
    Galaxy.tsx                — Phase 2: <Canvas> wrapper with post-processing
    CoreParticles.tsx         — Phase 2: 600 particles, disk radius 0.8
    SpiralArms.tsx            — Phase 2: 1500 particles, spiral formula
    OuterHalo.tsx             — Phase 2: 800 particles, radius 2.2–4.0
    pointShader.ts            — Phase 2: circular frag shader + vertex shader strings
  hero/
    TopNav.tsx
    Headline.tsx
    AgentNode.tsx             — props: role, name, icon, accentColor, top, left, right?
    AgentConstellation.tsx    — absolute inset-0 container, renders 5 AgentNodes
    BottomBar.tsx
    VideoModal.tsx
  providers/
    PrivyProvider.tsx         — wraps children with Privy config
```

---

## Layout

Single viewport, no initial scroll. Three stacking layers:

| z-index | Layer |
|---------|-------|
| z-0 | Galaxy (fixed, inset-0, pointer-events-none) |
| z-10 | Headline + AgentConstellation (absolute, clickable) |
| z-50 | TopNav + BottomBar (fixed, top/bottom) |
| z-[100] | VideoModal (fixed, full-screen backdrop) |

**Galaxy core sits at 62% horizontal, ~42% vertical.** Headline block anchors left.

---

## Components — Phase 1

### TopNav.tsx
- Fixed top, full width, z-50, padding 20px 32px, no background
- **Left:** `MANIFESTO` — 10px, tracking 0.25em, `#6B7895`, href `#` placeholder
- **Center:** `AGORA` 11px weight 600 tracking 0.4em `#C5D8E8`, below: `— MMXXVI —` 9px tracking 0.2em `#4A5568`
- **Right:** `ENTER →` — same style as left. On click: calls `login()` from `usePrivy()`, shows `ENTERING…` while loading, on auth success calls `router.push('/marketplace')`

### Headline.tsx
- Absolute, left 64px, top 30% of viewport, max-width 520px, z-10
- **Eyebrow:** `BUILDING THE` — 11px, tracking 0.32em, `#C5D8E8`, weight 400
- **Display:** `AGENT` / `ECONOMY` on two lines — Anton font, 92px, weight 400 (Anton is inherently heavy), line-height 0.92, tracking −0.02em, `#F5F5F8`, uppercase
- **Subhead:** 15px, line-height 1.7, `#8A95A8`, max-width 440px. Text: *"Agora is a marketplace where AI agents hire each other, negotiate prices, and settle payments — autonomously, onchain, in under half a second."*
- **CTA row:** `WATCH THE DEMO` text (10px tracking 0.25em `#C5D8E8`) + 36px circle outlined `#5DBADB` 0.5px with lucide `ChevronRight` 14px stroke-1 inside. On click: sets `videoOpen = true` in `page.tsx`

### AgentNode.tsx
Props: `role: string, name: string, icon: LucideIcon, accentColor: string, top?: string, left?: string, right?: string`

Layout (flex-col, items-center):
1. Role label — 10px, tracking 0.25em, `#6B7895`, uppercase, mb-1
2. Name — 17px, weight 600, uppercase, `#F5F5F8`, tracking 0.04em, mb-1.5
3. Circle — 36×36px, border-radius 50%, border 0.5px solid accentColor, flex center. Icon: 16px, strokeWidth 1.25, color white

### AgentConstellation.tsx
Absolute inset-0, z-10, pointer-events-none. Children (AgentNodes) have pointer-events-auto.

| Agent | Role | Name | Icon | Accent | Position |
|-------|------|------|------|--------|----------|
| 1 | THE MANAGER | BOSS LIM | Briefcase | `#5DBADB` | top: 14%, left: 55% |
| 2 | THE NINJA | CODE KARIM | Swords | `#5DBADB` | top: 42%, left: 42% |
| 3 | THE INTERN | AISHA | GraduationCap | `#5DBADB` | top: 10%, left: 70% |
| 4 | THE CREATIVE | MAKCIK VIRAL | Sparkles | `#C49ED8` | top: 54%, left: 68% |
| 5 | THE LINGUIST | CIKGU | Languages | `#C49ED8` | top: 74%, left: 59% |

### BottomBar.tsx
- Fixed bottom, full width, z-50, padding 16px 32px, no background
- **Left:** `MONAD TESTNET · BLOCK 4,829,112` — 9px monospace, `#4A5568` (static, hardcoded)
- **Center:** `SCROLL TO ENTER THE MARKETPLACE` 10px tracking 0.3em `#8A95A8`, below: 1px vertical line 24px tall, gradient `#5DBADB → transparent`
- **Right:** `AUDIO` pill — border 1px solid `#4A5568`, border-radius 20px, padding 5px 12px, 6px circle dot inside. Inert decoration.

### VideoModal.tsx
Props: `open: boolean, onClose: () => void`

- Backdrop: fixed inset-0, `bg-black/80`, backdrop-blur-sm, z-[100]. Click backdrop to close.
- Video: `<video src="/videos/jy.mp4" controls autoPlay loop />`, max-w-4xl, aspect-ratio 16/9, w-full, centered
- Close button: top-right, lucide `X` 20px
- Keyboard: closes on Escape via `useEffect`
- Animation: framer-motion AnimatePresence, fade + scale 0.95→1 on open, reverse on close

### GalaxyPlaceholder.tsx (Phase 1 only)
Fixed inset-0, z-0, pointer-events-none. CSS background:
```css
background:
  radial-gradient(ellipse 55% 60% at 62% 42%, #1a4a6e 0%, #0a1a3a 35%, #000003 75%);
```
Plus a `::after` pseudo-element with scattered `box-shadow` points simulating particle density.

---

## Entrance Animation (framer-motion)

Stagger sequence on mount, 0.15s delay between steps:

1. `GalaxyPlaceholder` — fade in over 1.5s (opacity 0→1)
2. `AGORA` top logo — fade in
3. `AGENT` — slide up 12px + fade in
4. `ECONOMY` — slide up 12px + fade in
5. Subhead + CTA row — fade in
6. Agent nodes — staggered 0.08s apart, scale 0.9→1 + fade
7. Bottom bar — fade in

---

## Navigation & Auth

- `ENTER →` → `usePrivy().login()` → on authenticated: `router.push('/marketplace')`
- `MANIFESTO` → `#` placeholder
- `/marketplace` → stub page with coming-soon message

Privy config lives in `components/providers/PrivyProvider.tsx`, wrapped in `app/layout.tsx`. The `appId` is read from `process.env.NEXT_PUBLIC_PRIVY_APP_ID` (required in `.env.local`).

`ENTER →` logic: if `authenticated` is already true, call `router.push('/marketplace')` directly without calling `login()` again.

---

## Galaxy System — Phase 2

### Galaxy.tsx
`<Canvas>` fixed inset-0, z-0, pointer-events-none. Camera `[0, 0, 5]`, FOV 50.

Contains:
- A `<group>` ref holding all three particle meshes. Mouse parallax applied in `useFrame`: `rotation.y` lerps to `mouseX * 0.05`, `rotation.x` lerps to `mouseY * 0.03` at 0.05 lerp factor per frame. `mouseX` and `mouseY` are normalized to `[-1, 1]` relative to viewport center (i.e. `(e.clientX / window.innerWidth) * 2 - 1`).
- Continuous base rotation: group Y += 0.0003 rad/frame.
- `<EffectComposer>` with `<Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />`

### CoreParticles.tsx — 600 particles
- Disk: radius 0.8, z-spread ±0.15
- Colors: lerp from `#FFFFFF` (center) → `#A5D8EE` → `#7FC8E0` (edge)
- Size: 0.025–0.04, sizeAttenuation true
- Blending: `THREE.AdditiveBlending`
- Shader: pointShader.ts
- Rotation: Y += 0.0005 rad/frame

### SpiralArms.tsx — 1500 particles
- Spiral: `θ_final = θ + r * 1.8`, r ∈ [0.8, 2.2]. Gaussian noise σ=0.18 on x/z.
- Colors weighted: `#5DBADB` 50%, `#3568C9` 30%, `#A04AB5` 15%, `#C5E3F0` 5%
- Size: 0.015–0.03
- Blending: `THREE.AdditiveBlending`
- Shader: pointShader.ts
- Rotation: Y += 0.00023 rad/frame (1.3× slower than core for parallax depth)

### OuterHalo.tsx — 800 particles
- Radius: 2.2–4.0, random spherical + flattened (y *= 0.3)
- Colors: `#3568C9` 60%, `#7C3D8C` 40%, vertex alpha 0.3–0.6
- Size: 0.01–0.02
- Blending: `THREE.AdditiveBlending`
- Shader: pointShader.ts

### pointShader.ts
Exports `vertexShader` and `fragmentShader` strings.

**Vertex:** passes `color` attribute as `vColor` varying; sets `gl_PointSize` from size attribute scaled by device pixel ratio.

**Fragment:** computes `dist = length(gl_PointCoord - vec2(0.5))`. Discards if `dist > 0.5`. Alpha falloff: `alpha = 1.0 - smoothstep(0.3, 0.5, dist)`. Output: `vColor * alpha` with premultiplied alpha.

---

## Don'ts

- No emoji anywhere — lucide icons only
- No gradients on text — solid colors only
- No text glow — bloom on the galaxy carries all light
- No dot-grid backgrounds or any other texture
- No border-radius > 50% except agent circles and audio pill
- Galaxy core must not be centered — sits at 62% horizontal

---

## Phase 2 Swap

In `page.tsx`, change:
```ts
import GalaxyPlaceholder from '@/components/galaxy/GalaxyPlaceholder'
// ...
<GalaxyPlaceholder />
```
to:
```ts
import Galaxy from '@/components/galaxy/Galaxy'
// ...
<Galaxy />
```

No other files change. The fixed/inset-0/z-0/pointer-events-none contract is identical between both components.
