import { createPublicClient, http, defineChain } from 'viem'

/// Client-safe chain config — no env vars, no private keys.
/// Safe to import from React components.
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
})

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})
