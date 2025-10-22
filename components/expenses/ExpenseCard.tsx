// components/expenses/ExpenseCard.tsx
"use client";

import type { Expense, User } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDisplayName } from "@/lib/utils/user";

type ExpenseWithPayer = Expense & {
  payer: User;
};

interface ExpenseCardProps {
  expense: ExpenseWithPayer;
  groupId: string;
  members: User[];
  currentUserId: string;
}

export function ExpenseCard({
  expense,
  members,
  currentUserId,
}: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // 参加者情報を解析
  const participants = Array.isArray(expense.participants)
    ? expense.participants
    : [];

  // 参加者のUserオブジェクトを取得 (支払者も含む)
  const participantUsers: User[] = [];
  for (const p of participants) {
    if (!p || typeof p !== "object") continue;
    const userId = (p as { userId: string }).userId;
    if (!userId) continue;
    const user = members.find((m) => m.id === userId);
    if (user) participantUsers.push(user);
  }
  // 支払者を参加者リストに追加(重複除外)
  if (!participantUsers.find((u) => u.id === expense.paidBy)) {
    const payer = members.find((m) => m.id === expense.paidBy);
    if (payer) participantUsers.push(payer);
  }

  const totalMembers = members.length;
  const participantCount = participantUsers.length;
  const isCurrentUserParticipant = participantUsers.some(
    (u) => u.id === currentUserId
  );

  const handleDelete = async () => {
    if (!confirm("この支出を削除しますか？")) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("支出の削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isCurrentUserParticipant
          ? "hover:bg-gray-50 border-gray-300"
          : "bg-gray-100 opacity-75 border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">
              {expense.description || "説明なし"}
            </h3>
            {!isCurrentUserParticipant && (
              <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                不参加
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {getDisplayName(expense.payer)}が¥{expense.amount.toLocaleString()}
            を支払い
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(expense.date).toLocaleDateString("ja-JP")}
          </p>

          {/* 参加者情報 */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-600">
              <span className="sr-only">参加者</span><span aria-hidden="true">👥</span> {participantCount}/{totalMembers}人
            </span>
            <div className="flex items-center gap-1">
              {participantUsers.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  title={getDisplayName(user)}
                >
                  {getDisplayName(user).slice(0, 3)}
                </div>
              ))}
              {participantCount > 4 && (
                <span className="text-xs text-gray-500">
                  +{participantCount - 4}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 disabled:opacity-50 ml-2"
        >
          {isDeleting ? "削除中..." : "削除"}
        </button>
      </div>
    </div>
  );
}
