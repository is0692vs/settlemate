'use client'

import { BarChartHorizontal, List } from 'lucide-react'
import { clsx } from 'clsx'

export type ViewType = 'graph' | 'list'

interface BalanceViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function BalanceViewToggle({
  view,
  onViewChange,
}: BalanceViewToggleProps) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onViewChange('graph')}
        className={clsx(
          'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          {
            'bg-white text-blue-600 shadow-sm': view === 'graph',
            'text-gray-600 hover:bg-gray-200': view !== 'graph',
          },
        )}
        aria-pressed={view === 'graph'}
      >
        <BarChartHorizontal size={18} />
        <span>グラフ</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={clsx(
          'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          {
            'bg-white text-blue-600 shadow-sm': view === 'list',
            'text-gray-600 hover:bg-gray-200': view !== 'list',
          },
        )}
        aria-pressed={view === 'list'}
      >
        <List size={18} />
        <span>リスト</span>
      </button>
    </div>
  )
}