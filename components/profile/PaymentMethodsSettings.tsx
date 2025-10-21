// components/profile/PaymentMethodsSettings.tsx
// @path: components/profile/PaymentMethodsSettings.tsx

"use client";

import { useState } from "react";
import {
  DEFAULT_PAYMENT_METHOD_VALUES,
  PAYMENT_METHODS,
  type PaymentMethodValue,
} from "@/lib/constants/payment-methods";

type PaymentMethodsSettingsProps = {
  acceptedMethods: PaymentMethodValue[];
  updateAction: (formData: FormData) => Promise<void>;
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export default function PaymentMethodsSettings({
  acceptedMethods,
  updateAction,
}: PaymentMethodsSettingsProps) {
  const [selected, setSelected] = useState<PaymentMethodValue[]>(
    acceptedMethods.length > 0
      ? acceptedMethods
      : [...DEFAULT_PAYMENT_METHOD_VALUES]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const toggleMethod = (value: PaymentMethodValue) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selected.length === 0) {
      setMessage({
        type: "error",
        text: "少なくとも1つの決済方法を選択してください",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      selected.forEach((value) => formData.append("paymentMethods", value));

      await updateAction(formData);
      setMessage({ type: "success", text: "設定を保存しました" });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "設定の保存に失敗しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        受付可能な決済方法
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        返済を受け付ける決済方法を選択してください。選択した方法のみが返済フォームに表示されます。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selected.includes(method.value);

            return (
              <label
                key={method.value}
                className={`flex cursor-pointer items-center space-x-2 rounded-lg border-2 p-3 transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="paymentMethods"
                  value={method.value}
                  checked={isSelected}
                  onChange={() => toggleMethod(method.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg" aria-hidden>
                  {method.icon}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {method.label}
                </span>
              </label>
            );
          })}
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || selected.length === 0}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "保存中..." : "設定を保存"}
        </button>
      </form>
    </div>
  );
}
