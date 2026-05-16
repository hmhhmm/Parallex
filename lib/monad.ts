import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet, publicClient } from './chain'

// Re-export for backward compatibility (server code can still import from monad.ts)
export { monadTestnet, publicClient }

/// Operator wallet — signs `completeAgent` payment txs.
/// In production this should be a hot wallet with limited MON balance.
export function getOperatorClient() {
  const raw = process.env.OPERATOR_PRIVATE_KEY?.trim()
  if (!raw) {
    throw new Error('OPERATOR_PRIVATE_KEY missing in .env.local')
  }
  // Accept with or without the 0x prefix — ethers is lenient, viem is not,
  // so normalise here to avoid a subtle drift between contracts/.env (used
  // by hardhat) and .env.local (used by the orchestrator).
  const pk = (raw.startsWith('0x') ? raw : `0x${raw}`) as `0x${string}`
  if (pk.length !== 66) {
    throw new Error(
      `OPERATOR_PRIVATE_KEY must be a 64-char hex string (got ${raw.length} chars)`
    )
  }

  const account = privateKeyToAccount(pk)
  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(),
  })
}

export async function checkMonadHealth(): Promise<{ ok: boolean; block?: string; error?: string }> {
  try {
    const block = await publicClient.getBlockNumber()
    return { ok: true, block: block.toString() }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
