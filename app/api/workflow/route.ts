import { NextRequest } from 'next/server'
import { runWorkflow, type WorkflowDef } from '@/lib/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RequestBody = {
  workflowId: string // BigInt as string
  def: WorkflowDef
}

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!body.workflowId || !body.def?.steps?.length) {
    return new Response('Missing workflowId or steps', { status: 400 })
  }

  let workflowId: bigint
  try {
    workflowId = BigInt(body.workflowId)
  } catch {
    return new Response('workflowId must be numeric string', { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runWorkflow(workflowId, body.def)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
