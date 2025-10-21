"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GroupCard from "@/components/groups/GroupCard";
import { getGroups } from "@/lib/api/groups";
import type { Group } from "@/lib/api/groups";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setError(null);
        const data = await getGroups();
        setGroups(data);
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

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">グループ</h1>
          <Link href="/dashboard/groups/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              新規作成
            </button>
          </Link>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* 空状態 */}
        {!loading && groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">グループがありません</p>
            <Link href="/dashboard/groups/new">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                最初のグループを作成
              </button>
            </Link>
          </div>
        )}

        {/* グループ一覧 */}
        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
