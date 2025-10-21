// components/settlements/SettlementForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createSettlement } from "@/app/dashboard/groups/[id]/actions";
import { z } from "zod";

const settlementFormSchema = z.object({
  userTo: z.string().min(1, "返済先を選択してください"),
  amount: z.coerce
    .number()
    .min(1, "金額は1円以上である必要があります")
    .int("金額は整数である必要があります"),
  method: z.enum(["cash", "bank_transfer", "paypay", "line_pay"]),
  description: z
    .string()
    .max(200, "説明は200文字以内である必要があります")
    .optional(),
});

type SettlementFormData = z.infer<typeof settlementFormSchema>;

interface SettlementFormProps {
  groupId: string;
  balances: Array<{
    userTo: string;
    amount: number;
    toUser: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  }>;
}

export default function SettlementForm({
  groupId,
  balances,
}: SettlementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(settlementFormSchema),
    defaultValues: {
      userTo: "",
      amount: 0,
      method: "cash" as const,
      description: "",
    },
  });

  const selectedUserTo = form.watch("userTo");
  const selectedAmount = form.watch("amount") as number;
  const maxAmount =
    balances.find((b) => b.userTo === selectedUserTo)?.amount || 0;

  const validateAmount = (amount: unknown) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "有効な数値を入力してください";
    if (numAmount <= 0) return "金額は1円以上である必要があります";
    if (numAmount > maxAmount) {
      return `金額は残高（¥${maxAmount.toLocaleString()}）以下である必要があります`;
    }
    return true;
  };

  // フロント側でのバリデーション：送信ボタンの有効性を判定
  const isFormValid =
    selectedUserTo &&
    selectedAmount > 0 &&
    selectedAmount <= maxAmount &&
    !form.formState.errors.userTo &&
    !form.formState.errors.amount &&
    !form.formState.errors.method;

  // バリデーション状態をチェック
  const validationStatus = {
    userToSelected: !!selectedUserTo,
    amountIsPositive: selectedAmount > 0,
    amountNotExceeded: selectedAmount <= maxAmount,
    noErrors:
      !form.formState.errors.userTo &&
      !form.formState.errors.amount &&
      !form.formState.errors.method,
  };

  const onSubmit = async (data: SettlementFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // クライアント側での最終チェック
      if (
        !selectedUserTo ||
        selectedAmount <= 0 ||
        selectedAmount > maxAmount
      ) {
        setError("入力内容を確認してください");
        setIsSubmitting(false);
        return;
      }

      await createSettlement({
        groupId,
        ...data,
      });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (balances.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">返済する残高がありません</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          返済先
        </label>
        <select
          {...form.register("userTo")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">選択してください</option>
          {balances.map((balance) => (
            <option key={balance.userTo} value={balance.userTo}>
              {balance.toUser?.name || "名前未設定"} - ¥
              {balance.amount.toLocaleString()}
            </option>
          ))}
        </select>
        {form.formState.errors.userTo && (
          <p className="text-red-600 text-sm mt-1">
            {form.formState.errors.userTo.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          返済金額
        </label>
        <input
          type="number"
          {...form.register("amount", { validate: validateAmount })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="返済金額を入力"
        />
        {selectedUserTo && (
          <p className="text-gray-500 text-sm mt-1">
            最大: ¥{maxAmount.toLocaleString()}
          </p>
        )}
        {form.formState.errors.amount && (
          <p className="text-red-600 text-sm mt-1">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          返済方法
        </label>
        <div className="space-y-2">
          {[
            { value: "cash", label: "💵 現金" },
            { value: "bank_transfer", label: "🏦 銀行振込" },
            { value: "paypay", label: "💰 PayPay" },
            { value: "line_pay", label: "💳 LINE Pay" },
          ].map((method) => (
            <label key={method.value} className="flex items-center">
              <input
                type="radio"
                value={method.value}
                {...form.register("method")}
                className="mr-2"
              />
              <span>{method.label}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.method && (
          <p className="text-red-600 text-sm mt-1">
            {form.formState.errors.method.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ（任意）
        </label>
        <textarea
          {...form.register("description")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="メモを入力"
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-red-600 text-sm mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* バリデーション条件の表示（無効な場合のみ）*/}
      {!isFormValid && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm font-medium text-amber-900 mb-2">
            ⚠️ 以下の条件を満たしてください：
          </p>
          <ul className="space-y-1 text-xs text-amber-800">
            <li
              className={
                validationStatus.userToSelected
                  ? "line-through text-gray-500"
                  : ""
              }
            >
              ✓ 返済先を選択
            </li>
            <li
              className={
                validationStatus.amountIsPositive
                  ? "line-through text-gray-500"
                  : ""
              }
            >
              ✓ 金額は1円以上
            </li>
            <li
              className={
                validationStatus.amountNotExceeded
                  ? "line-through text-gray-500"
                  : "text-red-600 font-semibold"
              }
            >
              {`✓ 金額は残高${selectedUserTo ? `（¥${maxAmount.toLocaleString()}）` : ""}以下`}
            </li>
            <li
              className={
                validationStatus.noErrors ? "line-through text-gray-500" : ""
              }
            >
              ✓ すべてのフィールドが正しく入力
            </li>
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "送信中..." : "返済を記録"}
      </button>
    </form>
  );
}
