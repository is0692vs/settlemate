// components/groups/DeleteGroupButton.tsx
"use client";

import { useTransition } from "react";

type Props = {
  onDelete: () => Promise<void>;
};

export default function DeleteGroupButton({ onDelete }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }

    startTransition(() => {
      onDelete().catch((err) => {
        if (err && typeof err === "object") {
          const digest = (err as { digest?: string }).digest;
          if (digest === "NEXT_REDIRECT") {
            throw err;
          }
        }

        const message =
          err instanceof Error ? err.message : "削除に失敗しました";
        alert(message);
        console.error(err);
      });
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
      disabled={isPending}
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
