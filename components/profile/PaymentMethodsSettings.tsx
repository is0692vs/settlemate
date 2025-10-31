// components/profile/PaymentMethodsSettings.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS, type PaymentMethodValue } from "@/lib/constants/payment-methods";

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
  const [selected, setSelected] = useState<PaymentMethodValue[]>(acceptedMethods);
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
      setMessage({ type: "error", text: "少なくとも1つの決済方法を選択してください" });
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
      setMessage({ type: "error", text: error instanceof Error ? error.message : "設定の保存に失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>受付可能な決済方法</CardTitle>
        <CardDescription>
          返済を受け付ける決済方法を選択してください。選択した方法のみが返済フォームに表示されます。
        </CardDescription>
      </CardHeader>
      <CardContent as="form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selected.includes(method.value);

            return (
              <div
                key={method.value}
                onClick={() => toggleMethod(method.value)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}>
                <Checkbox
                  id={method.value}
                  checked={isSelected}
                  onCheckedChange={() => toggleMethod(method.value)}
                  className="pointer-events-none"
                />
                <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <Label htmlFor={method.value} className="cursor-pointer font-medium text-sm">{method.label}</Label>
              </div>
            );
          })}
        </div>

        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || selected.length === 0}>
            {isSubmitting ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}