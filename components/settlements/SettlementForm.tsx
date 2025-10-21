// components/settlements/SettlementForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSettlement } from "@/app/dashboard/groups/[id]/actions";
import {
  DEFAULT_PAYMENT_METHOD_VALUES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_VALUES,
  type PaymentMethodValue,
} from "@/lib/constants/payment-methods";
import type { Prisma } from "@prisma/client";

const paymentMethodEnumValues = PAYMENT_METHOD_VALUES as [
  PaymentMethodValue,
  ...PaymentMethodValue[]
];

const settlementFormSchema = z.object({
  userTo: z.string().min(1, "返済先を選択してください"),
  amount: z
    .number()
    .min(1, "金額は1円以上である必要があります")
    .int("金額は整数である必要があります"),
  method: z.enum(paymentMethodEnumValues),
  description: z
    .string()
    .max(200, "説明は200文字以内である必要があります")
    .optional(),
});

type SettlementFormData = z.infer<typeof settlementFormSchema>;

type BalanceWithUser = {
  userTo: string;
  amount: number;
  toUser: {
    id: string;
    name: string | null;
    image: string | null;
    acceptedPaymentMethods?: Prisma.JsonValue | null;
  } | null;
};

interface SettlementFormProps {
  groupId: string;
  balances: BalanceWithUser[];
}

function normalizeAcceptedMethods(
  value: Prisma.JsonValue | null | undefined
): PaymentMethodValue[] {
  if (Array.isArray(value)) {
    const list = value.filter(
      (item): item is PaymentMethodValue => typeof item === "string"
    );
    if (list.length > 0) {
      return list;
    }
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const list = parsed.filter(
          (item): item is PaymentMethodValue => typeof item === "string"
        );
        if (list.length > 0) {
          return list;
        }
      }
    } catch {
      // ignore parse error
    }
  }

  return [...DEFAULT_PAYMENT_METHOD_VALUES];
}

export default function SettlementForm({
  groupId,
  balances,
}: SettlementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SettlementFormData>({
    resolver: zodResolver(settlementFormSchema),
    defaultValues: {
      userTo: "",
      amount: 0,
      method: DEFAULT_PAYMENT_METHOD_VALUES[0],
      description: "",
    },
  });

  const selectedUserTo = form.watch("userTo");
  const selectedAmount = form.watch("amount");
  const selectedMethod = form.watch("method");

  const selectedBalance = useMemo(
    () => balances.find((balance) => balance.userTo === selectedUserTo),
    [balances, selectedUserTo]
  );

  const maxAmount = selectedBalance?.amount ?? 0;

  const availableMethods: PaymentMethodValue[] = useMemo(() => {
    if (!selectedBalance?.toUser) {
      return [...DEFAULT_PAYMENT_METHOD_VALUES];
    }

    return normalizeAcceptedMethods(
      selectedBalance.toUser.acceptedPaymentMethods ?? null
    );
  }, [selectedBalance]);

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.filter((method) =>
        availableMethods.includes(method.value)
      ),
    [availableMethods]
  );

  useEffect(() => {
    if (paymentOptions.length === 0) {
      form.setValue("method", DEFAULT_PAYMENT_METHOD_VALUES[0]);
      return;
    }

    if (!paymentOptions.some((option) => option.value === selectedMethod)) {
      form.setValue("method", paymentOptions[0].value);
    }
  }, [form, paymentOptions, selectedMethod]);

  const validateAmount = (amount: number) => {
    if (Number.isNaN(amount)) return "有効な数値を入力してください";
    if (amount <= 0) return "金額は1円以上である必要があります";
    if (amount > maxAmount) {
      return `金額は残高（¥${maxAmount.toLocaleString()}）以下である必要があります`;
    }
    return true;
  };

  const isFormValid =
    selectedUserTo &&
    selectedAmount > 0 &&
    selectedAmount <= maxAmount &&
    paymentOptions.length > 0 &&
    !form.formState.errors.userTo &&
    !form.formState.errors.amount &&
    !form.formState.errors.method;

  const validationStatus = {
    userToSelected: !!selectedUserTo,
    amountIsPositive: selectedAmount > 0,
    amountNotExceeded: selectedAmount <= maxAmount,
    methodAvailable: paymentOptions.length > 0,
    noErrors:
      !form.formState.errors.userTo &&
      !form.formState.errors.amount &&
      !form.formState.errors.method,
  };

  const onSubmit = async (data: SettlementFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (
        !selectedUserTo ||
        selectedAmount <= 0 ||
        selectedAmount > maxAmount ||
        paymentOptions.length === 0
      ) {
        setError("入力内容を確認してください");
        setIsSubmitting(false);
        return;
      }

      await createSettlement({
        groupId,
        ...data,
      });
      form.reset({
        userTo: "",
        amount: 0,
        method: DEFAULT_PAYMENT_METHOD_VALUES[0],
        description: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (balances.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-center">
        <p className="text-gray-500">返済する残高がありません</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          返済先
        </label>
        <select
          {...form.register("userTo")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
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
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.userTo.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          返済金額
        </label>
        <input
          type="number"
          {...form.register("amount", {
            validate: validateAmount,
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="返済金額を入力"
        />
        {selectedUserTo && (
          <p className="mt-1 text-sm text-gray-500">
            最大: ¥{maxAmount.toLocaleString()}
          </p>
        )}
        {form.formState.errors.amount && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          返済方法
        </label>
        {paymentOptions.length === 0 ? (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            利用可能な決済方法が設定されていません。
          </p>
        ) : (
          <div className="space-y-2">
            {paymentOptions.map((method) => (
              <label
                key={method.value}
                className="flex items-center rounded-md border border-gray-200 p-2"
              >
                <input
                  type="radio"
                  value={method.value}
                  {...form.register("method")}
                  className="mr-2"
                />
                <span className="mr-2 text-lg" aria-hidden>
                  {method.icon}
                </span>
                <span>
                  {PAYMENT_METHOD_LABELS[method.value] ?? method.label}
                </span>
              </label>
            ))}
          </div>
        )}
        {form.formState.errors.method && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.method.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          メモ（任意）
        </label>
        <textarea
          {...form.register("description")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="メモを入力"
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isFormValid && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-sm font-medium text-amber-900">
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
              {`✓ 金額は残高${
                selectedUserTo ? `（¥${maxAmount.toLocaleString()}）` : ""
              }以下`}
            </li>
            <li
              className={
                validationStatus.methodAvailable
                  ? "line-through text-gray-500"
                  : "text-red-600 font-semibold"
              }
            >
              ✓ 利用可能な決済方法が存在
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
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "送信中..." : "返済を記録"}
      </button>
    </form>
  );
}
