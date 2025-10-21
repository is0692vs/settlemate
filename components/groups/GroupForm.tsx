"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGroupSchema,
  type CreateGroupInput,
} from "@/lib/validations/group";

type Props = {
  defaultValues?: { name: string; icon?: string };
  onSubmit: (data: CreateGroupInput) => Promise<void>;
  submitLabel: string;
};

export default function GroupForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          グループ名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border rounded"
          placeholder="例：旅行グループ"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          アイコン（絵文字1文字）
        </label>
        <input
          {...register("icon")}
          className="w-full px-3 py-2 border rounded"
          placeholder="🏠"
          maxLength={2}
        />
        {errors.icon && (
          <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}
