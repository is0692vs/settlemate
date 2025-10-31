// components/groups/JoinGroupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroupForm() {
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      setError("招待コードを入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      // 招待コードまたはフルURLから招待コードを抽出
      let code = trimmedCode;
      
      // フルURLの場合は招待コードを抽出
      if (trimmedCode.includes("/groups/join/")) {
        const match = trimmedCode.match(/\/groups\/join\/([^/?]+)/);
        if (match) {
          code = match[1];
        }
      }

      // 招待ページにリダイレクト
      router.push(`/groups/join/${code}`);
    } catch (err) {
      setError("エラーが発生しました");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">招待コードでグループに参加</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
            招待コードまたは招待リンク
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="例: ABC123 または https://..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-600 mt-2">
            招待コードまたは招待リンクを貼り付けてください
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "処理中..." : "参加する"}
        </button>
      </form>
    </div>
  );
}
