import { NextRequest, NextResponse } from 'next/server'
import { callOllama } from '@/lib/ollama'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_NAME_LEN = 40

export async function POST(req: NextRequest) {
  let body: { intent?: string; agentNames?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const intent = body.intent?.trim() ?? ''
  const agentNames = (body.agentNames ?? []).filter(s => typeof s === 'string')

  if (!intent && agentNames.length === 0) {
    return NextResponse.json({ name: 'Untitled Stack', source: 'empty' })
  }

  const systemPrompt = `You name AI agent workflows. Given a user's goal and the agents chosen for the job, output a SHORT 2-5 word title.

Rules — IMPORTANT:
- Output ONLY the title text. No quotes, no markdown, no preamble, no period at the end.
- 2 to 5 words. Title case.
- Punchy. Specific. Reads like a product name a user would recognise.

Examples:
Goal: "Build a smart contract that splits the mamak bill"
Agents: Outline Builder, Code Engineer, Critic, Email Drafter
Output: Mamak Bill Splitter

Goal: "Translate web3 jargon to Bahasa for my grandma"
Agents: Research Analyst, Tutor, Translator
Output: Bahasa Web3 Tutor

Goal: "Research for my FYP"
Agents: Research Analyst, Outline Builder, Fact Checker, Content Writer
Output: FYP Research Assistant`

  try {
    const raw = await callOllama(
      systemPrompt,
      `Goal: "${intent}"\nAgents: ${agentNames.join(', ')}\nOutput:`
    )
    const name = sanitiseTitle(raw)
    if (!name) throw new Error('empty title')
    return NextResponse.json({ name, source: 'llm' })
  } catch {
    return NextResponse.json({ name: fallback(intent, agentNames), source: 'fallback' })
  }
}

// Strip quotes, leading/trailing punctuation, collapse whitespace, cap length.
function sanitiseTitle(raw: string): string {
  let s = raw.split('\n')[0] ?? ''
  s = s.replace(/^["'`*\s\-•]+|["'`*\s.,!?:;\-•]+$/g, '').trim()
  s = s.replace(/\s+/g, ' ')
  if (s.length > MAX_NAME_LEN) s = s.slice(0, MAX_NAME_LEN).trim()
  return s
}

function fallback(intent: string, agentNames: string[]): string {
  if (intent) {
    const cut = intent.slice(0, MAX_NAME_LEN).trim()
    return cut.charAt(0).toUpperCase() + cut.slice(1)
  }
  if (agentNames.length > 0) {
    return `${agentNames[0]} Pipeline`
  }
  return 'Untitled Stack'
}
