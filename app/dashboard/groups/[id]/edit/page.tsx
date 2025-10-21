"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GroupForm from "@/components/groups/GroupForm";
import { getGroup, updateGroup } from "@/lib/api/groups";
import type { GroupDetail } from "@/lib/api/groups";
import type { UpdateGroupInput } from "@/lib/validations/group";

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setError(null);
        const data = await getGroup(params.id);
        setGroup(data);
      } catch (err: Error | unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "グループの読み込みに失敗しました";
        setError(message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [params.id]);

  const handleSubmit = async (data: UpdateGroupInput) => {
    try {
      setError(null);
      await updateGroup(params.id, data);
      router.push(`/dashboard/groups/${params.id}`);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "更新に失敗しました";
      setError(message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-md">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-md">
          <p className="text-red-600">{error || "グループが見つかりません"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold mb-6">グループ編集</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <GroupForm
            defaultValues={{
              name: group.name,
              icon: group.icon || "",
            }}
            onSubmit={handleSubmit}
            submitLabel="更新"
          />
        </div>
      </div>
    </div>
  );
}
