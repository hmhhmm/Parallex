// Diagnostic: read agentCount() from the registry using the same viem path
// the dev server uses. Run with:  node scripts/check-registry.mjs

import { createPublicClient, http, defineChain } from 'viem'

const REGISTRY = '0xb4970490AD168e656188Fb0725B83232c5A5f11e'

// Try the default RPC + a couple of alternates so we can spot inconsistency
const RPCS = [
  'https://testnet-rpc.monad.xyz',
  'https://monad-testnet.drpc.org',
  'https://10143.rpc.thirdweb.com',
]

const ABI = [
  {
    name: 'agentCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getAgent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'name', type: 'string' },
        { name: 'specialty', type: 'string' },
        { name: 'pricePerTask', type: 'uint256' },
        { name: 'wallet', type: 'address' },
        { name: 'active', type: 'bool' },
      ],
    }],
  },
]

for (const url of RPCS) {
  const chain = defineChain({
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: [url] } },
  })
  const client = createPublicClient({ chain, transport: http() })

  process.stdout.write(`${url} → `)
  try {
    const count = await client.readContract({
      address: REGISTRY,
      abi: ABI,
      functionName: 'agentCount',
    })
    console.log(`agentCount = ${count}`)

    // Spot-check getAgent(10) and getAgent(14) — should be valid if seeded
    for (const i of [10n, 14n]) {
      try {
        const a = await client.readContract({
          address: REGISTRY,
          abi: ABI,
          functionName: 'getAgent',
          args: [i],
        })
        console.log(`   getAgent(${i}) → name="${a.name}" active=${a.active}`)
      } catch (e) {
        console.log(`   getAgent(${i}) → ERR ${e.shortMessage ?? e.message}`)
      }
    }
  } catch (e) {
    console.log(`ERR ${e.shortMessage ?? e.message}`)
  }
}
