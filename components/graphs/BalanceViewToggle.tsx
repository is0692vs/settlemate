'use client';

interface BalanceViewToggleProps {
  view: 'graph' | 'list';
  onViewChange: (view: 'graph' | 'list') => void;
}

export default function BalanceViewToggle({
  view,
  onViewChange,
}: BalanceViewToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
      <button
        onClick={() => onViewChange('graph')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
          min-h-[44px] min-w-[44px]
          ${
            view === 'graph'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }
        `}
        aria-label="グラフ表示"
      >
        <span className="text-lg">📊</span>
        <span className="hidden sm:inline">グラフ</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
          min-h-[44px] min-w-[44px]
          ${
            view === 'list'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }
        `}
        aria-label="リスト表示"
      >
        <span className="text-lg">📋</span>
        <span className="hidden sm:inline">リスト</span>
      </button>
    </div>
  );
}
