import { NextRequest, NextResponse } from 'next/server'
import { AGENTS } from '@/lib/agents'
import { callOllama } from '@/lib/ollama'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Map on-chain numeric agent IDs to the UI string IDs used by WorkflowBuilder.
// Keep in sync with STRING_TO_NUMERIC in hooks/useWorkflow.ts.
const NUMERIC_TO_UI: Record<number, string> = {
  0:  'research',
  1:  'contract',
  2:  'writer',
  3:  'data',
  4:  'translate',
  5:  'trader',
  6:  'summarizer',
  7:  'qabot',
  8:  'emailer',
  9:  'critic',
  10: 'outliner',
  11: 'ideator',
  12: 'mathsolver',
  13: 'factchecker',
  14: 'tutor',
}

const VALID_UI_IDS = new Set(Object.values(NUMERIC_TO_UI))

// Short purpose blurbs to help the LLM pick well without ballooning the prompt
const PURPOSES: Record<string, string> = {
  research:    'gathers facts and intelligence on a topic',
  contract:    'writes Solidity smart contracts',
  writer:      'produces polished prose, blogs, reports',
  data:        'processes datasets and finds patterns',
  translate:   'translates content into Bahasa Melayu',
  trader:      'gives strategic recommendations',
  summarizer:  'condenses long text into bullets',
  qabot:       'answers specific questions directly',
  emailer:     'drafts professional emails with subject lines',
  critic:      'reviews work and gives constructive feedback',
  outliner:    'builds structured outlines for a topic',
  ideator:     'brainstorms creative ideas',
  mathsolver:  'solves math problems step by step',
  factchecker: 'verifies claims as TRUE / FALSE / UNVERIFIED',
  tutor:       'explains concepts with analogies',
}

export async function POST(req: NextRequest) {
  let body: { task?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const task = body.task?.trim()
  if (!task) {
    return NextResponse.json({ error: 'Missing task' }, { status: 400 })
  }

  // Build the candidate agent list shown to the LLM
  const lines = AGENTS.map(a => {
    const uiId = NUMERIC_TO_UI[a.id]
    if (!uiId) return null
    return `- ${uiId}: ${a.name} — ${PURPOSES[uiId] ?? ''}`
  }).filter(Boolean)

  const systemPrompt = `You are a workflow composer for an AI agent marketplace.
Given a user goal and a list of available agents, choose 2-4 agents that should
run IN SEQUENCE to accomplish the goal. Earlier agents feed their output into
later ones.

Output rules — VERY IMPORTANT:
- Output ONLY a JSON array of agent string IDs, in the exact order they should run.
- No prose, no markdown, no commentary, no code fences. Just the array.
- Use ONLY ids from the list. Do not invent new ids.

Available agents:
${lines.join('\n')}

Examples:
Goal: "research crypto trends and write a blog post"
Output: ["research","outliner","writer"]

Goal: "translate my smart contract documentation to Bahasa"
Output: ["contract","translate"]

Goal: "verify facts in this article and summarise"
Output: ["factchecker","summarizer"]`

  let agentIds: string[] | null = null
  let llmRaw = ''
  try {
    llmRaw = await callOllama(systemPrompt, `Goal: "${task}"\nOutput:`)
    const match = llmRaw.match(/\[[\s\S]*?\]/)
    if (!match) throw new Error('no JSON array in LLM output')
    const parsed = JSON.parse(match[0]) as unknown
    if (!Array.isArray(parsed)) throw new Error('LLM output was not an array')
    agentIds = parsed
      .filter((x): x is string => typeof x === 'string' && VALID_UI_IDS.has(x))
      // Drop duplicates while preserving order
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .slice(0, 6)
    if (agentIds.length === 0) throw new Error('LLM returned no valid IDs')
  } catch (e) {
    // Keyword-based fallback so the demo never lands on an empty pipeline
    agentIds = keywordFallback(task.toLowerCase())
    return NextResponse.json({
      agentIds,
      source: 'fallback',
      reason: e instanceof Error ? e.message : String(e),
      llmRaw,
    })
  }

  return NextResponse.json({ agentIds, source: 'llm', llmRaw })
}

function keywordFallback(t: string): string[] {
  const picks: string[] = []
  const add = (id: string) => { if (!picks.includes(id)) picks.push(id) }

  if (/\b(fyp|thesis|dissertation|capstone|final year)\b/.test(t)) {
    add('research'); add('outliner'); add('factchecker'); add('writer')
  }
  if (/\b(research|study|investigate|analyse|analyz|find|discover)\b/.test(t)) add('research')
  if (/\b(outline|structure|plan|organi[sz]e)\b/.test(t))   add('outliner')
  if (/\b(write|draft|article|blog|essay|report|copy)\b/.test(t)) add('writer')
  if (/\b(summari[sz]e|tldr|condense|shorten)\b/.test(t))   add('summarizer')
  if (/\b(verify|fact[- ]?check|confirm|prove)\b/.test(t))  add('factchecker')
  if (/\b(translate|localis|bahasa|melayu|chinese|spanish)\b/.test(t)) add('translate')
  if (/\b(email|message|letter)\b/.test(t))                 add('emailer')
  if (/\b(critique|review|feedback|critic)\b/.test(t))      add('critic')
  if (/\b(idea|brainstorm|creative|innovat)\b/.test(t))     add('ideator')
  if (/\b(math|calculat|solve|equation|number)\b/.test(t))  add('mathsolver')
  if (/\b(teach|explain|tutorial|understand|learn)\b/.test(t)) add('tutor')
  if (/\b(question|q&a|answer|ask)\b/.test(t))              add('qabot')
  if (/\b(data|statistic|metric|dataset|csv)\b/.test(t))    add('data')
  if (/\b(contract|solidity|smart[- ]contract|deploy|on[- ]chain)\b/.test(t)) add('contract')
  if (/\b(strategy|recommend|advise|advisor)\b/.test(t))    add('trader')

  if (picks.length === 0) return ['research', 'outliner', 'writer']
  return picks.slice(0, 4)
}
