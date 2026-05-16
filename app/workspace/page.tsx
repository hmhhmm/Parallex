'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Topbar from '@/components/workspace/Topbar'
import WorkspaceCursor from '@/components/workspace/WorkspaceCursor'
import Step1Describe from '@/components/workspace/Step1Describe'
import Step2Agents from '@/components/workspace/Step2Agents'
import Step3Execute from '@/components/workspace/Step3Execute'
import Step4Results from '@/components/workspace/Step4Results'
import { useWorkflow } from '@/hooks/useWorkflow'

// Workspace always uses these three agents in order
const AGENT_IDS = ['research', 'data', 'writer']

export default function WorkspacePage() {
  const [step, setStep] = useState(1)
  const [task, setTask] = useState('')

  const { agents, running, complete, summary, payments, start, reset } = useWorkflow(AGENT_IDS)

  // Auto-advance to results when SSE workflow_complete fires
  useEffect(() => {
    if (complete && step === 3) setStep(4)
  }, [complete, step])

  const handleStep1 = (t: string) => { setTask(t); setStep(2) }

  const handleStep2 = () => {
    start()   // opens EventSource → /api/workflow
    setStep(3)
  }

  const handleRestart = () => {
    reset()
    setTask('')
    setStep(1)
  }

  return (
    <main style={{ width: '100vw', minHeight: '100vh', background: '#070710', overflow: 'hidden' }}>
      <WorkspaceCursor />
      <Topbar step={step} />

      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        minHeight: '100vh', paddingTop: 96, paddingBottom: 48,
        paddingLeft: 24, paddingRight: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <div key="step1">
                <Step1Describe onComplete={handleStep1} />
              </div>
            )}
            {step === 2 && (
              <div key="step2">
                <Step2Agents onComplete={handleStep2} />
              </div>
            )}
            {step === 3 && (
              <div key="step3">
                <Step3Execute
                  agents={agents}
                  running={running}
                  complete={complete}
                  onComplete={() => setStep(4)}
                />
              </div>
            )}
            {step === 4 && summary && (
              <div key="step4">
                <Step4Results
                  task={task}
                  summary={summary}
                  payments={payments}
                  onRestart={handleRestart}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
