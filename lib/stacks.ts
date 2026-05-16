// Client-side storage for user-saved agent pipelines ("stacks").
// Lives in localStorage — no backend, survives refresh, scoped per browser.

export interface SavedStack {
  id: string          // uuid-ish, locally generated
  name: string        // user-given
  agentIds: string[]  // UI string IDs (research, writer, ...)
  intent?: string     // the goal text that produced this stack, if any
  createdAt: number   // unix ms
  lastUsed?: number   // unix ms — bumped on each run
  runCount: number
}

const KEY = 'parallex.stacks.v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function makeId(): string {
  return `stk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadStacks(): SavedStack[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    // Defensive shape filter
    return parsed.filter((s): s is SavedStack =>
      !!s &&
      typeof s === 'object' &&
      typeof (s as SavedStack).id === 'string' &&
      typeof (s as SavedStack).name === 'string' &&
      Array.isArray((s as SavedStack).agentIds)
    )
  } catch {
    return []
  }
}

function persist(stacks: SavedStack[]): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stacks))
  } catch {
    // localStorage may be full or disabled; silently ignore.
  }
}

export function saveStack(input: {
  name: string
  agentIds: string[]
  intent?: string
}): SavedStack {
  const name = input.name.trim() || 'Untitled stack'
  const stack: SavedStack = {
    id: makeId(),
    name,
    agentIds: [...input.agentIds],
    intent: input.intent?.trim() || undefined,
    createdAt: Date.now(),
    runCount: 0,
  }
  const all = loadStacks()
  all.unshift(stack) // newest first
  persist(all)
  return stack
}

export function deleteStack(id: string): void {
  const all = loadStacks().filter(s => s.id !== id)
  persist(all)
}

export function touchStack(id: string): void {
  const all = loadStacks()
  const i = all.findIndex(s => s.id === id)
  if (i < 0) return
  all[i] = { ...all[i], lastUsed: Date.now(), runCount: all[i].runCount + 1 }
  persist(all)
}

export function renameStack(id: string, newName: string): void {
  const all = loadStacks()
  const i = all.findIndex(s => s.id === id)
  if (i < 0) return
  all[i] = { ...all[i], name: newName.trim() || all[i].name }
  persist(all)
}
