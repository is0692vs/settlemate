// components/balance/GroupBalanceAccordion.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { GroupBalance } from "@/lib/utils/cross-group-balance";

type Props = {
  groupBalances: GroupBalance[];
};

export function GroupBalanceAccordion({ groupBalances }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (groupBalances.length === 0) {
    return null;
  }

  // If only 1 group, show directly without accordion
  if (groupBalances.length === 1) {
    const gb = groupBalances[0];
    return (
      <div className="mt-2 ml-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {gb.groupIcon && <span>{gb.groupIcon}</span>}
            <Link
              href={`/dashboard/groups/${gb.groupId}`}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
            >
              {gb.groupName}
            </Link>
          </div>
          <span className="font-medium">¥{gb.amount.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>{groupBalances.length}グループの内訳</span>
      </button>

      {isOpen && (
        <div className="mt-2 ml-4 space-y-1 text-sm">
          {groupBalances.map((gb) => (
            <div key={gb.groupId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {gb.groupIcon && <span>{gb.groupIcon}</span>}
                <Link
                  href={`/dashboard/groups/${gb.groupId}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {gb.groupName}
                </Link>
              </div>
              <span className="font-medium">¥{gb.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
