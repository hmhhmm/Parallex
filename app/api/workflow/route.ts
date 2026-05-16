export const runtime = 'edge'

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

function hex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      // ── Phase 1: Research Analyst starts ──────────────────────────
      await delay(600)
      emit('step_start', { agentId: 'research', step: 0 })

      const researchLines = [
        'Connecting to DeFi data feeds…',
        'Scanning 47 protocols across 6 chains…',
        'Uniswap v3 › TVL $4.2B · Fees 0.05–1% · Risk LOW',
        'Aave v3    › TVL $7.8B · Fees variable · Risk LOW-MED',
        'Curve      › TVL $2.1B · Fees 0.04% · Risk LOW',
        'GMX        › TVL $0.9B · Fees 0.1% · Risk MED',
        'Lido       › TVL $14.3B · Yield 3.8% · Risk LOW-MED',
        'Research complete. Passing to Data Processor…',
      ]
      for (const line of researchLines) {
        await delay(380)
        emit('agent_output', { agentId: 'research', text: line })
      }

      await delay(300)
      emit('agent_paid', { agentId: 'research', amount: '0.05', txHash: '0x' + hex(40) })

      // ── Phase 2: Data + Writer start in parallel ──────────────────
      await delay(200)
      emit('step_start', { agentId: 'data', step: 1 })
      emit('step_start', { agentId: 'writer', step: 2 })

      const dataLines = [
        'Ingesting 5-protocol dataset (312 rows)…',
        'Normalising TVL to USD baseline…',
        'Computing fee-adjusted yield curves…',
        'Building comparison matrix…',
        'Generating chart payloads…',
        'Data pipeline complete.',
      ]
      const writerLines = [
        'Receiving structured data from processor…',
        'Drafting executive summary…',
        'Writing protocol-by-protocol breakdown…',
        'Applying Parallex house style…',
        'Inserting risk-adjusted insights…',
        'Report finalised. 1,240 words.',
      ]

      for (let i = 0; i < dataLines.length; i++) {
        await delay(480)
        emit('agent_output', { agentId: 'data',   text: dataLines[i]   })
        emit('agent_output', { agentId: 'writer', text: writerLines[i] })
      }

      // ── Phase 3: Parallel payments (the showstopper) ─────────────
      await delay(250)
      emit('agent_paid', { agentId: 'data',   amount: '0.04', txHash: '0x' + hex(40) })
      await delay(80)
      emit('agent_paid', { agentId: 'writer', amount: '0.06', txHash: '0x' + hex(40) })

      // ── Phase 4: Complete ─────────────────────────────────────────
      await delay(800)
      emit('workflow_complete', {
        totalCost: '0.15',
        duration:  '8.4s',
        txCount:   23,
        tps:       '10,000+',
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection:      'keep-alive',
    },
  })
}
