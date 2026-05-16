'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Play, RotateCcw, Zap } from 'lucide-react'

export interface AgentDef {
  id: string
  name: string
  role: string
  fee: string
  color: string   // accent hex
  icon: string    // emoji
}

const AGENT_LIBRARY: AgentDef[] = [
  { id: 'research', name: 'Research Analyst',     role: 'Scans on-chain data & protocols',    fee: '0.05 MON', color: '#836EFB', icon: '🔍' },
  { id: 'data',     name: 'Data Processor',       role: 'Normalises & structures datasets',   fee: '0.04 MON', color: '#00D1FF', icon: '⚙️' },
  { id: 'writer',   name: 'Content Writer',       role: 'Produces polished reports & copy',   fee: '0.06 MON', color: '#CCFF00', icon: '✍️' },
  { id: 'contract', name: 'Contract Deployer',    role: 'Writes & deploys Solidity on Monad', fee: '0.12 MON', color: '#FF6B6B', icon: '📜' },
  { id: 'trader',   name: 'DeFi Trader',          role: 'Executes swaps across DEXs',         fee: '0.08 MON', color: '#FFA500', icon: '📈' },
  { id: 'translate',name: 'Translator',           role: 'Localises content in 40+ languages', fee: '0.03 MON', color: '#34d399', icon: '🌏' },
]

const P = '#836EFB'   // Monad Purple
const L = '#CCFF00'   // Cyber Lime

interface Props {
  workflow: AgentDef[]
  onWorkflowChange: (w: AgentDef[]) => void
  onRun: () => void
  onReset: () => void
  running: boolean
  complete: boolean
}

export default function WorkflowBuilder({ workflow, onWorkflowChange, onRun, onReset, running, complete }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const addAgent = (agent: AgentDef) => {
    if (workflow.find(a => a.id === agent.id)) return
    onWorkflowChange([...workflow, agent])
    setPickerOpen(false)
  }

  const removeAgent = (id: string) => {
    onWorkflowChange(workflow.filter(a => a.id !== id))
  }

  const totalFee = workflow.reduce((s, a) => s + parseFloat(a.fee), 0).toFixed(2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.45em', color: P, textTransform: 'uppercase', margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)' }}>
            WORKFLOW BUILDER
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
            Stack your agents
          </h2>
        </div>
        {workflow.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-space-grotesk)' }}>Total cost</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: L, fontFamily: 'var(--font-space-grotesk)' }}>{totalFee} MON</div>
          </div>
        )}
      </div>

      {/* Agent cards + SVG connectors */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingRight: 2 }}>
        {workflow.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: 200, border: '1px dashed rgba(131,110,251,0.2)', borderRadius: 16,
            color: 'rgba(255,255,255,0.2)', gap: 10,
          }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-space-grotesk)' }}>Add agents to build your workflow</span>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {workflow.map((agent, i) => (
              <div key={agent.id}>
                <AgentCard agent={agent} index={i} onRemove={() => removeAgent(agent.id)} disabled={running} />
                {i < workflow.length - 1 && <Connector color={agent.color} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Agent button */}
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPickerOpen(o => !o)}
          disabled={running}
          style={{
            width: '100%', height: 42, borderRadius: 10,
            background: 'rgba(131,110,251,0.08)',
            border: `1px dashed ${pickerOpen ? P : 'rgba(131,110,251,0.3)'}`,
            color: pickerOpen ? P : 'rgba(255,255,255,0.45)',
            fontSize: 13, fontWeight: 500, cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={15} />
          Add Agent
        </motion.button>

        {/* Agent Picker */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute', bottom: '110%', left: 0, right: 0, zIndex: 50,
                background: 'rgba(8,8,18,0.97)',
                border: '1px solid rgba(131,110,251,0.3)',
                borderRadius: 14, padding: 10,
                backdropFilter: 'blur(20px)',
              }}
            >
              {AGENT_LIBRARY.map(agent => {
                const already = !!workflow.find(a => a.id === agent.id)
                return (
                  <button
                    key={agent.id}
                    disabled={already}
                    onClick={() => addAgent(agent)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 9, border: 'none',
                      background: already ? 'transparent' : 'transparent',
                      cursor: already ? 'default' : 'pointer',
                      opacity: already ? 0.35 : 1,
                      transition: 'background 0.15s',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!already) e.currentTarget.style.background = 'rgba(131,110,251,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{agent.icon}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>{agent.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-space-grotesk)' }}>{agent.role}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: agent.color, fontFamily: 'var(--font-space-grotesk)' }}>{agent.fee}</span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Run / Reset */}
      <div style={{ display: 'flex', gap: 8 }}>
        {complete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <RotateCcw size={16} />
          </motion.button>
        )}

        <motion.button
          whileHover={workflow.length > 0 && !running ? { scale: 1.02 } : {}}
          whileTap={workflow.length > 0 && !running ? { scale: 0.98 } : {}}
          onClick={() => workflow.length > 0 && !running && onRun()}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            background: workflow.length === 0 || running
              ? 'rgba(255,255,255,0.04)'
              : complete
                ? `linear-gradient(135deg, ${L}, #a3e635)`
                : `linear-gradient(135deg, ${P}, #4f46e5)`,
            border: 'none',
            color: workflow.length === 0 || running ? 'rgba(255,255,255,0.2)' : complete ? '#000' : '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: workflow.length === 0 || running ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            letterSpacing: '0.04em', transition: 'background 0.3s ease',
          }}
        >
          {running ? (
            <>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'wspin 0.7s linear infinite' }} />
              EXECUTING
            </>
          ) : complete ? (
            <><Zap size={15} /> RUN AGAIN</>
          ) : (
            <><Play size={14} fill="currentColor" /> RUN WORKFLOW</>
          )}
        </motion.button>
      </div>

      <style>{`@keyframes wspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function AgentCard({ agent, index, onRemove, disabled }: { agent: AgentDef; index: number; onRemove: () => void; disabled: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 12, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative',
      }}
    >
      {/* Step number */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: `${agent.color}22`, border: `1px solid ${agent.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: agent.color,
        fontFamily: 'var(--font-space-grotesk)',
      }}>
        {index + 1}
      </div>

      <span style={{ fontSize: 20 }}>{agent.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>{agent.name}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-space-grotesk)' }}>{agent.role}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: agent.color, fontFamily: 'var(--font-space-grotesk)' }}>{agent.fee}</span>
        {!disabled && (
          <button
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 2, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF6B6B' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Connector({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '-1px 0', position: 'relative', zIndex: 1 }}>
      <svg width="2" height="24" viewBox="0 0 2 24">
        <line x1="1" y1="0" x2="1" y2="24"
          stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity={0.5} />
      </svg>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.7, marginTop: -3 }} />
    </div>
  )
}
