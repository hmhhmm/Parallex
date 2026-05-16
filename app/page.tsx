'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/sections/Navbar'
import HeroContent from '@/components/sections/HeroContent'
import HowItWorks from '@/components/sections/HowItWorks'
import SpecializedAgents from '@/components/sections/SpecializedAgents'
import WhyMonad from '@/components/sections/WhyMonad'
import Footer from '@/components/sections/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CustomCursor from '@/components/ui/CustomCursor'

const Galaxy = dynamic(() => import('@/components/galaxy/Galaxy'), { ssr: false })

export default function Home() {
  return (
    <main className="relative" style={{ background: '#03020A' }}>
      <CustomCursor />
      <ScrollProgress />

      {/* CSS star-field fallback — visible if WebGL/Galaxy fails to load */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(131,110,251,0.15) 0%, transparent 60%),
          radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 75% 45%, rgba(200,220,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 10% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 88% 22%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 35% 80%, rgba(200,200,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 62% 68%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 55%, rgba(180,180,255,0.3) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 80% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 5% 90%, rgba(255,255,255,0.35) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 10%, rgba(200,240,255,0.5) 0%, transparent 100%)
        `,
      }} />

      <Galaxy />

      <div className="relative z-10">
        <Navbar />
        <HeroContent />
        <HowItWorks />
        <SpecializedAgents />
        <WhyMonad />
        <Footer />
      </div>
    </main>
  )
}
