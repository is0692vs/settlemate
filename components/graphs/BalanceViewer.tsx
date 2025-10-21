'use client'

import { useState } from 'react'
import { BalanceList } from './BalanceList'
import { BalanceViewToggle, ViewType } from './BalanceViewToggle'
import BalanceGraph from './BalanceGraph'
import { Balance } from '@/lib/utils/graph'
import { Node, Edge } from '@xyflow/react'
import { UserNodeData, DebtEdgeData } from '@/lib/utils/graph'

interface BalanceViewerProps {
  balances: Balance[]
  currentUserId: string
  nodes: Node<UserNodeData>[]
  edges: Edge<DebtEdgeData>[]
}

export function BalanceViewer({
  balances,
  currentUserId,
  nodes,
  edges,
}: BalanceViewerProps) {
  const [view, setView] = useState<ViewType>('graph')

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <BalanceViewToggle view={view} onViewChange={setView} />
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {view === 'graph' ? (
          <div style={{ height: '500px' }}>
            <BalanceGraph nodes={nodes} edges={edges} />
          </div>
        ) : (
          <BalanceList balances={balances} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  )
}