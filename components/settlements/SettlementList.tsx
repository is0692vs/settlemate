"use client";

import { useState } from "react";
import { cancelSettlement } from "@/app/dashboard/groups/[id]/actions";
import Image from "next/image";

interface SettlementListProps {
  groupId: string;
  settlements: Array<{
    id: string;
    userFrom: string;
    userTo: string;
    amount: number;
    method: string;
    description: string | null;
    createdAt: string;
    fromUser: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    toUser: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  }>;
  currentUserId: string;
}

export default function SettlementList({
  groupId,
  settlements,
  currentUserId,
}: SettlementListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (settlementId: string) => {
    if (!confirm("この返済記録を取り消しますか?\n残高が元に戻ります。")) {
      return;
    }

    try {
      setCancellingId(settlementId);
      await cancelSettlement(settlementId, groupId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setCancellingId(null);
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "💵 現金",
      bank_transfer: "🏦 銀行振込",
      paypay: "💰 PayPay",
      line_pay: "💳 LINE Pay",
    };
    return labels[method] || method;
  };

  if (settlements.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">返済履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settlements.map((settlement) => {
        const fromUser = settlement.fromUser;
        const toUser = settlement.toUser;
        const canCancel = settlement.userFrom === currentUserId;

        return (
          <div
            key={settlement.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {fromUser?.image ? (
                    <Image
                      src={fromUser.image}
                      alt={fromUser.name || ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {fromUser?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">
                    {fromUser?.name || "名前未設定"}
                  </span>
                  <span className="text-gray-500">→</span>
                  {toUser?.image ? (
                    <Image
                      src={toUser.image}
                      alt={toUser.name || ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {toUser?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">
                    {toUser?.name || "名前未設定"}
                  </span>
                </div>

                <p className="text-2xl font-bold text-green-600 mb-1">
                  ¥{settlement.amount.toLocaleString()}
                </p>

                <p className="text-sm text-gray-600 mb-1">
                  {getMethodLabel(settlement.method)}
                </p>

                {settlement.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {settlement.description}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(settlement.createdAt).toLocaleString("ja-JP")}
                </p>
              </div>

              {canCancel && (
                <button
                  onClick={() => handleCancel(settlement.id)}
                  disabled={cancellingId === settlement.id}
                  className="text-red-600 hover:text-red-700 text-sm disabled:text-gray-400"
                >
                  {cancellingId === settlement.id ? "取消中..." : "取消"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
