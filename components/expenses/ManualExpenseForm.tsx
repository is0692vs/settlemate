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
  borrowerId: z.string().min(1, "借りた人を選択してください"),
});

type FormData = z.infer<typeof schema>;

interface ManualExpenseFormProps {
  groupId: string;
  members: User[];
}

export function ManualExpenseForm({
  groupId,
  members,
}: ManualExpenseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const paidBy = watch("paidBy");
  const availableBorrowers = members.filter((m) => m.id !== paidBy);

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
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
          splitType: "manual",
          participants: [data.paidBy, data.borrowerId],
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
          placeholder="立て替え金"
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
          placeholder="5000"
        />
        {errors.amount && (
          <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">支払った人</label>
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

      <div>
        <label className="block text-sm font-medium mb-1">借りた人</label>
        <select
          {...register("borrowerId")}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!paidBy}
        >
          <option value="">選択してください</option>
          {availableBorrowers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {errors.borrowerId && (
          <p className="text-red-600 text-sm mt-1">
            {errors.borrowerId.message}
          </p>
        )}
        {!paidBy && (
          <p className="text-gray-500 text-sm mt-1">
            先に支払った人を選択してください
          </p>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          💡
          手動登録モード：支払った人から借りた人への1対1の貸し借りを記録します
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
