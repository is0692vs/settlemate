"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { useState } from "react";

const schema = z.object({
  description: z.string().min(1, "説明を入力してください"),
  amount: z.number().positive("金額は正の数である必要があります"),
  paidBy: z.string().min(1, "支払者を選択してください"),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormProps {
  groupId: string;
  members: User[];
}

export function ExpenseForm({ groupId, members }: ExpenseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      // 均等割りの場合、金額付き配列を生成
      const debtors = members.filter((m) => m.id !== data.paidBy);
      const perPerson = Math.floor(data.amount / members.length);
      const remainder = data.amount % members.length;

      const participants = debtors.map((member, index) => ({
        userId: member.id,
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
          {...register("paidBy")}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {errors.paidBy && (
          <p className="text-red-600 text-sm mt-1">{errors.paidBy.message}</p>
        )}
      </div>

      <p className="text-sm text-gray-600">
        金額はグループメンバー全員で均等に分割されます（{members.length}人）
      </p>

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
