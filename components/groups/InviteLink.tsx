"use client";

import { useState } from "react";

interface InviteLinkProps {
  inviteCode: string | null;
}

export function InviteLink({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  if (!inviteCode) {
    return null;
  }

  const inviteUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/groups/join/${inviteCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">招待リンク</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          placeholder="招待リンク"
          className="flex-1 px-3 py-2 border rounded bg-white text-sm"
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <p className="text-xs text-gray-700">
        招待コード: <span className="font-mono font-bold">{inviteCode}</span>
      </p>
    </div>
  );
}
