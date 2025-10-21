// lib/validations/group.ts
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(50, "グループ名は50文字以内である必要があります"),
  icon: z.string().emoji("絵文字1文字である必要があります").optional(),
});

export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50, "グループ名は50文字以内である必要があります")
    .optional(),
  icon: z.string().emoji("絵文字1文字である必要があります").optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
