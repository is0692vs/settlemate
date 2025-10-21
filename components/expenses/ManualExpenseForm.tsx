"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { useState } from "react";

const debtorSchema = z.object({
  userId: z.string().min(1, "債務者を選択してください"),
  amount: z.number().positive("金額は正の数である必要があります"),
});

const schema = z.object({
  description: z.string().min(1, "説明を入力してください"),
  amount: z.number().positive("金額は正の数である必要があります"),
  paidBy: z.string().min(1, "支払者を選択してください"),
  debtors: z
    .array(debtorSchema)
    .min(1, "少なくとも1人の債務者を追加してください"),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      debtors: [{ userId: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "debtors",
  });

  const paidBy = watch("paidBy");
  const debtors = watch("debtors");
  const totalAmount = watch("amount") || 0;
  const totalDebt = debtors.reduce(
    (sum, debtor) => sum + (debtor.amount || 0),
    0
  );

  const availableDebtors = (currentDebtorId?: string) => {
    const selectedIds = debtors
      .map((d) => d.userId)
      .filter((id) => id && id !== currentDebtorId);
    return members.filter(
      (m) => m.id !== paidBy && !selectedIds.includes(m.id)
    );
  };

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
          participants: data.debtors,
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
        <label className="block text-sm font-medium mb-1">総額</label>
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
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">債務者</label>
          <button
            type="button"
            onClick={() => append({ userId: "", amount: 0 })}
            disabled={!paidBy}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            + 追加
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <select
                {...register(`debtors.${index}.userId`)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!paidBy}
              >
                <option value="">選択してください</option>
                {availableDebtors(debtors[index]?.userId).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                {...register(`debtors.${index}.amount`, {
                  valueAsNumber: true,
                })}
                className="w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="金額"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.debtors && (
          <p className="text-red-600 text-sm mt-1">
            {errors.debtors.message || "債務者を正しく入力してください"}
          </p>
        )}
        {!paidBy && (
          <p className="text-gray-700 text-sm mt-1">
            先に支払った人を選択してください
          </p>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 p-3 rounded">
        <p className="text-sm">
          債務合計: ¥{totalDebt.toLocaleString()} / 総額: ¥
          {totalAmount.toLocaleString()}
        </p>
        {totalDebt !== totalAmount && totalAmount > 0 && (
          <p className="text-red-600 text-sm mt-1">
            ⚠️ 債務の合計が総額と一致しません
          </p>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          💡
          手動登録モード：支払った人に対して複数人が異なる金額を借りた場合に使います
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || totalDebt !== totalAmount}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "作成中..." : "支出を作成"}
      </button>
    </form>
  );
}
