import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet, publicClient } from './chain'

// Re-export for backward compatibility (server code can still import from monad.ts)
export { monadTestnet, publicClient }

/// Operator wallet — signs `completeAgent` payment txs.
/// In production this should be a hot wallet with limited MON balance.
export function getOperatorClient() {
  const pk = process.env.OPERATOR_PRIVATE_KEY
  if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
    throw new Error('OPERATOR_PRIVATE_KEY missing or malformed in .env.local')
  }

  const account = privateKeyToAccount(pk as `0x${string}`)
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
