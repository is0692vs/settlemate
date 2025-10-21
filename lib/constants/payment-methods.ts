// lib/constants/payment-methods.ts
// @path: lib/constants/payment-methods.ts

export const PAYMENT_METHODS = [
  { value: "cash", label: "現金", icon: "💵" },
  { value: "bank_transfer", label: "銀行振込", icon: "🏦" },
  { value: "paypay", label: "PayPay", icon: "💰" },
  { value: "line_pay", label: "LINE Pay", icon: "💳" },
  { value: "rakuten_pay", label: "楽天ペイ", icon: "💴" },
  { value: "apple_pay", label: "Apple Pay", icon: "🍎" },
  { value: "merpay", label: "メルペイ", icon: "💚" },
  { value: "au_pay", label: "au PAY", icon: "🔵" },
  { value: "d_pay", label: "d払い", icon: "📱" },
  { value: "transportation_ic", label: "交通系IC", icon: "🎫" },
  { value: "credit_card", label: "クレジットカード", icon: "💳" },
  { value: "other", label: "その他", icon: "✏️" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

export const PAYMENT_METHOD_VALUES: PaymentMethodValue[] = PAYMENT_METHODS.map(
  (method) => method.value
);

export const DEFAULT_PAYMENT_METHOD_VALUES: PaymentMethodValue[] = [
  "cash",
  "bank_transfer",
  "paypay",
  "line_pay",
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "現金",
  bank_transfer: "銀行振込",
  paypay: "PayPay",
  line_pay: "LINE Pay",
  rakuten_pay: "楽天ペイ",
  apple_pay: "Apple Pay",
  merpay: "メルペイ",
  au_pay: "au PAY",
  d_pay: "d払い",
  transportation_ic: "交通系IC",
  credit_card: "クレジットカード",
  other: "その他",
};
