# Agora Hero Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fullscreen BlueYard-inspired hero page for The Agentic Agora with a Three.js particle galaxy, Privy auth, and framer-motion entrance animations.

**Architecture:** Progressive two-phase build. Phase 1 ships all UI chrome with a CSS gradient galaxy placeholder. Phase 2 swaps the placeholder for the real Three.js system — one import line change, no layout work.

**Tech Stack:** Next.js 14 (app router), TypeScript, Tailwind CSS, framer-motion, @privy-io/react-auth, three + @react-three/fiber + @react-three/drei + @react-three/postprocessing, lucide-react, Anton (Google Fonts)

---

## Phase 1 — UI Chrome

---

### Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`

- [ ] **Step 1: Scaffold the project**

Run from `/Users/a1357/Documents/GitHub/monad`:

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

Expected: project files created (package.json, tsconfig.json, app/, etc.). Existing `docs/` and `.superpowers/` directories are untouched.

If it fails on non-empty dir, run:
```bash
npx create-next-app@14 agora-tmp --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes && cp -r agora-tmp/. . && rm -rf agora-tmp
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion lucide-react @privy-io/react-auth three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

Expected: `node_modules/` populated, no peer dep errors.

- [ ] **Step 3: Create .env.local**

Create `/Users/a1357/Documents/GitHub/monad/.env.local`:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
```

Replace `your-privy-app-id-here` with the actual Privy app ID from the Privy dashboard.

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: `✓ Ready in` message, no errors. Visit http://localhost:3000 — default Next.js page appears.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 14 with all dependencies"
```

---

### Task 2: Configure Tailwind colors and global styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the entire file:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css**

Replace the entire file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background-color: #000003;
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css && git commit -m "feat: configure tailwind color tokens and global styles"
```

---

### Task 3: layout.tsx with Anton font and PrivyProvider

**Files:**
- Create: `components/providers/PrivyProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create PrivyProvider**

Create `components/providers/PrivyProvider.tsx`:

```tsx
'use client'

import { PrivyProvider as Privy } from '@privy-io/react-auth'

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: { theme: 'dark' },
      }}
    >
      {children}
    </Privy>
  )
}
```

- [ ] **Step 2: Update layout.tsx**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Anton } from 'next/font/google'
import { PrivyProvider } from '@/components/providers/PrivyProvider'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
})

export const metadata: Metadata = {
  title: 'Agora — The Agent Economy',
  description:
    'A marketplace where AI agents hire each other, negotiate prices, and settle payments — autonomously, onchain, in under half a second.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={anton.variable}>
      <body className="bg-void antialiased">
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/providers/PrivyProvider.tsx app/layout.tsx && git commit -m "feat: add Anton font and PrivyProvider wrapper"
```

---

### Task 4: GalaxyPlaceholder (CSS radial gradient)

**Files:**
- Create: `components/galaxy/GalaxyPlaceholder.tsx`

- [ ] **Step 1: Create GalaxyPlaceholder**

Create `components/galaxy/GalaxyPlaceholder.tsx`:

```tsx
export default function GalaxyPlaceholder() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 62% 42%, #1a4a6e 0%, #0a1a3a 35%, #000003 75%)',
      }}
    >
      {/* Simulate particle density with layered radial gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle 3px at 62% 42%, #5DBADB 0%, transparent 100%),
            radial-gradient(circle 1px at 58% 39%, #A5D8EE 0%, transparent 100%),
            radial-gradient(circle 1px at 65% 44%, #5DBADB 0%, transparent 100%),
            radial-gradient(circle 1px at 70% 38%, #3568C9 0%, transparent 100%),
            radial-gradient(circle 1px at 55% 47%, #3568C9 0%, transparent 100%),
            radial-gradient(circle 1px at 73% 50%, #A04AB5 0%, transparent 100%),
            radial-gradient(circle 1px at 50% 35%, #5DBADB 0%, transparent 100%),
            radial-gradient(circle 1px at 68% 32%, #A5D8EE 0%, transparent 100%),
            radial-gradient(circle 1px at 78% 42%, #3568C9 0%, transparent 100%),
            radial-gradient(circle 1px at 60% 55%, #5DBADB 0%, transparent 100%),
            radial-gradient(circle 1px at 45% 43%, #3568C9 0%, transparent 100%),
            radial-gradient(circle 1px at 82% 35%, #A04AB5 0%, transparent 100%),
            radial-gradient(circle 1px at 52% 28%, #5DBADB 0%, transparent 100%),
            radial-gradient(circle 1px at 74% 60%, #3568C9 0%, transparent 100%)
          `,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/GalaxyPlaceholder.tsx && git commit -m "feat: add CSS galaxy placeholder"
```

---

### Task 5: TopNav

**Files:**
- Create: `components/hero/TopNav.tsx`

- [ ] **Step 1: Create TopNav**

Create `components/hero/TopNav.tsx`:

```tsx
'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TopNav() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (authenticated && entering) {
      setEntering(false)
      router.push('/marketplace')
    }
  }, [authenticated, entering, router])

  function handleEnter() {
    if (!ready) return
    if (authenticated) {
      router.push('/marketplace')
      return
    }
    setEntering(true)
    login()
  }

  const navTextStyle = {
    fontSize: 10,
    letterSpacing: '0.25em',
    color: '#6B7895',
    textTransform: 'uppercase' as const,
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
      <a href="#" style={navTextStyle}>
        MANIFESTO
      </a>

      <div className="text-center">
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.4em', color: '#C5D8E8' }}>
          AGORA
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#4A5568' }}>
          — MMXXVI —
        </div>
      </div>

      <button
        onClick={handleEnter}
        style={navTextStyle}
        className="cursor-pointer bg-transparent border-none p-0 transition-colors hover:opacity-80"
      >
        {entering ? 'ENTERING…' : 'ENTER →'}
      </button>
    </nav>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/hero/TopNav.tsx && git commit -m "feat: add TopNav with Privy login and route"
```

---

### Task 6: Headline with internal stagger animation

**Files:**
- Create: `components/hero/Headline.tsx`

- [ ] **Step 1: Create Headline**

Create `components/hero/Headline.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface HeadlineProps {
  onDemoClick: () => void
}

const fade = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const slideUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }

export default function Headline({ onDemoClick }: HeadlineProps) {
  return (
    <div className="absolute z-10" style={{ left: 64, top: '30%', maxWidth: 520 }}>
      <motion.p
        variants={fade}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          fontSize: 11,
          letterSpacing: '0.32em',
          color: '#C5D8E8',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        BUILDING THE
      </motion.p>

      <div
        style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 92,
          lineHeight: 0.92,
          letterSpacing: '-0.02em',
          color: '#F5F5F8',
          textTransform: 'uppercase',
        }}
      >
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          AGENT
        </motion.div>
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          ECONOMY
        </motion.div>
      </div>

      <motion.p
        variants={fade}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.75, duration: 0.5 }}
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: '#8A95A8',
          maxWidth: 440,
          marginTop: 24,
        }}
      >
        Agora is a marketplace where AI agents hire each other, negotiate prices, and settle
        payments — autonomously, onchain, in under half a second.
      </motion.p>

      <motion.div
        variants={fade}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex items-center gap-3 mt-6"
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.25em',
            color: '#C5D8E8',
            textTransform: 'uppercase',
          }}
        >
          WATCH THE DEMO
        </span>
        <button
          onClick={onDemoClick}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '0.5px solid #5DBADB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={14} strokeWidth={1} color="#5DBADB" />
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/hero/Headline.tsx && git commit -m "feat: add Headline with stagger animation"
```

---

### Task 7: AgentNode and AgentConstellation

**Files:**
- Create: `components/hero/AgentNode.tsx`
- Create: `components/hero/AgentConstellation.tsx`

- [ ] **Step 1: Create AgentNode**

Create `components/hero/AgentNode.tsx`:

```tsx
import { LucideIcon } from 'lucide-react'

interface AgentNodeProps {
  role: string
  name: string
  icon: LucideIcon
  accentColor: string
}

export default function AgentNode({ role, name, icon: Icon, accentColor }: AgentNodeProps) {
  return (
    <div className="flex flex-col items-center">
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.25em',
          color: '#6B7895',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        {role}
      </span>
      <span
        style={{
          fontSize: 17,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#F5F5F8',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}
      >
        {name}
      </span>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `0.5px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={16} strokeWidth={1.25} color="white" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create AgentConstellation**

Create `components/hero/AgentConstellation.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { Briefcase, Swords, GraduationCap, Sparkles, Languages, LucideIcon } from 'lucide-react'
import AgentNode from './AgentNode'

interface AgentConfig {
  role: string
  name: string
  icon: LucideIcon
  accentColor: string
  top: string
  left: string
}

const AGENTS: AgentConfig[] = [
  { role: 'THE MANAGER', name: 'BOSS LIM', icon: Briefcase, accentColor: '#5DBADB', top: '14%', left: '55%' },
  { role: 'THE NINJA', name: 'CODE KARIM', icon: Swords, accentColor: '#5DBADB', top: '42%', left: '42%' },
  { role: 'THE INTERN', name: 'AISHA', icon: GraduationCap, accentColor: '#5DBADB', top: '10%', left: '70%' },
  { role: 'THE CREATIVE', name: 'MAKCIK VIRAL', icon: Sparkles, accentColor: '#C49ED8', top: '54%', left: '68%' },
  { role: 'THE LINGUIST', name: 'CIKGU', icon: Languages, accentColor: '#C49ED8', top: '74%', left: '59%' },
]

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
}

export default function AgentConstellation() {
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 1.05 } } }}
    >
      {AGENTS.map((agent) => (
        <motion.div
          key={agent.name}
          variants={nodeVariant}
          className="absolute flex flex-col items-center pointer-events-auto"
          style={{ top: agent.top, left: agent.left }}
        >
          <AgentNode
            role={agent.role}
            name={agent.name}
            icon={agent.icon}
            accentColor={agent.accentColor}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/hero/AgentNode.tsx components/hero/AgentConstellation.tsx && git commit -m "feat: add AgentNode and AgentConstellation with stagger"
```

---

### Task 8: BottomBar

**Files:**
- Create: `components/hero/BottomBar.tsx`

- [ ] **Step 1: Create BottomBar**

Create `components/hero/BottomBar.tsx`:

```tsx
export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
      <span
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          color: '#4A5568',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        MONAD TESTNET · BLOCK 4,829,112
      </span>

      <div className="flex flex-col items-center">
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.3em',
            color: '#8A95A8',
            textTransform: 'uppercase',
          }}
        >
          SCROLL TO ENTER THE MARKETPLACE
        </span>
        <div
          style={{
            width: 1,
            height: 24,
            background: 'linear-gradient(to bottom, #5DBADB, transparent)',
            marginTop: 6,
          }}
        />
      </div>

      <div
        style={{
          border: '1px solid #4A5568',
          borderRadius: 20,
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            border: '1px solid #4A5568',
          }}
        />
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.15em',
            color: '#6B7895',
            textTransform: 'uppercase',
          }}
        >
          AUDIO
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/hero/BottomBar.tsx && git commit -m "feat: add BottomBar with static block number"
```

---

### Task 9: VideoModal

**Files:**
- Create: `components/hero/VideoModal.tsx`

- [ ] **Step 1: Create VideoModal**

Create `components/hero/VideoModal.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoModal({ open, onClose }: VideoModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl mx-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 transition-opacity hover:opacity-60"
              style={{ color: '#8A95A8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <video
              src="/videos/jy.mp4"
              controls
              autoPlay
              loop
              className="w-full"
              style={{ aspectRatio: '16/9' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/hero/VideoModal.tsx && git commit -m "feat: add VideoModal with jy.mp4 and Escape/backdrop close"
```

---

### Task 10: Assemble page.tsx and stub /marketplace

**Files:**
- Modify: `app/page.tsx`
- Create: `app/marketplace/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GalaxyPlaceholder from '@/components/galaxy/GalaxyPlaceholder'
import TopNav from '@/components/hero/TopNav'
import Headline from '@/components/hero/Headline'
import AgentConstellation from '@/components/hero/AgentConstellation'
import BottomBar from '@/components/hero/BottomBar'
import VideoModal from '@/components/hero/VideoModal'

export default function Home() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-void">
      {/* Galaxy background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <GalaxyPlaceholder />
      </motion.div>

      {/* Top nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
      >
        <TopNav />
      </motion.div>

      {/* Headline — internal stagger handles per-line delays */}
      <Headline onDemoClick={() => setVideoOpen(true)} />

      {/* Agent constellation — internal stagger starts at 1.05s */}
      <AgentConstellation />

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55, duration: 0.6 }}
      >
        <BottomBar />
      </motion.div>

      {/* Video modal */}
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </main>
  )
}
```

- [ ] **Step 2: Create /marketplace stub**

Create `app/marketplace/page.tsx`:

```tsx
export default function MarketplacePage() {
  return (
    <main
      className="flex items-center justify-center w-screen h-screen bg-void"
      style={{ color: '#6B7895', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em' }}
    >
      MARKETPLACE COMING SOON
    </main>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Verify Phase 1 in browser**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Pure black background with cyan gradient glow at ~62% horizontal
- `AGORA` / `— MMXXVI —` centered at top; `MANIFESTO` left; `ENTER →` right
- `BUILDING THE` eyebrow, `AGENT / ECONOMY` in Anton at 92px, subhead text, circular CTA button
- Five agent nodes at correct positions around the galaxy zone
- `MONAD TESTNET · BLOCK 4,829,112` bottom left; scroll text + fade line center; AUDIO pill right
- Stagger animations play on load (galaxy first, then nav, then headline lines, then agents, then bottom bar)
- Clicking `WATCH THE DEMO` opens modal with video controls
- Escape or backdrop click closes the modal

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/marketplace/page.tsx && git commit -m "feat: assemble hero page — Phase 1 complete"
```

---

## Phase 2 — Three.js Galaxy

---

### Task 11: pointShader.ts

**Files:**
- Create: `components/galaxy/pointShader.ts`

- [ ] **Step 1: Create pointShader**

Create `components/galaxy/pointShader.ts`:

```ts
export const vertexShader = /* glsl */ `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const fragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/pointShader.ts && git commit -m "feat: add circular point GLSL shader"
```

---

### Task 12: CoreParticles

**Files:**
- Create: `components/galaxy/CoreParticles.tsx`

- [ ] **Step 1: Create CoreParticles**

Create `components/galaxy/CoreParticles.tsx`:

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './pointShader'

export default function CoreParticles() {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const count = 600
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const white = new THREE.Color('#FFFFFF')
    const mid = new THREE.Color('#A5D8EE')
    const edge = new THREE.Color('#7FC8E0')

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * 0.8
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      positions[i * 3 + 2] = Math.sin(angle) * radius

      const t = radius / 0.8
      const color = white.clone().lerp(mid, t).lerp(edge, Math.max(0, (t - 0.5) * 2))
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 0.025 + Math.random() * 0.015
    }

    return { positions, colors, sizes }
  }, [])

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0005
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        vertexColors
      />
    </points>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/CoreParticles.tsx && git commit -m "feat: add CoreParticles (600 particles, disk, cyan-white colors)"
```

---

### Task 13: SpiralArms

**Files:**
- Create: `components/galaxy/SpiralArms.tsx`

- [ ] **Step 1: Create SpiralArms**

Create `components/galaxy/SpiralArms.tsx`:

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './pointShader'

function gaussianRandom(std = 0.18): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function pickSpiralColor(): THREE.Color {
  const r = Math.random()
  if (r < 0.5) return new THREE.Color('#5DBADB')
  if (r < 0.8) return new THREE.Color('#3568C9')
  if (r < 0.95) return new THREE.Color('#A04AB5')
  return new THREE.Color('#C5E3F0')
}

export default function SpiralArms() {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 0.8 + Math.random() * 1.4
      const theta = Math.random() * Math.PI * 2
      const spiral = theta + r * 1.8
      positions[i * 3] = Math.cos(spiral) * r + gaussianRandom()
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.25
      positions[i * 3 + 2] = Math.sin(spiral) * r + gaussianRandom()

      const color = pickSpiralColor()
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 0.015 + Math.random() * 0.015
    }

    return { positions, colors, sizes }
  }, [])

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.00023
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        vertexColors
      />
    </points>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/SpiralArms.tsx && git commit -m "feat: add SpiralArms (1500 particles, gaussian noise, cyan/blue/magenta)"
```

---

### Task 14: OuterHalo

**Files:**
- Create: `components/galaxy/OuterHalo.tsx`

- [ ] **Step 1: Create OuterHalo**

Create `components/galaxy/OuterHalo.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './pointShader'

export default function OuterHalo() {
  const { positions, colors, sizes } = useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const blue = new THREE.Color('#3568C9')
    const purple = new THREE.Color('#7C3D8C')

    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.3
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const alpha = 0.3 + Math.random() * 0.3
      const color = Math.random() < 0.6 ? blue.clone() : purple.clone()
      colors[i * 3] = color.r * alpha
      colors[i * 3 + 1] = color.g * alpha
      colors[i * 3 + 2] = color.b * alpha

      sizes[i] = 0.01 + Math.random() * 0.01
    }

    return { positions, colors, sizes }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        vertexColors
      />
    </points>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/OuterHalo.tsx && git commit -m "feat: add OuterHalo (800 particles, radius 2.2-4.0, blue/purple)"
```

---

### Task 15: Galaxy.tsx — Canvas wrapper with Bloom and mouse parallax

**Files:**
- Create: `components/galaxy/Galaxy.tsx`

- [ ] **Step 1: Create Galaxy**

Create `components/galaxy/Galaxy.tsx`:

```tsx
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CoreParticles from './CoreParticles'
import SpiralArms from './SpiralArms'
import OuterHalo from './OuterHalo'

function GalaxyGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const parallax = useRef({ x: 0, y: 0 })
  const baseRotationY = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return

    baseRotationY.current += 0.0003

    const targetX = mouse.current.y * 0.03
    const targetY = mouse.current.x * 0.05
    parallax.current.x += (targetX - parallax.current.x) * 0.05
    parallax.current.y += (targetY - parallax.current.y) * 0.05

    groupRef.current.rotation.y = baseRotationY.current + parallax.current.y
    groupRef.current.rotation.x = parallax.current.x
  })

  return (
    <group ref={groupRef}>
      <CoreParticles />
      <SpiralArms />
      <OuterHalo />
    </group>
  )
}

export default function Galaxy() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <GalaxyGroup />
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/galaxy/Galaxy.tsx && git commit -m "feat: add Galaxy Canvas with Bloom and mouse parallax"
```

---

### Task 16: Swap GalaxyPlaceholder → Galaxy in page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the galaxy import in page.tsx**

In `app/page.tsx`, replace:

```tsx
import GalaxyPlaceholder from '@/components/galaxy/GalaxyPlaceholder'
```

with:

```tsx
import dynamic from 'next/dynamic'

const Galaxy = dynamic(() => import('@/components/galaxy/Galaxy'), { ssr: false })
```

And replace:

```tsx
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <GalaxyPlaceholder />
      </motion.div>
```

with:

```tsx
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <Galaxy />
      </motion.div>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify Phase 2 in browser**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Three.js galaxy renders at 62% horizontal — glowing cyan core, spiral arms in cyan/blue/magenta, scattered halo
- Bloom glow visible at core (soft cyan light bloom)
- Galaxy rotates slowly on Y axis
- Moving the mouse tilts the galaxy slightly (parallax)
- Spiral arms visibly lag behind the core (different rotation speed)
- All UI chrome from Phase 1 still correct and clickable
- Video modal still works
- No console errors

- [ ] **Step 4: Final build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx && git commit -m "feat: swap in real Three.js galaxy — Phase 2 complete"
```

---

## Self-Review Notes

- **Spec coverage:** All components covered. Entrance animation stagger matches spec timings (galaxy 0s, nav 0.15s, headline internal at 0.3/0.45/0.6/0.75/0.9s, agents 1.05s + 0.08s stagger, bottom bar 1.55s).
- **Type consistency:** `LucideIcon` used uniformly in AgentNode/AgentConstellation. `bufferAttribute` args format consistent across all particle files.
- **Phase swap:** `dynamic(() => import(...), { ssr: false })` prevents Three.js WebGL from running server-side.
- **Known gap:** If `NEXT_PUBLIC_PRIVY_APP_ID` is missing, Privy will throw at runtime. The `.env.local` step in Task 1 must not be skipped.
