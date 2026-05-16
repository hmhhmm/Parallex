'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/sections/Navbar'
import HeroContent from '@/components/sections/HeroContent'
import HowItWorks from '@/components/sections/HowItWorks'
import MarketplacePreview from '@/components/sections/MarketplacePreview'
import WhyMonad from '@/components/sections/WhyMonad'
import Footer from '@/components/sections/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CustomCursor from '@/components/ui/CustomCursor'

const Galaxy = dynamic(() => import('@/components/galaxy/Galaxy'), { ssr: false })

export default function Home() {
  return (
    <main className="relative bg-black">
      <CustomCursor />
      <ScrollProgress />
      <Galaxy />

      <div className="relative z-10">
        <Navbar />
        <HeroContent />
        <HowItWorks />
        <MarketplacePreview />
        <WhyMonad />
        <Footer />
      </div>
    </main>
  )
}
