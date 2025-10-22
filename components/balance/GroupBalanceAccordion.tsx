// components/balance/GroupBalanceAccordion.tsx
"use client";

import { useState } from "react";
import type { GroupBalance } from "@/lib/utils/cross-group-balance";

type Props = {
  groupBalances: GroupBalance[];
};

export function GroupBalanceAccordion({ groupBalances }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (groupBalances.length <= 1) {
    // Accordion not needed if only 1 group
    return null;
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
                <span className="text-gray-600">{gb.groupName}</span>
              </div>
              <span className="font-medium">¥{gb.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
