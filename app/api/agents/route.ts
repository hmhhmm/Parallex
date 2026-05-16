import { NextResponse } from 'next/server'
import { publicClient } from '@/lib/monad'
import { REGISTRY_ADDRESS, REGISTRY_ABI } from '@/lib/contracts'
import { AGENTS } from '@/lib/agents'

export const dynamic = 'force-dynamic'

export async function GET() {
  // If registry isn't deployed yet, return the off-chain definitions only
  if (REGISTRY_ADDRESS === '0x') {
    return NextResponse.json({
      source: 'off-chain',
      agents: AGENTS.map(a => ({
        id: a.id,
        name: a.name,
        specialty: 'TBD (registry not deployed)',
        pricePerTask: '0',
        wallet: '0x0',
        active: true,
      })),
    })
  }

  try {
    const count = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: 'agentCount',
    })

    const onChain = await Promise.all(
      Array.from({ length: Number(count) }, (_, i) =>
        publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: 'getAgent',
          args: [BigInt(i)],
        })
      )
    )

    const agents = onChain.map((a, i) => ({
      id: i,
      name: a.name,
      specialty: a.specialty,
      pricePerTask: a.pricePerTask.toString(),
      wallet: a.wallet,
      active: a.active,
      systemPrompt: AGENTS.find(x => x.id === i)?.systemPrompt ?? '',
    }))

    return NextResponse.json({ source: 'on-chain', agents })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
