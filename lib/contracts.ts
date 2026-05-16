export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? '0x') as `0x${string}`
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? '0x') as `0x${string}`

export const REGISTRY_ABI = [
  {
    name: 'agentCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getAgent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'specialty', type: 'string' },
          { name: 'pricePerTask', type: 'uint256' },
          { name: 'wallet', type: 'address' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
] as const

export const ESCROW_ABI = [
  {
    name: 'startWorkflow',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'agentIds', type: 'uint256[]' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'completeAgent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'workflowId', type: 'uint256' },
      { name: 'agentIndex', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'workflowCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'WorkflowStarted',
    type: 'event',
    inputs: [
      { name: 'workflowId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'totalDeposit', type: 'uint256', indexed: false },
      { name: 'agentIds', type: 'uint256[]', indexed: false },
    ],
  },
  {
    name: 'AgentPaid',
    type: 'event',
    inputs: [
      { name: 'workflowId', type: 'uint256', indexed: true },
      { name: 'agentId', type: 'uint256', indexed: false },
      { name: 'agentIndex', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'WorkflowCompleted',
    type: 'event',
    inputs: [{ name: 'workflowId', type: 'uint256', indexed: true }],
  },
] as const
