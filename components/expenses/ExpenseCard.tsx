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
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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

  const participants = Array.isArray(expense.participants)
    ? expense.participants
    : [];
  const participantCount = participants.length;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{expense.description || "説明なし"}</h3>
          <p className="text-sm text-gray-600">
            {getDisplayName(expense.payer)}が¥{expense.amount.toLocaleString()}を支払い
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(expense.date).toLocaleDateString("ja-JP")}
          </p>
          {expense.splitType === "equal" && participantCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              均等割り（{participantCount}人で分割）
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "削除"}
        </button>
      </div>
    </div>
  );
}
