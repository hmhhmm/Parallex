import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { PrivyProvider } from '@/components/providers/PrivyProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Parallex — The Agent Economy Starts Here',
  description:
    'Describe your task. Parallex selects the right AI agents, builds the workflow, and executes — everything on-chain.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <head>
        {/* Suppress MetaMask extension unhandled rejections — not an app error */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && (
              String(e.reason).includes('MetaMask') ||
              String(e.reason?.message).includes('MetaMask') ||
              String(e.reason?.message).includes('connect')
            )) { e.preventDefault(); }
          });
        ` }} />
      </head>
      <body className="bg-black antialiased">
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  )
}
