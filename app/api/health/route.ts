import { NextResponse } from 'next/server'
import { checkMonadHealth } from '@/lib/monad'
import { checkOllamaHealth } from '@/lib/ollama'
import { REGISTRY_ADDRESS, ESCROW_ADDRESS } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [monad, ollama] = await Promise.all([
    checkMonadHealth(),
    checkOllamaHealth(),
  ])

  const contracts = {
    registry: { configured: REGISTRY_ADDRESS !== '0x', address: REGISTRY_ADDRESS },
    escrow: { configured: ESCROW_ADDRESS !== '0x', address: ESCROW_ADDRESS },
  }

  const allOk = monad.ok && ollama.ok && contracts.registry.configured && contracts.escrow.configured

  // Always return 200 — `ok` field tells you whether everything is wired up.
  // PowerShell's Invoke-WebRequest hides body on non-2xx, so 503 was making debugging hard.
  return NextResponse.json({ ok: allOk, monad, ollama, contracts })
}
