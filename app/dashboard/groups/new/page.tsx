"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GroupForm from "@/components/groups/GroupForm";
import { createGroup } from "@/lib/api/groups";
import type { CreateGroupInput } from "@/lib/validations/group";

export default function NewGroupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateGroupInput) => {
    try {
      setError(null);
      await createGroup(data);
      router.push("/dashboard/groups");
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "作成に失敗しました";
      setError(message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold mb-6">新規グループ作成</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <GroupForm onSubmit={handleSubmit} submitLabel="作成" />
        </div>
      </div>
    </div>
  );
}
