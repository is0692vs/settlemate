// components/expenses/ExpenseForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { useState } from "react";
import { getDisplayName } from "@/lib/utils/user";

const schema = z.object({
  description: z.string().min(1, "説明を入力してください"),
  amount: z.number().positive("金額は正の数である必要があります"),
  paidBy: z.string().min(1, "支払者を選択してください"),
  participants: z.array(z.string()).min(2, "最低2人(支払者+1人以上)を選択してください"),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormProps {
  groupId: string;
  members: User[];
}

export function ExpenseForm({ groupId, members }: ExpenseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    members.map((m) => m.id)
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      participants: members.map((m) => m.id),
    },
  });

  const paidBy = watch("paidBy");
  const amount = watch("amount") || 0;

  // 支払者が変更されたら、自動的に参加者リストに含める
  const handlePaidByChange = (newPaidBy: string) => {
    if (newPaidBy && !selectedParticipants.includes(newPaidBy)) {
      const updated = [...selectedParticipants, newPaidBy];
      setSelectedParticipants(updated);
      setValue("participants", updated);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    // 支払者は選択解除不可
    if (userId === paidBy) return;

    const updated = selectedParticipants.includes(userId)
      ? selectedParticipants.filter((id) => id !== userId)
      : [...selectedParticipants, userId];

    setSelectedParticipants(updated);
    setValue("participants", updated);
  };

  const participantCount = selectedParticipants.length;

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      // 選択された参加者のみで均等割り計算
      const debtors = data.participants.filter((id) => id !== data.paidBy);
      const totalPeople = data.participants.length;
      const perPerson = Math.floor(data.amount / totalPeople);
      const remainder = data.amount % totalPeople;

      const participants = debtors.map((userId, index) => ({
        userId,
        amount: perPerson + (index < remainder ? 1 : 0),
      }));

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          description: data.description,
          amount: data.amount,
          paidBy: data.paidBy,
          splitType: "equal",
          participants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "支出の作成に失敗しました");
      }

      router.push(`/dashboard/groups/${groupId}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to create expense:", err);
      setError(err instanceof Error ? err.message : "支出の作成に失敗しました");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">説明</label>
        <input
          {...register("description")}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ランチ代"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">金額</label>
        <input
          type="number"
          {...register("amount", { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3000"
        />
        {errors.amount && (
          <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

            <div>
        <label className="block text-sm font-medium mb-1">支払者</label>
        <select
          {...register("paidBy", {
            onChange: (e) => handlePaidByChange(e.target.value),
          })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {getDisplayName(member)}
            </option>
          ))}
        </select>
        {errors.paidBy && (
          <p className="text-red-600 text-sm mt-1">{errors.paidBy.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          参加者を選択
          <span className="ml-2 text-blue-600 font-semibold">
            👥 {participantCount}人が参加
          </span>
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
          {members.map((member) => {
            const isSelected = selectedParticipants.includes(member.id);
            const isPayer = member.id === paidBy;
            return (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                  isPayer
                    ? "bg-blue-100 border-2 border-blue-400"
                    : isSelected
                    ? "bg-white border-2 border-blue-300 hover:bg-blue-50"
                    : "bg-white border-2 border-gray-200 hover:bg-gray-100"
                }`}
                style={{ minHeight: "44px" }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleParticipantToggle(member.id)}
                  disabled={isPayer}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {getDisplayName(member)}
                    {isPayer && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        支払者
                      </span>
                    )}
                  </div>
                  {member.email && (
                    <div className="text-xs text-gray-500">{member.email}</div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {errors.participants && (
          <p className="text-red-600 text-sm mt-1">
            {errors.participants.message}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-sm text-blue-800">
          💡 選択された{participantCount}人で金額を均等に分割します
          {participantCount > 0 && amount > 0 && (
            <span className="block mt-1 font-semibold">
              1人あたり: 約¥
              {Math.floor(amount / participantCount).toLocaleString()}
            </span>
          )}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "作成中..." : "支出を作成"}
      </button>
    </form>
  );
}
