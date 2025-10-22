// lib/validations/user.ts
// @path: lib/validations/user.ts

import { z } from "zod";
import {
  DEFAULT_PAYMENT_METHOD_VALUES,
  PAYMENT_METHOD_VALUES,
  type PaymentMethodValue,
} from "@/lib/constants/payment-methods";

const paymentMethodEnumValues = PAYMENT_METHOD_VALUES as [
  PaymentMethodValue,
  ...PaymentMethodValue[]
];

export const updateUserSettingsSchema = z.object({
  acceptedPaymentMethods: z
    .array(z.enum(paymentMethodEnumValues))
    .min(1, "少なくとも1つの決済方法を選択してください")
    .default([...DEFAULT_PAYMENT_METHOD_VALUES])
    .optional(),
  displayName: z.string().min(1).max(50).optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
