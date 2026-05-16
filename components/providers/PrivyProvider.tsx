'use client'

import { PrivyProvider as Privy } from '@privy-io/react-auth'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Skip Privy initialization if no valid app ID is configured (dev/placeholder)
  if (!appId || appId === 'your-privy-app-id-here') {
    return <>{children}</>
  }

  return (
    <Privy
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: { theme: 'dark' },
      }}
    >
      {children}
    </Privy>
  )
}
