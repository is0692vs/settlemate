// components/balance/AggregatedBalanceList.tsx
'use client';

import Image from 'next/image';
import type { AggregatedBalance } from '@/lib/utils/cross-group-balance';
import { GroupBalanceAccordion } from './GroupBalanceAccordion';

type Props = {
  toPay: AggregatedBalance[];
  toReceive: AggregatedBalance[];
};

export function AggregatedBalanceList({ toPay, toReceive }: Props) {
  const totalPay = toPay.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalReceive = toReceive.reduce((sum, b) => sum + b.totalAmount, 0);
  const netBalance = totalReceive - totalPay;

  return (
    <div className="space-y-6">
      {/* サマリ */}
      <div className="bg-white rounded-lg border p-4 space-y-2 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">払う合計</span>
          <span className="text-red-600 font-medium">
            ¥{totalPay.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">貰う合計</span>
          <span className="text-green-600 font-medium">
            ¥{totalReceive.toLocaleString()}
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium">差額</span>
          <span
            className={`font-bold ${
              netBalance > 0
                ? 'text-green-600'
                : netBalance < 0
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {netBalance > 0 ? '+' : ''}¥{netBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 払う一覧 */}
      {toPay.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            払う（{toPay.length}人）
          </h3>
          <div className="space-y-3">
            {toPay.map((balance) => (
              <div
                key={balance.userId}
                className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {balance.userImage ? (
                      <Image
                        src={balance.userImage}
                        alt={balance.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {balance.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{balance.userName}</div>
                      <div className="text-sm text-gray-500">
                        {balance.groupBalances.length}グループ
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ¥{balance.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">払う</div>
                  </div>
                </div>
                <GroupBalanceAccordion
                  groupBalances={balance.groupBalances}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 貰う一覧 */}
      {toReceive.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600">
            貰う（{toReceive.length}人）
          </h3>
          <div className="space-y-3">
            {toReceive.map((balance) => (
              <div
                key={balance.userId}
                className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {balance.userImage ? (
                      <Image
                        src={balance.userImage}
                        alt={balance.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {balance.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{balance.userName}</div>
                      <div className="text-sm text-gray-500">
                        {balance.groupBalances.length}グループ
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ¥{balance.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">貰う</div>
                  </div>
                </div>
                <GroupBalanceAccordion
                  groupBalances={balance.groupBalances}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状態 */}
      {toPay.length === 0 && toReceive.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          すべてのグループで残高がありません
        </div>
      )}
    </div>
  );
}
