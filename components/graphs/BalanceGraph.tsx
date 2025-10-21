"use client";

import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";

import UserNode from "./UserNode";
import DebtEdge from "./DebtEdge";
import type { UserNodeData, DebtEdgeData } from "@/lib/utils/graph";

// React FlowのスタイルはグローバルCSSでインポート
const nodeTypes = {
  userNode: UserNode,
};

const edgeTypes = {
  debtEdge: DebtEdge,
};

type BalanceGraphProps = {
  nodes: Node<UserNodeData>[];
  edges: Edge<DebtEdgeData>[];
};

export default function BalanceGraph({ nodes, edges }: BalanceGraphProps) {
  // 空データ対応
  if (nodes.length === 0 || edges.length === 0) {
    return (
      <div className="h-[400px] md:h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">残高データがありません</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] md:h-[600px] bg-gray-50 rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
