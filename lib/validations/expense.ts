import { z } from "zod";

// 参加者（債務者）のスキーマ
export const participantSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().int().positive(),
});

// 支出作成スキーマ
export const createExpenseSchema = z
  .object({
    groupId: z.string().cuid(),
    amount: z.number().int().positive().max(10000000), // 1000万円まで
    description: z.string().max(200).optional(),
    participants: z.array(participantSchema).min(1), // 最低1人（払った人以外）
    splitType: z.enum(["equal", "manual"]),
    paidBy: z.string().cuid(),
  })
  .refine(
    (data) => {
      // participants の合計金額が amount と一致するか検証
      const total = data.participants.reduce((sum, p) => sum + p.amount, 0);
      return total === data.amount;
    },
    {
      message: "参加者の金額合計が総額と一致しません",
    }
  );

// 支出更新スキーマ
export const updateExpenseSchema = z.object({
  amount: z.number().int().positive().max(10000000).optional(),
  description: z.string().max(200).optional(),
});

export type Participant = z.infer<typeof participantSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
