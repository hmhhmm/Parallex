import { NextRequest, NextResponse } from 'next/server'
import { callOllama } from '@/lib/ollama'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_LEN = 200

/**
 * Rewrites a specific one-off prompt into a reusable template by stripping out
 * concrete values (amounts, names, dates, places). Used when saving a stack so
 * the next user (or the same user later) doesn't see hard-coded specifics.
 */
export async function POST(req: NextRequest) {
  let body: { intent?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const intent = body.intent?.trim() ?? ''
  if (!intent) {
    return NextResponse.json({ generalized: '', source: 'empty' })
  }

  const systemPrompt = `You are rewriting a one-off task description into a REUSABLE TEMPLATE for an AI workflow.

Rules — VERY IMPORTANT:
- Strip out SPECIFIC values: amounts, currencies, dates, proper names, places, counts of people.
- Replace them with general descriptors: "friends", "a group", "a topic", "an amount", "a target audience".
- Keep the original structure, intent, and language style (English stays English).
- Output ONLY the rewritten template — no preamble, no quotes, no commentary, no markdown.

Examples:
Input: "Split a mamak bill of RM 87 among 4 friends (Ali, Ahmad, Siti, Jia) and shame those who don't pay"
Output: Split a mamak bill among friends and shame those who don't pay

Input: "Translate my README from English to Mandarin for my Chinese boss"
Output: Translate text from one language to another for a target audience

Input: "Research the top 5 NFT projects launched in 2024 and write a 300-word summary"
Output: Research top NFT projects and write a short summary

Input: "Build a smart contract that splits a mamak bill of RM 87 among 4 friends and shame those who don't pay"
Output: Build a smart contract that splits a bill among friends and shame those who don't pay

Input: "Find the best mamak in PJ"
Output: Find the best mamak in a chosen area`

  try {
    const raw = await callOllama(systemPrompt, `Input: "${intent}"\nOutput:`)
    let out = (raw.split('\n')[0] ?? '').trim()
    // Strip quotes / leading punctuation
    out = out.replace(/^["'`*\s\-•]+|["'`*\s]+$/g, '').trim()
    if (out.length > MAX_LEN) out = out.slice(0, MAX_LEN).trim()
    if (!out) throw new Error('empty')
    return NextResponse.json({ generalized: out, source: 'llm' })
  } catch {
    // Fallback: return the original (still reusable, just not generalised)
    return NextResponse.json({ generalized: intent, source: 'fallback' })
  }
}
