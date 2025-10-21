// lib/validations/settlement.ts
import { z } from "zod";
import {
  PAYMENT_METHOD_VALUES,
  type PaymentMethodValue,
} from "@/lib/constants/payment-methods";

const paymentMethodEnumValues =
  PAYMENT_METHOD_VALUES as [PaymentMethodValue, ...PaymentMethodValue[]];

export const paymentMethodEnum = z.enum(paymentMethodEnumValues);

export const createSettlementSchema = z.object({
  groupId: z.string().min(1, "グループIDが必要です"),
  userTo: z.string().min(1, "債権者が必要です"),
  amount: z
    .number()
    .min(1, "金額は1円以上である必要があります")
    .max(10_000_000, "金額は1000万円以下である必要があります")
    .int("金額は整数である必要があります"),
  method: paymentMethodEnum,
  description: z
    .string()
    .max(200, "説明は200文字以内である必要があります")
    .optional(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
