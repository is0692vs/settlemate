'use client'

import { Balance } from '@/lib/utils/graph'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface BalanceListProps {
  balances: Balance[]
  currentUserId: string
}

// 金額をフォーマットするヘルパー関数
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function BalanceList({ balances, currentUserId }: BalanceListProps) {
  // 自分が払う必要がある残高
  const toPay = balances.filter((b) => b.userFrom === currentUserId)
  // 自分が貰える残高
  const toReceive = balances.filter((b) => b.userTo === currentUserId)

  // 小計を計算
  const totalToPay = toPay.reduce((acc, b) => acc + b.amount, 0)
  const totalToReceive = toReceive.reduce((acc, b) => acc + b.amount, 0)

  // 差額を計算 (払う - 貰う)
  const difference = totalToPay - totalToReceive

  if (balances.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">残高がありません</div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">あなたの残高</h3>

      {/* 払う必要があるセクション */}
      {toPay.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">払う必要がある</h4>
          <div className="space-y-2">
            {toPay.map((balance) => (
              <div
                key={`${balance.userFrom}-${balance.userTo}`}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={balance.toUser?.image ?? '/default-avatar.png'}
                    alt={balance.toUser?.name ?? 'アバター'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {balance.toUser?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="font-semibold text-lg">
                    {formatCurrency(balance.amount)}
                  </span>
                  <ArrowRight size={20} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-right font-semibold text-gray-600 pr-2">
            小計: {formatCurrency(totalToPay)}
          </div>
        </div>
      )}

      {/* 貰えるセクション */}
      {toReceive.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">貰える</h4>
          <div className="space-y-2">
            {toReceive.map((balance) => (
              <div
                key={`${balance.userFrom}-${balance.userTo}`}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={balance.fromUser?.image ?? '/default-avatar.png'}
                    alt={balance.fromUser?.name ?? 'アバター'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {balance.fromUser?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                   <ArrowLeft size={20} />
                  <span className="font-semibold text-lg">
                    {formatCurrency(balance.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right font-semibold text-gray-600 pr-2">
            小計: {formatCurrency(totalToReceive)}
          </div>
        </div>
      )}

      {/* 差額表示 */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-gray-800">差額:</span>
          <span
            className={
              difference < 0 ? 'text-green-600' : 'text-red-600'
            }
          >
            {difference > 0 ? '+' : ''}
            {formatCurrency(difference)}
          </span>
        </div>
        <p className="text-right text-sm text-gray-500 mt-1">
          {difference > 0 ? '払う方が多い' : (difference < 0 ? '貰う方が多い' : '差額なし')}
        </p>
      </div>
    </div>
  )
}