const OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1:8b'

/// Non-streaming variant — returns the full response after generation completes.
/// Useful for tests, internal calls, or non-streaming clients.
export async function callOllama(systemPrompt: string, userInput: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      stream: false,
      options: { num_predict: 250, temperature: 0.7 },
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama returned ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  return data.message?.content ?? ''
}

/// Streaming variant — yields tokens as they're generated.
/// Use this in the orchestrator to give the frontend live "agent typing" UX.
export async function* callOllamaStream(
  systemPrompt: string,
  userInput: string
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      stream: true,
      options: { num_predict: 250, temperature: 0.7 },
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`Ollama stream returned ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      // Ollama sends newline-delimited JSON; split, keep last partial line in buffer
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const data = JSON.parse(trimmed)
          if (data.message?.content) {
            yield data.message.content as string
          }
          if (data.done) return
        } catch {
          // skip malformed JSON line
        }
      }
    }

    // Process any final buffered content
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.trim())
        if (data.message?.content) yield data.message.content as string
      } catch {
        // ignore
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/// Call this before demo to load the model into memory.
/// First call after a cold start takes ~20s; warmed calls are <5s.
export async function warmup(): Promise<void> {
  try {
    await callOllama('You are concise.', 'ping')
  } catch {
    // ignore — warmup is best-effort
  }
}

export async function checkOllamaHealth(): Promise<{ ok: boolean; model?: string; error?: string }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`)
    if (!res.ok) return { ok: false, error: `status ${res.status}` }
    const data = await res.json()
    const hasModel = data.models?.some((m: { name: string }) => m.name === MODEL)
    return { ok: hasModel, model: MODEL }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
