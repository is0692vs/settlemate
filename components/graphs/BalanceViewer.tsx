// components/graphs/BalanceViewer.tsx
"use client";

import { useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { UserNodeData, DebtEdgeData } from "@/lib/utils/graph";
import BalanceGraph from "./BalanceGraph";
import BalanceList, { type BalanceWithUser } from "./BalanceList";
import BalanceViewToggle from "./BalanceViewToggle";

interface BalanceViewerProps {
  nodes: Node<UserNodeData>[];
  edges: Edge<DebtEdgeData>[];
  balances: BalanceWithUser[];
  currentUserId: string;
}

export default function BalanceViewer({
  nodes,
  edges,
  balances,
  currentUserId,
}: BalanceViewerProps) {
  const [view, setView] = useState<"graph" | "list">("graph");

  return (
    <div className="space-y-4">
      {/* 切り替えUI */}
      <div className="flex justify-end">
        <BalanceViewToggle view={view} onViewChange={setView} />
      </div>

      {/* 条件付きレンダリング */}
      {view === "graph" ? (
        <BalanceGraph nodes={nodes} edges={edges} />
      ) : (
        <BalanceList balances={balances} currentUserId={currentUserId} />
      )}
    </div>
  );
}
