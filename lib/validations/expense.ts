import { z } from "zod";

// 支出作成スキーマ
export const createExpenseSchema = z.object({
  groupId: z.string().cuid(),
  amount: z.number().int().positive().max(10000000), // 1000万円まで
  description: z.string().max(200).optional(),
  participants: z.array(z.string().cuid()).min(2), // 最低2人
  splitType: z.enum(["equal", "manual"]),
  paidBy: z.string().cuid(),
});

// 支出更新スキーマ
export const updateExpenseSchema = z.object({
  amount: z.number().int().positive().max(10000000).optional(),
  description: z.string().max(200).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
