"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGroup, deleteGroup } from "@/lib/api/groups";
import type { GroupDetail } from "@/lib/api/groups";

export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      await deleteGroup(params.id);
      router.push("/dashboard/groups");
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "削除に失敗しました";
      alert(message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-600">{error || "グループが見つかりません"}</p>
          <Link href="/dashboard/groups">
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              グループ一覧に戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {group.icon && <span className="text-5xl">{group.icon}</span>}
            <h1 className="text-3xl font-bold">{group.name}</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/groups/${group.id}/edit`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                編集
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </div>

        {/* メンバー一覧 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            メンバー ({group.members.length})
          </h2>
          {group.members.length === 0 ? (
            <p className="text-gray-500">メンバーがいません</p>
          ) : (
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
